import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { processarCPF, cpfJaExiste, maskCPFForLogs, registrarAuditoriaCPF } from '../utils/cpfUtils';


const APP_ID = 'registro-itec-dcbc4';
const usersCollection = db.collection(`artifacts/${APP_ID}/users`);


async function createAlunoInFirebase(dados: any): Promise<string> {
  try {
    const alunoData = {
      nome: dados.nome,
      cpf: dados.cpf,
      email: dados.email,
      type: 'aluno',
      polo: dados.polo || '',
      localEstagio: dados.localEstagio || '',
      professorOrientador: dados.professorOrientador || '',
      statusMatricula: dados.statusMatricula || 'Ativo',
      turma: dados.turma || '',
      telefone: dados.telefone || '',
      faltasEstagio: dados.faltasEstagio || 0,
      horasTotais: dados.horasTotais || 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const docRef = await usersCollection.add(alunoData);

    return docRef.id;
  } catch (error: any) {
    console.error('[alunosController] Erro ao criar aluno:', error);
    throw error;
  }
}


async function getAlunosFromFirebase(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists || doc.data()?.type !== "aluno") {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }
    return res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    return res.status(500).json({ error: "Erro ao buscar aluno", details: error.matricula });
  }
}




async function getAlunoFromFirebase(firebaseId: string): Promise<any | null> {
  try {
    const doc = await usersCollection.doc(firebaseId).get();

    if (doc.exists) {
      const data = doc.data();

      let nome = '';
      let matricula = data?.matricula || '';

      if (data?.nomeOriginal) {
        nome = data.nomeOriginal;
        matricula = data.matriculaOriginal || data.matricula;
      } else if (data?.matricula) {
        const lines = data.matricula.split('\n');
        nome = lines[0] || 'Sem título';
        matricula = lines.slice(2).join('\n') || data.matricula;
      }

      return {
        id: doc.id,
        nome,
        matricula,
        email: data?.email || data?.senderId || 'Admin',
        polo: data?.polo || '',
        categoria: data?.categoria || 'geral',
        tags: data?.tags || [],
        imagens: data?.imagens || (data?.imageUrl ? [data.imageUrl] : []),
      };
    }

    return null;
  } catch (error: any) {
    console.error('❌ Erro ao buscar aluno:', error);
    throw error;
  }
}


async function updateAlunoInFirebase(firebaseId: string, dados: any): Promise<void> {
  try {
    const updateData: any = {
      nome: dados.nome,
      matricula: dados.matricula,
      polo: dados.polo || '',
      categoria: dados.categoria || 'geral',
      tags: dados.tags || [],
      imagens: dados.imagens || [],
      updatedAt: FieldValue.serverTimestamp(),
      imageUrl: dados.imagens && dados.imagens.length > 0 ? dados.imagens[0] : null
    };

    // Adiciona CPF se fornecido (já validado anteriormente)
    if (dados.cpf !== undefined) {
      updateData.cpf = dados.cpf;
    }

    // Adiciona outros campos se fornecidos
    if (dados.email !== undefined) updateData.email = dados.email;
    if (dados.localEstagio !== undefined) updateData.localEstagio = dados.localEstagio;
    if (dados.professorOrientador !== undefined) updateData.professorOrientador = dados.professorOrientador;
    if (dados.statusMatricula !== undefined) updateData.statusMatricula = dados.statusMatricula;
    if (dados.turma !== undefined) updateData.turma = dados.turma;
    if (dados.telefone !== undefined) updateData.telefone = dados.telefone;

    await usersCollection.doc(firebaseId).update(updateData);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar aluno:', error);
    throw error;
  }
}

async function deleteAlunoFromFirebase(firebaseId: string): Promise<void> {
  try {
    await usersCollection.doc(firebaseId).delete();
  } catch (error: any) {
    console.error('❌ Erro ao deletar aluno:', error);
    throw error;
  }
}

export class alunosController {

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, cpf, email, polo, localEstagio, professorOrientador, statusMatricula, turma, telefone } = req.body;

      const nomeTrimmed = nome?.toString().trim();
      const cpfTrimmed = cpf?.toString().trim();
      const emailTrimmed = email?.toString().trim();

      if (!nomeTrimmed || !cpfTrimmed || !emailTrimmed) {
        res.status(400).json({
          error: 'Nome, CPF e email são obrigatórios',
          details: {
            nomeRecebido: !!nome,
            cpfRecebido: !!cpf,
            emailRecebido: !!email,
            nomeTrimmed: !!nomeTrimmed,
            cpfTrimmed: !!cpfTrimmed,
            emailTrimmed: !!emailTrimmed
          }
        });
        return;
      }

      // Validação de CPF
      const resultadoCPF = processarCPF(cpfTrimmed);
      if (!resultadoCPF.valido) {
        console.warn(`[alunosController] Tentativa de criar aluno com CPF inválido: ${maskCPFForLogs(cpfTrimmed)}`);
        res.status(400).json({
          error: resultadoCPF.erro || 'CPF inválido'
        });
        return;
      }

      // Verifica se CPF já existe
      const cpfExistente = await cpfJaExiste(db, resultadoCPF.cpfSanitizado, 'alunos');
      if (cpfExistente) {
        console.warn(`[alunosController] Tentativa de criar aluno com CPF duplicado: ${maskCPFForLogs(resultadoCPF.cpfSanitizado)}`);
        res.status(409).json({
          error: 'CPF já cadastrado no sistema'
        });
        return;
      }

      const dadosAluno = {
        nome: nomeTrimmed,
        cpf: resultadoCPF.cpfSanitizado, // CPF sanitizado (apenas números)
        email: emailTrimmed,
        polo: polo || '',
        localEstagio: localEstagio || '',
        professorOrientador: professorOrientador || '',
        statusMatricula: statusMatricula || 'Ativo',
        turma: turma || '',
        telefone: telefone || ''
      };

      const firebaseId = await createAlunoInFirebase(dadosAluno);

      // Log de auditoria LGPD
      registrarAuditoriaCPF({
        timestamp: new Date(),
        operation: 'CREATE',
        userId: (req as any).user?.uid || 'unknown',
        collection: 'alunos',
        recordId: firebaseId,
        cpfMasked: maskCPFForLogs(resultadoCPF.cpfSanitizado),
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(201).json({
        message: 'Aluno criado com sucesso',
        id: firebaseId,
        aluno: { ...dadosAluno, id: firebaseId, type: 'aluno' }
      });
    } catch (error: any) {
      console.error('❌ Erro ao criar aluno:', error);
      res.status(500).json({
        error: 'Erro ao criar aluno',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { polo, categoria } = req.query;

      const MAX_ALUNOS = 500;
      let alunos: any[] = [];
      let query = usersCollection.where('type', '==', 'aluno');
      let snapshot = await query.get();

      // Primeiro lote
      for (const doc of snapshot.docs) {
        if (alunos.length >= MAX_ALUNOS) break;
        alunos.push({ id: doc.id, ...doc.data() });
      }

      console.log(`📊 Primeiro lote de alunos: ${alunos.length}`);

      // Se há documentos e ainda não atingimos o limite, continuar buscando a partir do último
      while (snapshot.docs.length === 50 && alunos.length < MAX_ALUNOS) {
        const lastDoc = snapshot.docs.at(-1);
        if (!lastDoc) break;
        
        snapshot = await query.startAfter(lastDoc).get();
        
        for (const doc of snapshot.docs) {
          if (alunos.length >= MAX_ALUNOS) break;
          alunos.push({ id: doc.id, ...doc.data() });
        }
        
        console.log(`📊 Lote adicional: ${snapshot.docs.length} documentos. Total acumulado: ${alunos.length}`);
      }

      console.log(`📊 Total de alunos retornados do Firestore: ${alunos.length} (limite: ${MAX_ALUNOS})`);

      if (polo) {
        alunos = alunos.filter((c: any) =>
          typeof c.polo === 'string' && c.polo.toLowerCase().includes((polo as string).toLowerCase())
        );
      }

      if (categoria) {
        alunos = alunos.filter((c: any) =>
          typeof c.categoria === 'string' && c.categoria.toLowerCase() === (categoria as string).toLowerCase()
        );
      }

      console.log(`✅ Total de alunos após filtros: ${alunos.length}`);

      // Headers para evitar cache
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');

      res.json({
        alunos,
        total: alunos.length,
        filtros: { polo, categoria }
      });
    } catch (error: any) {
      console.error('❌ Erro ao listar alunos:', error);
      res.status(500).json({ error: error.matricula });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const aluno = await getAlunoFromFirebase(id);

      if (!aluno) {
        res.status(404).json({ error: 'aluno não encontrado' });
        return;
      }

      res.json(aluno);
    } catch (error: any) {
      console.error('❌ Erro ao buscar aluno:', error);
      res.status(500).json({ error: error.matricula });
    }
  }

  async editar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, cpf, matricula, email, polo, categoria, tags, imagens, existingImages, localEstagio, professorOrientador, statusMatricula, turma, telefone } = req.body;

      const currentData = await getAlunoFromFirebase(id);

      if (!currentData) {
        res.status(404).json({ error: 'aluno não encontrado' });
        return;
      }

      // Validação de CPF se fornecido e diferente do atual
      let cpfSanitizado = currentData.cpf;
      if (cpf && cpf !== currentData.cpf) {
        const resultadoCPF = processarCPF(cpf);
        if (!resultadoCPF.valido) {
          console.warn(`[alunosController] Tentativa de atualizar aluno com CPF inválido: ${maskCPFForLogs(cpf)}`);
          res.status(400).json({
            error: resultadoCPF.erro || 'CPF inválido'
          });
          return;
        }

        // Verifica se CPF já existe em outro aluno
        const cpfExistente = await cpfJaExiste(db, resultadoCPF.cpfSanitizado, 'alunos', id);
        if (cpfExistente) {
          console.warn(`[alunosController] Tentativa de atualizar aluno com CPF duplicado: ${maskCPFForLogs(resultadoCPF.cpfSanitizado)}`);
          res.status(409).json({
            error: 'CPF já cadastrado em outro aluno'
          });
          return;
        }

        cpfSanitizado = resultadoCPF.cpfSanitizado;

        // Log de auditoria LGPD
        registrarAuditoriaCPF({
          timestamp: new Date(),
          operation: 'UPDATE',
          userId: (req as any).user?.uid || 'unknown',
          collection: 'alunos',
          recordId: id,
          cpfMasked: maskCPFForLogs(resultadoCPF.cpfSanitizado),
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
      }

      let processedTags = tags || currentData.tags || [];
      if (typeof tags === 'string') {
        try {
          processedTags = JSON.parse(tags);
        } catch {
          processedTags = [tags];
        }
      }

      let processedExistingImages: any[] = existingImages || [];
      if (typeof existingImages === 'string') {
        try {
          processedExistingImages = JSON.parse(existingImages);
        } catch {
          processedExistingImages = existingImages ? [existingImages] : [];
        }
      }

      let finalImages = [...(processedExistingImages || [])];
      if (Array.isArray(imagens) && imagens.length > 0) {
        finalImages = [...finalImages, ...imagens];
      }


      const dadosAtualizacao = {
        nome: nome ? nome.trim() : currentData.nome,
        cpf: cpfSanitizado,
        matricula: matricula ? matricula.trim() : currentData.matricula,
        email: email !== undefined ? email : currentData.email,
        polo: polo !== undefined ? polo : currentData.polo,
        categoria: categoria || currentData.categoria,
        tags: processedTags,
        imagens: finalImages,
        localEstagio: localEstagio !== undefined ? localEstagio : currentData.localEstagio,
        professorOrientador: professorOrientador !== undefined ? professorOrientador : currentData.professorOrientador,
        statusMatricula: statusMatricula !== undefined ? statusMatricula : currentData.statusMatricula,
        turma: turma !== undefined ? turma : currentData.turma,
        telefone: telefone !== undefined ? telefone : currentData.telefone
      };

      await updateAlunoInFirebase(id, dadosAtualizacao);

      const alunoAtualizado = await getAlunoFromFirebase(id);

      res.json({
        matricula: 'aluno atualizado com sucesso',
        id,
        aluno: alunoAtualizado
      });
    } catch (error: any) {
      console.error('❌ Erro ao editar aluno:', error);
      res.status(500).json({ error: error.matricula });
    }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const alunoData = await getAlunoFromFirebase(id);

      if (!alunoData) {
        res.status(404).json({ error: 'aluno não encontrado' });
        return;
      }

      await deleteAlunoFromFirebase(id);

      res.json({
        matricula: 'aluno deletado com sucesso',
        id
      });
    } catch (error: any) {
      console.error('❌ Erro ao deletar aluno:', error);
      res.status(500).json({ error: error.matricula });
    }
  }
}
export default new alunosController();
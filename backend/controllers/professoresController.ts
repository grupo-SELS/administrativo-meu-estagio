import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { processarCPF, cpfJaExiste, maskCPFForLogs, registrarAuditoriaCPF } from '../utils/cpfUtils';


const APP_ID = 'registro-itec-dcbc4';

const usersCollection = db.collection(`artifacts/${APP_ID}/users`);


async function createProfessorInFirebase(dados: any): Promise<string> {
  try {
    const professorData = {
      nome: dados.nome,
      cpf: dados.cpf,
      type: 'professor',
      localEstagio: dados.localEstagio || '',
      createdAt: FieldValue.serverTimestamp(),
      polo: dados.polo || '',
      email: dados.email || ''
    };

    const docRef = await usersCollection.add(professorData);
    const snap = await docRef.get();
    return docRef.id;
  } catch (error: any) {
    console.error('[professoresController] Erro ao criar professor:', error);
    throw error;
  }
}

async function getProfessoresFromFirebase(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists || doc.data()?.type !== "professor") {
      return res.status(404).json({ error: "Professor não encontrado" });
    }
    return res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    return res.status(500).json({ error: "Erro ao buscar professor", details: error });
  }
}




async function getProfessorFromFirebase(firebaseId: string): Promise<any | null> {
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
        email: data?.email || data?.senderId || 'Admin',
        polo: data?.polo || ''
      };
    }

    return null;
  } catch (error: any) {
    console.error('❌ Erro ao buscar professor:', error);
    throw error;
  }
}


async function uptadeProfessorInFirebase(firebaseId: string, dados: any): Promise<void> {
  try {
    const updateData: any = {
      nome: dados.nome,
      polo: dados.polo || '',
      updatedAt: FieldValue.serverTimestamp()
    };

    // Adiciona CPF se fornecido (já validado anteriormente)
    if (dados.cpf !== undefined) {
      updateData.cpf = dados.cpf;
    }

    // Adiciona outros campos se fornecidos
    if (dados.email !== undefined) updateData.email = dados.email;
    if (dados.localEstagio !== undefined) updateData.localEstagio = dados.localEstagio;
    if (dados.matricula !== undefined) updateData.matricula = dados.matricula;

    await usersCollection.doc(firebaseId).update(updateData);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar professor:', error);
    throw error;
  }
}

async function deleteProfessorFromFirebase(firebaseId: string): Promise<void> {
  try {
    await usersCollection.doc(firebaseId).delete();
  } catch (error: any) {
    console.error('❌ Erro ao deletar professor:', error);
    throw error;
  }
}

export class professoresController {
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, cpf, email, polo, localEstagio } = req.body;

      if (!nome || nome.trim() === '') {
        res.status(400).json({
          error: 'Nome é obrigatório'
        });
        return;
      }

      const nomeTrimmed = nome.toString().trim();
      const cpfTrimmed = cpf?.toString().trim();

      // Validação de CPF
      if (!cpfTrimmed) {
        res.status(400).json({
          error: 'CPF é obrigatório'
        });
        return;
      }

      const resultadoCPF = processarCPF(cpfTrimmed);
      if (!resultadoCPF.valido) {
        console.warn(`[professoresController] Tentativa de criar professor com CPF inválido: ${maskCPFForLogs(cpfTrimmed)}`);
        res.status(400).json({
          error: resultadoCPF.erro || 'CPF inválido'
        });
        return;
      }

      // Verifica se CPF já existe
      const cpfExistente = await cpfJaExiste(db, resultadoCPF.cpfSanitizado, 'professores');
      if (cpfExistente) {
        console.warn(`[professoresController] Tentativa de criar professor com CPF duplicado: ${maskCPFForLogs(resultadoCPF.cpfSanitizado)}`);
        res.status(409).json({
          error: 'CPF já cadastrado no sistema'
        });
        return;
      }

      const dadosProfessor = {
        nome: nomeTrimmed,
        cpf: resultadoCPF.cpfSanitizado, // CPF sanitizado (apenas números)
        email: email || '',
        polo: polo || '',
        localEstagio: localEstagio || ''
      };

      const firebaseId = await createProfessorInFirebase(dadosProfessor);

      // Log de auditoria LGPD
      registrarAuditoriaCPF({
        timestamp: new Date(),
        operation: 'CREATE',
        userId: (req as any).user?.uid || 'unknown',
        collection: 'professores',
        recordId: firebaseId,
        cpfMasked: maskCPFForLogs(resultadoCPF.cpfSanitizado),
        ip: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(201).json({
        message: 'Professor criado com sucesso',
        id: firebaseId,
        professor: { ...dadosProfessor, id: firebaseId }
      });
    } catch (error: any) {
      console.error('❌ [professoresController.criar] Erro:', error);
      console.error('❌ [professoresController.criar] Stack:', error.stack);
      res.status(500).json({
        error: 'Erro ao criar professor',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { polo, limite = 50 } = req.query;

      const snapshot = await usersCollection.where('type', '==', 'professor').get();
      let professores: any[] = [];
      snapshot.forEach(doc => {
        professores.push({ id: doc.id, ...doc.data() });
      });

      if (polo) {
        professores = professores.filter((c: any) =>
          typeof c.polo === 'string' && c.polo.toLowerCase().includes((polo as string).toLowerCase())
        );
      }

      const limiteNum = Number(limite);
      if (limiteNum > 0) {
        professores = professores.slice(0, limiteNum);
      }

      res.json({
        professores,
        total: professores.length,
        filtros: { polo, limite }
      });
    } catch (error: any) {
      console.error('❌ Erro ao listar professor:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const professor = await getProfessorFromFirebase(id);

      if (!professor) {
        res.status(404).json({ error: 'professor não encontrado' });
        return;
      }

      res.json(professor);
    } catch (error: any) {
      console.error('❌ Erro ao buscar professor:', error);
      res.status(500).json({ error: error });
    }
  }

  async editar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { nome, cpf, matricula, email, polo, localEstagio, categoria, tags, imagens, existingImages } = req.body;

      const currentData = await getProfessorFromFirebase(id);

      if (!currentData) {
        res.status(404).json({ error: 'professor não encontrado' });
        return;
      }

      // Validação de CPF se fornecido e diferente do atual
      let cpfSanitizado = currentData.cpf;
      if (cpf && cpf !== currentData.cpf) {
        const resultadoCPF = processarCPF(cpf);
        if (!resultadoCPF.valido) {
          console.warn(`[professoresController] Tentativa de atualizar professor com CPF inválido: ${maskCPFForLogs(cpf)}`);
          res.status(400).json({
            error: resultadoCPF.erro || 'CPF inválido'
          });
          return;
        }

        // Verifica se CPF já existe em outro professor
        const cpfExistente = await cpfJaExiste(db, resultadoCPF.cpfSanitizado, 'professores', id);
        if (cpfExistente) {
          console.warn(`[professoresController] Tentativa de atualizar professor com CPF duplicado: ${maskCPFForLogs(resultadoCPF.cpfSanitizado)}`);
          res.status(409).json({
            error: 'CPF já cadastrado em outro professor'
          });
          return;
        }

        cpfSanitizado = resultadoCPF.cpfSanitizado;

        // Log de auditoria LGPD
        registrarAuditoriaCPF({
          timestamp: new Date(),
          operation: 'UPDATE',
          userId: (req as any).user?.uid || 'unknown',
          collection: 'professores',
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
        email: email !== undefined ? email : currentData.email,
        polo: polo !== undefined ? polo : currentData.polo,
        localEstagio: localEstagio !== undefined ? localEstagio : currentData.localEstagio
      };

      await uptadeProfessorInFirebase(id, dadosAtualizacao);

      const professorAtualizado = await getProfessorFromFirebase(id);

      res.json({
        matricula: 'professor atualizado com sucesso',
        id,
        professor: professorAtualizado
      });
    } catch (error: any) {
      console.error('❌ Erro ao editar professor:', error);
      res.status(500).json({ error: error.matricula });
    }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const professorData = await getProfessorFromFirebase(id);

      if (!professorData) {
        res.status(404).json({ error: 'Professor não encontrado' });
        return;
      }

      await deleteProfessorFromFirebase(id);

      res.json({
        message: 'Professor deletado com sucesso',
        id
      });
    } catch (error: any) {
      console.error('❌ Erro ao deletar professor:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
export default new professoresController();
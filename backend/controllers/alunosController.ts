import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';


const APP_ID = 'registro-itec-dcbc4';

const usersCollection = db.collection(`artifacts/${APP_ID}/users`);


async function createAlunoInFirebase(dados: any): Promise<string> {
  try {
    const agora = new Date();
    const alunonData = {
      nome: dados.nome,
      matricula: dados.matricula,
      type: 'aluno',
      localEstagio: dados.localEstagio,
      horasTotais: dados.horasTotais,
      professorOrientador: dados.professorOrientador || '',
      createdAt: FieldValue.serverTimestamp(),
      polo: ['Volta Redonda', 'Resende', 'Angra dos Reis'],
      email: dados.email,
      statusMatricula: ['Ativo', 'Inativo', 'Bloqueado']
    };

    console.log('[alunosController] Criando aluno em notifications:', alunonData.nome);
    const docRef = await usersCollection.add(alunonData);
    console.log(`[alunosController] aluno criado com ID: ${docRef.id}`);

    // Confirmação imediata
    const snap = await docRef.get();
    console.log('[alunosController] snapshot.exists:', snap.exists);
    return docRef.id;
  } catch (error: any) {
    console.error('[alunosController] Erro ao criar aluno:', error);
    throw error;
  }
}

// Lê alunos apenas de 'notifications'
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
    console.log(`🔍 Buscando aluno: ${firebaseId}`);

    const doc = await usersCollection.doc(firebaseId).get();

    if (doc.exists) {
      const data = doc.data();
      console.log(`✅ aluno encontrado`);

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

    console.log(`❌ aluno não encontrado: ${firebaseId}`);
    return null;
  } catch (error: any) {
    console.error('❌ Erro ao buscar aluno:', error);
    throw error;
  }
}


async function updateAlunoInFirebase(firebaseId: string, dados: any): Promise<void> {
  try {
    console.log(`✏️ Atualizando aluno: ${firebaseId}`);

    const updateData = {
      nome: dados.nome,
      matricula: dados.matricula,
      polo: dados.polo || '',
      categoria: dados.categoria || 'geral',
      tags: dados.tags || [],
      imagens: dados.imagens || [],
      updatedAt: FieldValue.serverTimestamp(),
      imageUrl: dados.imagens && dados.imagens.length > 0 ? dados.imagens[0] : null
    };

    await usersCollection.doc(firebaseId).update(updateData);

    console.log(`✅ aluno atualizado: ${firebaseId}`);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar aluno:', error);
    throw error;
  }
}

async function deleteAlunoFromFirebase(firebaseId: string): Promise<void> {
  try {
    console.log(`🗑️ Deletando aluno: ${firebaseId}`);

    await usersCollection.doc(firebaseId).delete();

    console.log(`✅ aluno deletado: ${firebaseId}`);
  } catch (error: any) {
    console.error('❌ Erro ao deletar aluno:', error);
    throw error;
  }
}

export class alunosController {

  async criar(req: Request, res: Response): Promise<void> {
    try {
      console.log('📝 === CRIANDO ALUNO NO FIREBASE ===');
      console.log('📝 Dados recebidos:', JSON.stringify(req.body, null, 2));

      
      const nome = req.body.nome;
      const matricula = req.body.matricula || '';
      const email = req.body.email || '';
      const polo = req.body.polo || '';




      console.log('🔍 Valores extraídos:');
      console.log('  - nome:', nome, `(tipo: ${typeof nome}, length: ${nome.length})`);
      console.log('  - matricula:', matricula, `(tipo: ${typeof matricula}, length: ${matricula.length})`);
      console.log('  - polo:', polo);


      const nomeTrimmed = nome.toString().trim();
      const matriculaTrimmed = matricula.toString().trim();

      if (!nomeTrimmed || !matriculaTrimmed) {
        console.log('❌ Validação falhou: campos obrigatórios ausentes');
        console.log('  - nome trimmed:', nomeTrimmed);
        console.log('  - matricula trimmed:', matriculaTrimmed);
        res.status(400).json({
          error: 'Título e conteúdo são obrigatórios',
          details: {
            nomeRecebido: !!nome,
            matriculaRecebido: !!matricula,
            nomeVazio: !nomeTrimmed,
            matriculaVazio: !matriculaTrimmed
          }
        });
        return;
      }



      const dadosaluno = {
        nome: nomeTrimmed,
        matricula: matriculaTrimmed,
        email: email || '',
        polo: polo || ''
      };

      console.log('💾 Criando aluno no Firebase:', dadosaluno.nome);
      console.log('📋 Dados processados:', JSON.stringify(dadosaluno, null, 2));

      const firebaseId = await createAlunoInFirebase(dadosaluno);

      console.log('✅ aluno criado com sucesso, ID:', firebaseId);

      res.status(201).json({
        matricula: 'aluno criado com sucesso',
        id: firebaseId,
        aluno: { ...dadosaluno, id: firebaseId }
      });
    } catch (error: any) {
      console.error('❌ Erro ao criar aluno:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({
        error: 'Erro ao criar aluno',
        matricula: error.matricula,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      console.log('📋 === LISTANDO alunoS DO FIREBASE ===');
      const { polo, categoria, status, limite = 50 } = req.query;

      // Fetch all alunos from Firestore
      const snapshot = await usersCollection.where('type', '==', 'aluno').get();
      let alunos: any[] = [];
      snapshot.forEach(doc => {
        alunos.push({ id: doc.id, ...doc.data() });
      });

      if (polo) {
        alunos = alunos.filter((c: any) =>
          typeof c.polo === 'string' && c.polo.toLowerCase().includes((polo as string).toLowerCase())
        );
        console.log(`🔍 Filtrado por polo "${polo}": ${alunos.length} alunos`);
      }

      if (categoria) {
        alunos = alunos.filter((c: any) =>
          typeof c.categoria === 'string' && c.categoria.toLowerCase() === (categoria as string).toLowerCase()
        );
        console.log(`🔍 Filtrado por categoria "${categoria}": ${alunos.length} alunos`);
      }

      if (status) {
        alunos = alunos.filter((c: any) => c.status === status);
        console.log(`🔍 Filtrado por status "${status}": ${alunos.length} alunos`);
      }

      const limiteNum = Number(limite);
      if (limiteNum > 0) {
        alunos = alunos.slice(0, limiteNum);
      }

      console.log(`✅ Retornando ${alunos.length} alunos`);

      res.json({
        alunos,
        total: alunos.length,
        filtros: { polo, categoria, status, limite }
      });
    } catch (error: any) {
      console.error('❌ Erro ao listar alunos:', error);
      res.status(500).json({ error: error.matricula });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 === BUSCANDO aluno POR ID ===');
      const { id } = req.params;
      console.log(`📋 ID solicitado: ${id}`);

      const aluno = await getAlunoFromFirebase(id);

      if (!aluno) {
        console.log(`❌ aluno não encontrado: ${id}`);
        res.status(404).json({ error: 'aluno não encontrado' });
        return;
      }

      console.log(`✅ aluno encontrado: ${aluno.nome}`);
      res.json(aluno);
    } catch (error: any) {
      console.error('❌ Erro ao buscar aluno:', error);
      res.status(500).json({ error: error.matricula });
    }
  }

  async editar(req: Request, res: Response): Promise<void> {
    try {
      console.log('✏️ === EDITANDO aluno NO FIREBASE ===');
      const { id } = req.params;
      console.log(`📋 ID do aluno: ${id}`);
      console.log('📝 Dados recebidos:', JSON.stringify(req.body, null, 2));

      const { nome, matricula, email, polo, categoria, tags, imagens, existingImages } = req.body;

      const currentData = await getAlunoFromFirebase(id);

      if (!currentData) {
        console.log('❌ aluno não encontrado');
        res.status(404).json({ error: 'aluno não encontrado' });
        return;
      }

      console.log('📄 aluno atual:', currentData.nome);

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
        matricula: matricula ? matricula.trim() : currentData.matricula,
        polo: polo !== undefined ? polo : currentData.polo,
        categoria: categoria || currentData.categoria,
        tags: processedTags,
        imagens: finalImages
      };

      console.log('💾 Atualizando aluno no Firebase:', dadosAtualizacao.nome);

      await updateAlunoInFirebase(id, dadosAtualizacao);

      const alunoAtualizado = await getAlunoFromFirebase(id);

      console.log('✅ aluno atualizado com sucesso');

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
      console.log('🗑️ === DELETANDO aluno DO FIREBASE ===');
      const { id } = req.params;
      console.log(`📋 ID do aluno: ${id}`);

      const alunoData = await getAlunoFromFirebase(id);

      if (!alunoData) {
        console.log('❌ aluno não encontrado');
        res.status(404).json({ error: 'aluno não encontrado' });
        return;
      }

      console.log(`📄 Deletando aluno: ${alunoData.nome}`);

      await deleteAlunoFromFirebase(id);
      console.log('✅ aluno deletado do Firebase');

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
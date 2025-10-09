import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';


const APP_ID = 'registro-itec-dcbc4';

const notificationsCollection = db.collection(`artifacts/${APP_ID}/public/data/notifications`);


async function createComunicadoInFirebase(dados: any): Promise<string> {
  try {
    const agora = new Date();
    const notificationData = {
      title: dados.title,
      message: dados.message,
      type: 'comunicado',
      senderId: `admin-${Date.now()}`,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      scheduledDate: null,
      targetPolos: dados.polo ? [String(dados.polo)] : ['todos'],
      targetUserTypes: ['aluno', 'professor', 'admin'],
      autor: dados.autor || `Admin${dados.polo ? ' - ' + dados.polo : ''}`,
      autorEmail: dados.email || '',
      categoria: dados.categoria || 'geral',
      polo: dados.polo || '',
      tags: dados.tags || [],
      imagens: dados.imagens || [],
      ativo: true,
      prioridade: 'media',
      visualizacoes: 0,
      dataPublicacao: agora.toISOString(),
      imageUrl: dados.imagens && dados.imagens.length > 0 ? dados.imagens[0] : null
    };
    const docRef = await notificationsCollection.add(notificationData);
    return docRef.id;
  } catch (error: any) {
    console.error('[comunicadosController] Erro ao criar comunicado:', error);
    throw error;
  }
}


async function getAllComunicadosFromFirebase(): Promise<any[]> {
  try {
    const snapshot = await notificationsCollection.get();
    const comunicados: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const titulo = data.title || data.titulo || '';
      const conteudo = data.message || data.conteudo || '';
      if (titulo || conteudo) {
        comunicados.push({
          id: doc.id,
          titulo,
          conteudo,
          autor: data.autor || data.autorEmail || data.senderId || 'Admin',
          email: data.autorEmail || data.email || '',
          polo: Array.isArray(data.targetPolos) ? data.targetPolos.join(', ') : (data.polo || ''),
          categoria: Array.isArray(data.targetUserTypes) ? data.targetUserTypes.join(', ') : (data.categoria || data.targetUserTypes || 'geral'),
          tags: data.tags || [],
          imagens: (() => {
            if (!data.imagens) return data.imageUrl ? [data.imageUrl] : [];
            if (Array.isArray(data.imagens)) return data.imagens;
            if (typeof data.imagens === 'string') {
              return data.imagens.includes(',') 
                ? data.imagens.split(',').map(img => img.trim()).filter(img => img)
                : [data.imagens];
            }
            return [];
          })(),
          prioridade: data.prioridade || 'media',
          visualizacoes: data.visualizacoes || 0,
          dataPublicacao: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : (data.dataPublicacao || new Date().toISOString()),
          targetPolos: data.targetPolos || [],
          targetUserTypes: data.targetUserTypes || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }
    });
    comunicados.sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());
    return comunicados;
  } catch (error: any) {
    console.error('[comunicadosController] Erro ao listar comunicados:', error);
    throw error;
  }
}

async function getComunicadoFromFirebase(firebaseId: string): Promise<any | null> {
  try {
    const doc = await notificationsCollection.doc(firebaseId).get();

    if (doc.exists) {
      const data = doc.data();

      let title = '';
      let message = data?.message || '';

      if (data?.titleOriginal) {
        title = data.titleOriginal;
        message = data.messageOriginal || data.message;
      } else if (data?.message) {
        const lines = data.message.split('\n');
        title = lines[0] || 'Sem título';
        message = lines.slice(2).join('\n') || data.message;
      }

      return {
        id: doc.id,
        title,
        message,
        autor: data?.autorEmail || data?.autor || data?.senderId || 'Admin',
        polo: data?.polo || '',
        categoria: data?.categoria || 'geral',
        tags: data?.tags || [],
        imagens: (() => {
          if (!data?.imagens) return data?.imageUrl ? [data.imageUrl] : [];
          if (Array.isArray(data.imagens)) return data.imagens;
          if (typeof data.imagens === 'string') {
            return data.imagens.includes(',') 
              ? data.imagens.split(',').map(img => img.trim()).filter(img => img)
              : [data.imagens];
          }
          return [];
        })(),
        ativo: data?.ativo !== false,
        dataPublicacao: data?.createdAt ?
          (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) :
          new Date().toISOString(),
        visualizacoes: data?.visualizacoes || 0,
        ...data
      };
    }

    return null;
  } catch (error: any) {
    console.error('❌ Erro ao buscar comunicado:', error);
    throw error;
  }
}


async function updateComunicadoInFirebase(firebaseId: string, dados: any): Promise<void> {
  try {
    const updateData = {
      title: dados.title,
      message: dados.message,
      autor: dados.autor,
      polo: dados.polo || '',
      categoria: dados.categoria || 'geral',
      tags: dados.tags || [],
      imagens: dados.imagens || [],
      updatedAt: FieldValue.serverTimestamp(),
      imageUrl: dados.imagens && dados.imagens.length > 0 ? dados.imagens[0] : null
    };

    await notificationsCollection.doc(firebaseId).update(updateData);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar comunicado:', error);
    throw error;
  }
}

async function deleteComunicadoFromFirebase(firebaseId: string): Promise<void> {
  try {
    await notificationsCollection.doc(firebaseId).delete();
  } catch (error: any) {
    console.error('❌ Erro ao deletar comunicado:', error);
    throw error;
  }
}

export class ComunicadosController {

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const title = req.body.title || req.body.titulo || '';
      const message = req.body.message || req.body.conteudo || '';
      const email = req.body.email || '';
      const polo = req.body.polo || '';
      const categoria = req.body.categoria || 'geral';
      const tags = req.body.tags || [];
      const imagens = req.body.imagens || [];
      const prioridade = req.body.prioridade || 'media';

      const titleTrimmed = title.toString().trim();
      const messageTrimmed = message.toString().trim();

      if (!titleTrimmed || !messageTrimmed) {
        res.status(400).json({
          error: 'Título e conteúdo são obrigatórios',
          details: {
            titleRecebido: !!title,
            messageRecebido: !!message,
            titleVazio: !titleTrimmed,
            messageVazio: !messageTrimmed
          }
        });
        return;
      }

      let processedTags = tags || [];
      if (typeof tags === 'string') {
        try {
          processedTags = JSON.parse(tags);
        } catch {
          processedTags = [tags];
        }
      }
      if (!Array.isArray(processedTags)) {
        processedTags = [];
      }

      let processedImages: any[] = [];
      if (Array.isArray(imagens)) {
        processedImages = imagens;
      } else if (typeof imagens === 'string' && imagens) {
        try {
          processedImages = JSON.parse(imagens);
        } catch {
          processedImages = [imagens];
        }
      }

      const autor = polo ? `Admin - ${polo}` : 'Admin';

      const dadosComunicado = {
        title: titleTrimmed,
        message: messageTrimmed,
        autor,
        email: email || '',
        polo: polo || '',
        categoria: categoria || 'geral',
        tags: processedTags,
        imagens: processedImages,
        prioridade: prioridade || 'media'
      };

      const firebaseId = await createComunicadoInFirebase(dadosComunicado);

      res.status(201).json({
        message: 'Comunicado criado com sucesso',
        id: firebaseId,
        comunicado: { ...dadosComunicado, id: firebaseId }
      });
    } catch (error: any) {
      console.error('❌ Erro ao criar comunicado:', error);
      res.status(500).json({
        error: 'Erro ao criar comunicado',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { polo, categoria, limite = 50 } = req.query;

      let comunicados = await getAllComunicadosFromFirebase();

      if (polo) {
        comunicados = comunicados.filter((c: any) =>
          c.polo.toLowerCase().includes((polo as string).toLowerCase())
        );
      }

      if (categoria) {
        comunicados = comunicados.filter((c: any) =>
          c.categoria.toLowerCase() === (categoria as string).toLowerCase()
        );
      }

      const limiteNum = Number(limite);
      if (limiteNum > 0) {
        comunicados = comunicados.slice(0, limiteNum);
      }

      res.json({
        comunicados,
        total: comunicados.length,
        filtros: { polo, categoria, limite }
      });
    } catch (error: any) {
      console.error('❌ Erro ao listar comunicados:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comunicado = await getComunicadoFromFirebase(id);

      if (!comunicado) {
        res.status(404).json({ error: 'Comunicado não encontrado' });
        return;
      }

      res.json(comunicado);
    } catch (error: any) {
      console.error('❌ Erro ao buscar comunicado:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async editar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { title, message, email, polo, categoria, tags, imagens, existingImages } = req.body;

      const currentData = await getComunicadoFromFirebase(id);

      if (!currentData) {
        res.status(404).json({ error: 'Comunicado não encontrado' });
        return;
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

      const autor = polo ? `Admin - ${polo}` : (currentData.autor || 'Admin');

      const dadosAtualizacao = {
        title: title ? title.trim() : currentData.title,
        message: message ? message.trim() : currentData.message,
        autor,
        polo: polo !== undefined ? polo : currentData.polo,
        categoria: categoria || currentData.categoria,
        tags: processedTags,
        imagens: finalImages
      };

      await updateComunicadoInFirebase(id, dadosAtualizacao);

      const comunicadoAtualizado = await getComunicadoFromFirebase(id);

      res.json({
        message: 'Comunicado atualizado com sucesso',
        id,
        comunicado: comunicadoAtualizado
      });
    } catch (error: any) {
      console.error('❌ Erro ao editar comunicado:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async deletar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const comunicadoData = await getComunicadoFromFirebase(id);

      if (!comunicadoData) {
        res.status(404).json({ error: 'Comunicado não encontrado' });
        return;
      }

      await deleteComunicadoFromFirebase(id);

      res.json({
        message: 'Comunicado deletado com sucesso',
        id
      });
    } catch (error: any) {
      console.error('❌ Erro ao deletar comunicado:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
export default new ComunicadosController();
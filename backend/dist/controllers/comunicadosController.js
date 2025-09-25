"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComunicadosController = void 0;
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const getNotificationsCollection = () => {
    return firebase_admin_1.db.collection('artifacts').doc('registro-itec-dcbc4').collection('public').doc('data').collection('notifications');
};
async function createComunicadoInFirebase(dados) {
    try {
        const agora = new Date();
        const notificationData = {
            title: dados.titulo,
            message: dados.conteudo,
            type: 'comunicado',
            senderId: `admin-${Date.now()}`,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            scheduledDate: null,
            targetPolos: dados.polo ? [dados.polo.toLowerCase().replace(/\s+/g, '')] : ['todos'],
            targetUserTypes: ['aluno', 'professor', 'admin'],
            autor: (!dados.polo || dados.categoria?.toLowerCase().includes('geral'))
                ? 'Administrador Geral'
                : `admin - ${dados.polo}`,
            autorEmail: dados.email || '',
            categoria: dados.categoria || 'geral',
            polo: dados.polo || '',
            tags: dados.tags || [],
            imagens: dados.imagens || [],
            status: 'ativo',
            ativo: true,
            prioridade: 'media',
            visualizacoes: 0,
            dataPublicacao: agora.toISOString(),
            imageUrl: dados.imagens && dados.imagens.length > 0 ? dados.imagens[0] : null
        };
        console.log('📝 Criando comunicado no Firebase data/notifications:', notificationData.title);
        const docRef = await getNotificationsCollection().add(notificationData);
        console.log(`✅ Comunicado criado com ID: ${docRef.id}`);
        return docRef.id;
    }
    catch (error) {
        console.error('❌ Erro ao criar comunicado no Firebase:', error);
        throw error;
    }
}
async function getComunicadoFromFirebase(firebaseId) {
    try {
        console.log(`🔍 Buscando comunicado: ${firebaseId}`);
        const doc = await getNotificationsCollection().doc(firebaseId).get();
        if (doc.exists) {
            const data = doc.data();
            console.log(`✅ Comunicado encontrado: ${data?.title || 'Sem título'}`);
            return {
                id: doc.id,
                titulo: data?.title || '',
                conteudo: data?.message || '',
                autor: data?.autor || 'Admin',
                polo: data?.polo || '',
                categoria: data?.categoria || 'geral',
                tags: data?.tags || [],
                imagens: data?.imagens || [],
                status: data?.status || 'ativo',
                ativo: data?.ativo !== false,
                dataPublicacao: data?.dataPublicacao || new Date().toISOString(),
                visualizacoes: data?.visualizacoes || 0,
                ...data
            };
        }
        console.log(`❌ Comunicado não encontrado: ${firebaseId}`);
        return null;
    }
    catch (error) {
        console.error('❌ Erro ao buscar comunicado:', error);
        throw error;
    }
}
async function getAllComunicadosFromFirebase() {
    try {
        console.log('📋 Listando comunicados do Firebase data/notifications...');
        const possiblePaths = [
            'artifacts/registro-itec-dcbc4/public/data/notifications',
            'public/data/notifications',
            'data/notifications',
            'notifications'
        ];
        let snapshot = null;
        let usedPath = '';
        for (const path of possiblePaths) {
            try {
                console.log(`🔍 Tentando caminho: ${path}`);
                const testSnapshot = await firebase_admin_1.db.collection(path).get();
                if (!testSnapshot.empty) {
                    snapshot = testSnapshot;
                    usedPath = path;
                    console.log(`✅ Sucesso com caminho: ${path} (${testSnapshot.size} documentos)`);
                    break;
                }
                else {
                    console.log(`❌ Vazio: ${path}`);
                }
            }
            catch (error) {
                console.log(`❌ Erro em ${path}: ${error.message}`);
            }
        }
        if (!snapshot) {
            console.log('❌ Nenhum caminho funcionou, tentando fallback...');
            snapshot = await getNotificationsCollection().get();
            usedPath = 'fallback';
        }
        const comunicados = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`📄 Documento encontrado: ${data.title || data.message || 'Sem título'} (${doc.id})`);
            const isComunicado = data.title && data.message;
            if (isComunicado) {
                const comunicado = {
                    id: doc.id,
                    titulo: data.title || '',
                    conteudo: data.message || '',
                    autor: data.senderId || data.autor || 'Admin',
                    polo: Array.isArray(data.targetPolos) ? data.targetPolos.join(', ') : (data.targetPolos || ''),
                    categoria: Array.isArray(data.targetUserTypes) ? data.targetUserTypes.join(', ') : (data.targetUserTypes || 'geral'),
                    tags: data.tags || [],
                    imagens: data.imageUrl ? [data.imageUrl] : (data.imagens || []),
                    status: 'ativo',
                    ativo: true,
                    dataPublicacao: data.createdAt ? new Date(data.createdAt.toDate()).toISOString() :
                        (data.timestamp ? new Date(data.timestamp.toDate()).toISOString() : new Date().toISOString()),
                    scheduledDate: data.scheduledDate ? new Date(data.scheduledDate.toDate()).toISOString() : null,
                    visualizacoes: data.visualizacoes || 0,
                    senderId: data.senderId,
                    targetPolos: data.targetPolos || [],
                    targetUserTypes: data.targetUserTypes || [],
                    createdAt: data.createdAt,
                    timestamp: data.timestamp,
                    updatedAt: data.updatedAt
                };
                if (comunicado.titulo && comunicado.conteudo) {
                    comunicados.push(comunicado);
                    console.log(`✅ Comunicado adicionado: ${comunicado.titulo}`);
                }
            }
            else {
                console.log(`⚠️ Documento ignorado (não é comunicado): ${JSON.stringify(data, null, 2)}`);
            }
        });
        comunicados.sort((a, b) => {
            const getTime = (item) => {
                if (item.createdAt && item.createdAt.toDate) {
                    return item.createdAt.toDate().getTime();
                }
                if (item.timestamp && item.timestamp.toDate) {
                    return item.timestamp.toDate().getTime();
                }
                if (item.dataPublicacao) {
                    return new Date(item.dataPublicacao).getTime();
                }
                return 0;
            };
            return getTime(b) - getTime(a);
        });
        console.log(`✅ Encontrados ${comunicados.length} comunicados ativos usando caminho: ${usedPath}`);
        return comunicados;
    }
    catch (error) {
        console.error('❌ Erro ao listar comunicados:', error);
        throw error;
    }
}
async function updateComunicadoInFirebase(firebaseId, dados) {
    try {
        console.log(`✏️ Atualizando comunicado: ${firebaseId}`);
        const updateData = {
            title: dados.titulo,
            message: dados.conteudo,
            autor: dados.autor,
            polo: dados.polo || '',
            categoria: dados.categoria || 'geral',
            tags: dados.tags || [],
            imagens: dados.imagens || [],
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            imageUrl: dados.imagens && dados.imagens.length > 0 ? dados.imagens[0] : null
        };
        await getNotificationsCollection().doc(firebaseId).update(updateData);
        console.log(`✅ Comunicado atualizado: ${firebaseId}`);
    }
    catch (error) {
        console.error('❌ Erro ao atualizar comunicado:', error);
        throw error;
    }
}
async function deleteComunicadoFromFirebase(firebaseId) {
    try {
        console.log(`🗑️ Deletando comunicado: ${firebaseId}`);
        await getNotificationsCollection().doc(firebaseId).delete();
        console.log(`✅ Comunicado deletado: ${firebaseId}`);
    }
    catch (error) {
        console.error('❌ Erro ao deletar comunicado:', error);
        throw error;
    }
}
class ComunicadosController {
    async criar(req, res) {
        try {
            console.log('📝 === CRIANDO COMUNICADO NO FIREBASE ===');
            console.log('📝 Dados recebidos:', JSON.stringify(req.body, null, 2));
            const { titulo, conteudo, email, polo, categoria, tags, imagens } = req.body;
            if (!titulo || !conteudo) {
                console.log('❌ Validação falhou: campos obrigatórios ausentes');
                res.status(400).json({
                    error: 'Título e conteúdo são obrigatórios'
                });
                return;
            }
            let processedTags = tags || [];
            if (typeof tags === 'string') {
                try {
                    processedTags = JSON.parse(tags);
                }
                catch {
                    processedTags = [tags];
                }
            }
            let processedImages = [];
            if (Array.isArray(imagens)) {
                processedImages = imagens;
            }
            else if (typeof imagens === 'string') {
                try {
                    processedImages = JSON.parse(imagens);
                }
                catch {
                    processedImages = imagens ? [imagens] : [];
                }
            }
            let autor;
            if (!polo ||
                categoria?.toLowerCase().includes('geral') ||
                categoria?.toLowerCase().includes('corporativo') ||
                categoria?.toLowerCase().includes('todos')) {
                autor = 'Administrador Geral';
            }
            else {
                autor = `admin - ${polo}`;
            }
            const dadosComunicado = {
                titulo: titulo.trim(),
                conteudo: conteudo.trim(),
                autor,
                email: email || '',
                polo: polo || '',
                categoria: categoria || 'geral',
                tags: processedTags,
                imagens: processedImages
            };
            console.log('💾 Criando comunicado no Firebase:', dadosComunicado.titulo);
            const firebaseId = await createComunicadoInFirebase(dadosComunicado);
            res.status(201).json({
                message: 'Comunicado criado com sucesso',
                id: firebaseId,
                comunicado: { ...dadosComunicado, id: firebaseId }
            });
        }
        catch (error) {
            console.error('❌ Erro ao criar comunicado:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async listar(req, res) {
        try {
            console.log('📋 === LISTANDO COMUNICADOS DO FIREBASE ===');
            console.log('🔍 Coleção atual: data/notifications/comunicados');
            const { polo, categoria, status, limite = 50 } = req.query;
            let comunicados = await getAllComunicadosFromFirebase();
            console.log(`📊 Comunicados brutos encontrados: ${comunicados.length}`);
            if (polo) {
                comunicados = comunicados.filter((c) => c.polo.toLowerCase().includes(polo.toLowerCase()));
                console.log(`🔍 Filtrado por polo "${polo}": ${comunicados.length} comunicados`);
            }
            if (categoria) {
                comunicados = comunicados.filter((c) => c.categoria.toLowerCase() === categoria.toLowerCase());
                console.log(`🔍 Filtrado por categoria "${categoria}": ${comunicados.length} comunicados`);
            }
            if (status) {
                comunicados = comunicados.filter((c) => c.status === status);
                console.log(`🔍 Filtrado por status "${status}": ${comunicados.length} comunicados`);
            }
            const limiteNum = Number(limite);
            if (limiteNum > 0) {
                comunicados = comunicados.slice(0, limiteNum);
            }
            console.log(`✅ Retornando ${comunicados.length} comunicados`);
            res.json({
                comunicados,
                total: comunicados.length,
                filtros: { polo, categoria, status, limite }
            });
        }
        catch (error) {
            console.error('❌ Erro ao listar comunicados:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async buscarPorId(req, res) {
        try {
            console.log('🔍 === BUSCANDO COMUNICADO POR ID ===');
            const { id } = req.params;
            console.log(`📋 ID solicitado: ${id}`);
            const comunicado = await getComunicadoFromFirebase(id);
            if (!comunicado) {
                console.log(`❌ Comunicado não encontrado: ${id}`);
                res.status(404).json({ error: 'Comunicado não encontrado' });
                return;
            }
            console.log(`✅ Comunicado encontrado: ${comunicado.titulo}`);
            res.json(comunicado);
        }
        catch (error) {
            console.error('❌ Erro ao buscar comunicado:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async editar(req, res) {
        try {
            console.log('✏️ === EDITANDO COMUNICADO NO FIREBASE ===');
            const { id } = req.params;
            console.log(`📋 ID do comunicado: ${id}`);
            console.log('📝 Dados recebidos:', JSON.stringify(req.body, null, 2));
            const { titulo, conteudo, email, polo, categoria, tags, imagens, existingImages } = req.body;
            const currentData = await getComunicadoFromFirebase(id);
            if (!currentData) {
                console.log('❌ Comunicado não encontrado');
                res.status(404).json({ error: 'Comunicado não encontrado' });
                return;
            }
            console.log('📄 Comunicado atual:', currentData.titulo);
            let processedTags = tags || currentData.tags || [];
            if (typeof tags === 'string') {
                try {
                    processedTags = JSON.parse(tags);
                }
                catch {
                    processedTags = [tags];
                }
            }
            let processedExistingImages = existingImages || [];
            if (typeof existingImages === 'string') {
                try {
                    processedExistingImages = JSON.parse(existingImages);
                }
                catch {
                    processedExistingImages = existingImages ? [existingImages] : [];
                }
            }
            let finalImages = [...(processedExistingImages || [])];
            if (Array.isArray(imagens) && imagens.length > 0) {
                finalImages = [...finalImages, ...imagens];
            }
            let autor;
            if (polo) {
                autor = `admin - ${polo}`;
            }
            else {
                const categoriaAtual = categoria || currentData.categoria || '';
                if (!categoriaAtual || categoriaAtual.toLowerCase().includes('geral')) {
                    autor = 'Administrador Geral';
                }
                else {
                    autor = currentData.autor || 'Administrador Geral';
                }
            }
            const dadosAtualizacao = {
                titulo: titulo ? titulo.trim() : currentData.titulo,
                conteudo: conteudo ? conteudo.trim() : currentData.conteudo,
                autor,
                polo: polo !== undefined ? polo : currentData.polo,
                categoria: categoria || currentData.categoria,
                tags: processedTags,
                imagens: finalImages
            };
            console.log('💾 Atualizando comunicado no Firebase:', dadosAtualizacao.titulo);
            await updateComunicadoInFirebase(id, dadosAtualizacao);
            const comunicadoAtualizado = await getComunicadoFromFirebase(id);
            console.log('✅ Comunicado atualizado com sucesso');
            res.json({
                message: 'Comunicado atualizado com sucesso',
                id,
                comunicado: comunicadoAtualizado
            });
        }
        catch (error) {
            console.error('❌ Erro ao editar comunicado:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async deletar(req, res) {
        try {
            console.log('🗑️ === DELETANDO COMUNICADO DO FIREBASE ===');
            const { id } = req.params;
            console.log(`📋 ID do comunicado: ${id}`);
            const comunicadoData = await getComunicadoFromFirebase(id);
            if (!comunicadoData) {
                console.log('❌ Comunicado não encontrado');
                res.status(404).json({ error: 'Comunicado não encontrado' });
                return;
            }
            console.log(`📄 Deletando comunicado: ${comunicadoData.titulo}`);
            await deleteComunicadoFromFirebase(id);
            console.log('✅ Comunicado deletado do Firebase');
            res.json({
                message: 'Comunicado deletado com sucesso',
                id
            });
        }
        catch (error) {
            console.error('❌ Erro ao deletar comunicado:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
exports.ComunicadosController = ComunicadosController;
exports.default = new ComunicadosController();

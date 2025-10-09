"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professoresController = void 0;
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const APP_ID = 'registro-itec-dcbc4';
const usersCollection = firebase_admin_1.db.collection(`artifacts/${APP_ID}/users`);
async function createProfessorInFirebase(dados) {
    try {
        const professorData = {
            nome: dados.nome,
            type: 'professor',
            localEstagio: dados.localEstagio || '',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            polo: dados.polo || '',
            email: dados.email || ''
        };
        const docRef = await usersCollection.add(professorData);
        const snap = await docRef.get();
        return docRef.id;
    }
    catch (error) {
        console.error('[professoresController] Erro ao criar professor:', error);
        throw error;
    }
}
async function getProfessoresFromFirebase(req, res) {
    try {
        const { id } = req.params;
        const doc = await usersCollection.doc(id).get();
        if (!doc.exists || doc.data()?.type !== "professor") {
            return res.status(404).json({ error: "Professor não encontrado" });
        }
        return res.json({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        return res.status(500).json({ error: "Erro ao buscar professor", details: error });
    }
}
async function getProfessorFromFirebase(firebaseId) {
    try {
        const doc = await usersCollection.doc(firebaseId).get();
        if (doc.exists) {
            const data = doc.data();
            let nome = '';
            let matricula = data?.matricula || '';
            if (data?.nomeOriginal) {
                nome = data.nomeOriginal;
                matricula = data.matriculaOriginal || data.matricula;
            }
            else if (data?.matricula) {
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
    }
    catch (error) {
        console.error('❌ Erro ao buscar professor:', error);
        throw error;
    }
}
async function uptadeProfessorInFirebase(firebaseId, dados) {
    try {
        const updateData = {
            nome: dados.nome,
            matricula: dados.matricula,
            polo: dados.polo || '',
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        };
        await usersCollection.doc(firebaseId).update(updateData);
    }
    catch (error) {
        console.error('❌ Erro ao atualizar professor:', error);
        throw error;
    }
}
async function deleteProfessorFromFirebase(firebaseId) {
    try {
        await usersCollection.doc(firebaseId).delete();
    }
    catch (error) {
        console.error('❌ Erro ao deletar professor:', error);
        throw error;
    }
}
class professoresController {
    async criar(req, res) {
        try {
            const { nome, email, polo, localEstagio } = req.body;
            if (!nome || nome.trim() === '') {
                res.status(400).json({
                    error: 'Nome é obrigatório'
                });
                return;
            }
            const nomeTrimmed = nome.toString().trim();
            const dadosProfessor = {
                nome: nomeTrimmed,
                email: email || '',
                polo: polo || '',
                localEstagio: localEstagio || ''
            };
            const firebaseId = await createProfessorInFirebase(dadosProfessor);
            res.status(201).json({
                message: 'Professor criado com sucesso',
                id: firebaseId,
                professor: { ...dadosProfessor, id: firebaseId }
            });
        }
        catch (error) {
            console.error('❌ [professoresController.criar] Erro:', error);
            console.error('❌ [professoresController.criar] Stack:', error.stack);
            res.status(500).json({
                error: 'Erro ao criar professor',
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
    async listar(req, res) {
        try {
            const { polo, limite = 50 } = req.query;
            const snapshot = await usersCollection.where('type', '==', 'professor').get();
            let professores = [];
            snapshot.forEach(doc => {
                professores.push({ id: doc.id, ...doc.data() });
            });
            if (polo) {
                professores = professores.filter((c) => typeof c.polo === 'string' && c.polo.toLowerCase().includes(polo.toLowerCase()));
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
        }
        catch (error) {
            console.error('❌ Erro ao listar professor:', error);
            res.status(500).json({ error: error.message });
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const professor = await getProfessorFromFirebase(id);
            if (!professor) {
                res.status(404).json({ error: 'professor não encontrado' });
                return;
            }
            res.json(professor);
        }
        catch (error) {
            console.error('❌ Erro ao buscar professor:', error);
            res.status(500).json({ error: error });
        }
    }
    async editar(req, res) {
        try {
            const { id } = req.params;
            const { nome, matricula, email, polo, categoria, tags, imagens, existingImages } = req.body;
            const currentData = await getProfessorFromFirebase(id);
            if (!currentData) {
                res.status(404).json({ error: 'professor não encontrado' });
                return;
            }
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
            const dadosAtualizacao = {
                nome: nome ? nome.trim() : currentData.nome,
                polo: polo !== undefined ? polo : currentData.polo,
            };
            await uptadeProfessorInFirebase(id, dadosAtualizacao);
            const professorAtualizado = await getProfessorFromFirebase(id);
            res.json({
                matricula: 'professor atualizado com sucesso',
                id,
                professor: professorAtualizado
            });
        }
        catch (error) {
            console.error('❌ Erro ao editar professor:', error);
            res.status(500).json({ error: error.matricula });
        }
    }
    async deletar(req, res) {
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
        }
        catch (error) {
            console.error('❌ Erro ao deletar professor:', error);
            res.status(500).json({ error: error.message });
        }
    }
}
exports.professoresController = professoresController;
exports.default = new professoresController();
//# sourceMappingURL=professoresController.js.map
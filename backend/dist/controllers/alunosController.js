"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alunosController = void 0;
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const APP_ID = 'registro-itec-dcbc4';
const usersCollection = firebase_admin_1.db.collection(`artifacts/${APP_ID}/users`);
async function createAlunoInFirebase(dados) {
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
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        };
        const docRef = await usersCollection.add(alunoData);
        return docRef.id;
    }
    catch (error) {
        console.error('[alunosController] Erro ao criar aluno:', error);
        throw error;
    }
}
async function getAlunosFromFirebase(req, res) {
    try {
        const { id } = req.params;
        const doc = await usersCollection.doc(id).get();
        if (!doc.exists || doc.data()?.type !== "aluno") {
            return res.status(404).json({ error: "Aluno não encontrado" });
        }
        return res.json({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        return res.status(500).json({ error: "Erro ao buscar aluno", details: error.matricula });
    }
}
async function getAlunoFromFirebase(firebaseId) {
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
                matricula,
                email: data?.email || data?.senderId || 'Admin',
                polo: data?.polo || '',
                categoria: data?.categoria || 'geral',
                tags: data?.tags || [],
                imagens: data?.imagens || (data?.imageUrl ? [data.imageUrl] : []),
            };
        }
        return null;
    }
    catch (error) {
        console.error('❌ Erro ao buscar aluno:', error);
        throw error;
    }
}
async function updateAlunoInFirebase(firebaseId, dados) {
    try {
        const updateData = {
            nome: dados.nome,
            matricula: dados.matricula,
            polo: dados.polo || '',
            categoria: dados.categoria || 'geral',
            tags: dados.tags || [],
            imagens: dados.imagens || [],
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            imageUrl: dados.imagens && dados.imagens.length > 0 ? dados.imagens[0] : null
        };
        await usersCollection.doc(firebaseId).update(updateData);
    }
    catch (error) {
        console.error('❌ Erro ao atualizar aluno:', error);
        throw error;
    }
}
async function deleteAlunoFromFirebase(firebaseId) {
    try {
        await usersCollection.doc(firebaseId).delete();
    }
    catch (error) {
        console.error('❌ Erro ao deletar aluno:', error);
        throw error;
    }
}
class alunosController {
    async criar(req, res) {
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
            const dadosAluno = {
                nome: nomeTrimmed,
                cpf: cpfTrimmed,
                email: emailTrimmed,
                polo: polo || '',
                localEstagio: localEstagio || '',
                professorOrientador: professorOrientador || '',
                statusMatricula: statusMatricula || 'Ativo',
                turma: turma || '',
                telefone: telefone || ''
            };
            const firebaseId = await createAlunoInFirebase(dadosAluno);
            res.status(201).json({
                message: 'Aluno criado com sucesso',
                id: firebaseId,
                aluno: { ...dadosAluno, id: firebaseId, type: 'aluno' }
            });
        }
        catch (error) {
            console.error('❌ Erro ao criar aluno:', error);
            res.status(500).json({
                error: 'Erro ao criar aluno',
                message: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
    async listar(req, res) {
        try {
            const { polo, categoria, limite = 50 } = req.query;
            const snapshot = await usersCollection.where('type', '==', 'aluno').get();
            let alunos = [];
            snapshot.forEach(doc => {
                alunos.push({ id: doc.id, ...doc.data() });
            });
            if (polo) {
                alunos = alunos.filter((c) => typeof c.polo === 'string' && c.polo.toLowerCase().includes(polo.toLowerCase()));
            }
            if (categoria) {
                alunos = alunos.filter((c) => typeof c.categoria === 'string' && c.categoria.toLowerCase() === categoria.toLowerCase());
            }
            const limiteNum = Number(limite);
            if (limiteNum > 0) {
                alunos = alunos.slice(0, limiteNum);
            }
            res.json({
                alunos,
                total: alunos.length,
                filtros: { polo, categoria, limite }
            });
        }
        catch (error) {
            console.error('❌ Erro ao listar alunos:', error);
            res.status(500).json({ error: error.matricula });
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const aluno = await getAlunoFromFirebase(id);
            if (!aluno) {
                res.status(404).json({ error: 'aluno não encontrado' });
                return;
            }
            res.json(aluno);
        }
        catch (error) {
            console.error('❌ Erro ao buscar aluno:', error);
            res.status(500).json({ error: error.matricula });
        }
    }
    async editar(req, res) {
        try {
            const { id } = req.params;
            const { nome, matricula, email, polo, categoria, tags, imagens, existingImages } = req.body;
            const currentData = await getAlunoFromFirebase(id);
            if (!currentData) {
                res.status(404).json({ error: 'aluno não encontrado' });
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
                matricula: matricula ? matricula.trim() : currentData.matricula,
                polo: polo !== undefined ? polo : currentData.polo,
                categoria: categoria || currentData.categoria,
                tags: processedTags,
                imagens: finalImages
            };
            await updateAlunoInFirebase(id, dadosAtualizacao);
            const alunoAtualizado = await getAlunoFromFirebase(id);
            res.json({
                matricula: 'aluno atualizado com sucesso',
                id,
                aluno: alunoAtualizado
            });
        }
        catch (error) {
            console.error('❌ Erro ao editar aluno:', error);
            res.status(500).json({ error: error.matricula });
        }
    }
    async deletar(req, res) {
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
        }
        catch (error) {
            console.error('❌ Erro ao deletar aluno:', error);
            res.status(500).json({ error: error.matricula });
        }
    }
}
exports.alunosController = alunosController;
exports.default = new alunosController();
//# sourceMappingURL=alunosController.js.map
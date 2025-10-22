"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlunosController = void 0;
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const cpfUtils_1 = require("../utils/cpfUtils");
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
        if (dados.cpf !== undefined) {
            updateData.cpf = dados.cpf;
        }
        if (dados.email !== undefined)
            updateData.email = dados.email;
        if (dados.localEstagio !== undefined)
            updateData.localEstagio = dados.localEstagio;
        if (dados.professorOrientador !== undefined)
            updateData.professorOrientador = dados.professorOrientador;
        if (dados.statusMatricula !== undefined)
            updateData.statusMatricula = dados.statusMatricula;
        if (dados.turma !== undefined)
            updateData.turma = dados.turma;
        if (dados.telefone !== undefined)
            updateData.telefone = dados.telefone;
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
class AlunosController {
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
            const resultadoCPF = (0, cpfUtils_1.processarCPF)(cpfTrimmed);
            if (!resultadoCPF.valido) {
                console.warn(`[alunosController] Tentativa de criar aluno com CPF inválido: ${(0, cpfUtils_1.maskCPFForLogs)(cpfTrimmed)}`);
                res.status(400).json({
                    error: resultadoCPF.erro || 'CPF inválido'
                });
                return;
            }
            const cpfExistente = await (0, cpfUtils_1.cpfJaExiste)(firebase_admin_1.db, resultadoCPF.cpfSanitizado, 'alunos');
            if (cpfExistente) {
                console.warn(`[alunosController] Tentativa de criar aluno com CPF duplicado: ${(0, cpfUtils_1.maskCPFForLogs)(resultadoCPF.cpfSanitizado)}`);
                res.status(409).json({
                    error: 'CPF já cadastrado no sistema'
                });
                return;
            }
            const dadosAluno = {
                nome: nomeTrimmed,
                cpf: resultadoCPF.cpfSanitizado,
                email: emailTrimmed,
                polo: polo || '',
                localEstagio: localEstagio || '',
                professorOrientador: professorOrientador || '',
                statusMatricula: statusMatricula || 'Ativo',
                turma: turma || '',
                telefone: telefone || ''
            };
            const firebaseId = await createAlunoInFirebase(dadosAluno);
            (0, cpfUtils_1.registrarAuditoriaCPF)({
                timestamp: new Date(),
                operation: 'CREATE',
                userId: req.user?.uid || 'unknown',
                collection: 'alunos',
                recordId: firebaseId,
                cpfMasked: (0, cpfUtils_1.maskCPFForLogs)(resultadoCPF.cpfSanitizado),
                ip: req.ip,
                userAgent: req.get('user-agent')
            });
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
            const { polo, categoria } = req.query;
            const MAX_ALUNOS = 500;
            let alunos = [];
            let query = usersCollection.where('type', '==', 'aluno');
            let snapshot = await query.get();
            for (const doc of snapshot.docs) {
                if (alunos.length >= MAX_ALUNOS)
                    break;
                alunos.push({ id: doc.id, ...doc.data() });
            }
            while (snapshot.docs.length === 50 && alunos.length < MAX_ALUNOS) {
                const lastDoc = snapshot.docs.at(-1);
                if (!lastDoc)
                    break;
                snapshot = await query.startAfter(lastDoc).get();
                for (const doc of snapshot.docs) {
                    if (alunos.length >= MAX_ALUNOS)
                        break;
                    alunos.push({ id: doc.id, ...doc.data() });
                }
            }
            if (polo) {
                alunos = alunos.filter((c) => typeof c.polo === 'string' && c.polo.toLowerCase().includes(polo.toLowerCase()));
            }
            if (categoria) {
                alunos = alunos.filter((c) => typeof c.categoria === 'string' && c.categoria.toLowerCase() === categoria.toLowerCase());
            }
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            res.json({
                alunos,
                total: alunos.length,
                filtros: { polo, categoria }
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
    async validateCPFForUpdate(cpf, currentCPF, alunoId) {
        if (!cpf || cpf === currentCPF) {
            return { valido: true, cpfSanitizado: currentCPF };
        }
        const resultadoCPF = (0, cpfUtils_1.processarCPF)(cpf);
        if (!resultadoCPF.valido) {
            console.warn(`[alunosController] Tentativa de atualizar aluno com CPF inválido: ${(0, cpfUtils_1.maskCPFForLogs)(cpf)}`);
            return { valido: false, cpfSanitizado: '', erro: resultadoCPF.erro || 'CPF inválido' };
        }
        const cpfExistente = await (0, cpfUtils_1.cpfJaExiste)(firebase_admin_1.db, resultadoCPF.cpfSanitizado, 'alunos', alunoId);
        if (cpfExistente) {
            console.warn(`[alunosController] Tentativa de atualizar aluno com CPF duplicado: ${(0, cpfUtils_1.maskCPFForLogs)(resultadoCPF.cpfSanitizado)}`);
            return { valido: false, cpfSanitizado: '', erro: 'CPF já cadastrado em outro aluno' };
        }
        (0, cpfUtils_1.registrarAuditoriaCPF)({
            timestamp: new Date(),
            operation: 'UPDATE',
            userId: '',
            collection: 'alunos',
            recordId: alunoId,
            cpfMasked: (0, cpfUtils_1.maskCPFForLogs)(resultadoCPF.cpfSanitizado),
            ip: '',
            userAgent: ''
        });
        return { valido: true, cpfSanitizado: resultadoCPF.cpfSanitizado };
    }
    processTags(tags, currentTags) {
        if (!tags)
            return currentTags || [];
        if (typeof tags === 'string') {
            try {
                return JSON.parse(tags);
            }
            catch {
                return [tags];
            }
        }
        return Array.isArray(tags) ? tags : currentTags || [];
    }
    processImages(imagens, existingImages) {
        let processedExisting = [];
        if (typeof existingImages === 'string') {
            try {
                processedExisting = JSON.parse(existingImages);
            }
            catch {
                processedExisting = existingImages ? [existingImages] : [];
            }
        }
        else {
            processedExisting = existingImages || [];
        }
        const finalImages = [...processedExisting];
        if (Array.isArray(imagens) && imagens.length > 0) {
            finalImages.push(...imagens);
        }
        return finalImages;
    }
    async editar(req, res) {
        try {
            const { id } = req.params;
            const { nome, cpf, matricula, email, polo, categoria, tags, imagens, existingImages, localEstagio, professorOrientador, statusMatricula, turma, telefone } = req.body;
            const currentData = await getAlunoFromFirebase(id);
            if (!currentData) {
                res.status(404).json({ error: 'aluno não encontrado' });
                return;
            }
            const cpfValidation = await this.validateCPFForUpdate(cpf, currentData.cpf, id);
            if (!cpfValidation.valido) {
                res.status(cpfValidation.erro?.includes('duplicado') ? 409 : 400).json({ error: cpfValidation.erro });
                return;
            }
            const processedTags = this.processTags(tags, currentData.tags || []);
            const finalImages = this.processImages(imagens, existingImages);
            const dadosAtualizacao = {
                nome: nome ? nome.trim() : currentData.nome,
                cpf: cpfValidation.cpfSanitizado,
                matricula: matricula ? matricula.trim() : currentData.matricula,
                email: email ?? currentData.email,
                polo: polo ?? currentData.polo,
                categoria: categoria || currentData.categoria,
                tags: processedTags,
                imagens: finalImages,
                localEstagio: localEstagio ?? currentData.localEstagio,
                professorOrientador: professorOrientador ?? currentData.professorOrientador,
                statusMatricula: statusMatricula ?? currentData.statusMatricula,
                turma: turma ?? currentData.turma,
                telefone: telefone ?? currentData.telefone
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
exports.AlunosController = AlunosController;
exports.default = new AlunosController();
//# sourceMappingURL=alunosController.js.map
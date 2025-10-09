"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendamentosController = void 0;
const firebase_admin_1 = require("../config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const agendamentosCollection = firebase_admin_1.db
    .collection('artifacts')
    .doc('registro-itec-dcbc4')
    .collection('public')
    .doc('data')
    .collection('agendamentos');
async function createAgendamentoInFirebase(dados) {
    try {
        const agendamentoData = {
            localEstagio: dados.localEstagio,
            area: dados.area || '',
            horarioInicio: dados.horarioInicio,
            horarioFim: dados.horarioFim,
            aluno: dados.aluno || '',
            alunoId: dados.alunoId || '',
            professor: dados.professor || '',
            professorId: dados.professorId || '',
            observacoes: dados.observacoes || '',
            data: dados.data,
            status: dados.status || (dados.aluno && dados.professor ? 'confirmado' : 'pendente'),
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        };
        if (dados.vagasDisponiveis !== undefined) {
            agendamentoData.vagasDisponiveis = dados.vagasDisponiveis;
        }
        const docRef = await agendamentosCollection.add(agendamentoData);
        return docRef.id;
    }
    catch (error) {
        console.error('[agendamentosController] Erro ao criar agendamento:', error);
        throw error;
    }
}
async function getAllAgendamentosFromFirebase() {
    try {
        const snapshot = await agendamentosCollection.get();
        const agendamentos = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            agendamentos.push({
                id: doc.id,
                localEstagio: data.localEstagio || '',
                area: data.area || '',
                horarioInicio: data.horarioInicio || '',
                horarioFim: data.horarioFim || '',
                aluno: data.aluno || '',
                alunoId: data.alunoId || '',
                professor: data.professor || '',
                professorId: data.professorId || '',
                observacoes: data.observacoes || '',
                data: data.data || '',
                status: data.status || 'confirmado',
                createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                updatedAt: data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
            });
        });
        agendamentos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return agendamentos;
    }
    catch (error) {
        console.error('[agendamentosController] Erro ao listar agendamentos:', error);
        throw error;
    }
}
async function getAgendamentoFromFirebase(firebaseId) {
    try {
        const doc = await agendamentosCollection.doc(firebaseId).get();
        if (doc.exists) {
            const data = doc.data();
            return {
                id: doc.id,
                localEstagio: data?.localEstagio || '',
                area: data?.area || '',
                horarioInicio: data?.horarioInicio || '',
                horarioFim: data?.horarioFim || '',
                aluno: data?.aluno || '',
                alunoId: data?.alunoId || '',
                professor: data?.professor || '',
                professorId: data?.professorId || '',
                observacoes: data?.observacoes || '',
                data: data?.data || '',
                status: data?.status || 'confirmado',
                createdAt: data?.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                updatedAt: data?.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
            };
        }
        return null;
    }
    catch (error) {
        console.error('[agendamentosController] Erro ao buscar agendamento:', error);
        throw error;
    }
}
async function updateAgendamentoInFirebase(firebaseId, dados) {
    try {
        const updateData = {
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        };
        if (dados.localEstagio !== undefined)
            updateData.localEstagio = dados.localEstagio;
        if (dados.area !== undefined)
            updateData.area = dados.area;
        if (dados.horarioInicio !== undefined)
            updateData.horarioInicio = dados.horarioInicio;
        if (dados.horarioFim !== undefined)
            updateData.horarioFim = dados.horarioFim;
        if (dados.aluno !== undefined)
            updateData.aluno = dados.aluno;
        if (dados.alunoId !== undefined)
            updateData.alunoId = dados.alunoId;
        if (dados.professor !== undefined)
            updateData.professor = dados.professor;
        if (dados.professorId !== undefined)
            updateData.professorId = dados.professorId;
        if (dados.observacoes !== undefined)
            updateData.observacoes = dados.observacoes;
        if (dados.data !== undefined)
            updateData.data = dados.data;
        if (dados.status !== undefined)
            updateData.status = dados.status;
        await agendamentosCollection.doc(firebaseId).update(updateData);
    }
    catch (error) {
        console.error('[agendamentosController] Erro ao atualizar agendamento:', error);
        throw error;
    }
}
async function deleteAgendamentoFromFirebase(firebaseId) {
    try {
        await agendamentosCollection.doc(firebaseId).delete();
    }
    catch (error) {
        console.error('[agendamentosController] Erro ao deletar agendamento:', error);
        throw error;
    }
}
async function getAgendamentosPorPeriodo(dataInicio, dataFim) {
    try {
        const snapshot = await agendamentosCollection
            .where('data', '>=', dataInicio)
            .where('data', '<=', dataFim)
            .get();
        const agendamentos = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            agendamentos.push({
                id: doc.id,
                localEstagio: data.localEstagio || '',
                area: data.area || '',
                horarioInicio: data.horarioInicio || '',
                horarioFim: data.horarioFim || '',
                aluno: data.aluno || '',
                alunoId: data.alunoId || '',
                professor: data.professor || '',
                professorId: data.professorId || '',
                observacoes: data.observacoes || '',
                data: data.data || '',
                status: data.status || 'confirmado',
                createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                updatedAt: data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
            });
        });
        agendamentos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
        return agendamentos;
    }
    catch (error) {
        console.error('[agendamentosController] Erro ao buscar agendamentos por período:', error);
        throw error;
    }
}
class AgendamentosController {
    async criar(req, res) {
        try {
            const { localEstagio, area, vagasDisponiveis, horarioInicio, horarioFim, aluno, alunoId, professor, professorId, observacoes, data, status } = req.body;
            if (!localEstagio || !horarioInicio || !horarioFim || !data) {
                res.status(400).json({
                    error: 'Campos obrigatórios: localEstagio, horarioInicio, horarioFim, data'
                });
                return;
            }
            const dadosAgendamento = {
                localEstagio,
                area,
                horarioInicio,
                horarioFim,
                aluno,
                alunoId,
                professor,
                professorId,
                observacoes,
                data,
                status: status || 'confirmado'
            };
            const firebaseId = await createAgendamentoInFirebase(dadosAgendamento);
            res.status(201).json({
                message: 'Agendamento criado com sucesso',
                id: firebaseId,
                agendamento: { ...dadosAgendamento, id: firebaseId }
            });
        }
        catch (error) {
            console.error('[agendamentosController] Erro ao criar agendamento:', error);
            res.status(500).json({
                error: 'Erro ao criar agendamento',
                message: error.message
            });
        }
    }
    async listar(req, res) {
        try {
            const agendamentos = await getAllAgendamentosFromFirebase();
            res.status(200).json({ agendamentos });
        }
        catch (error) {
            console.error('[agendamentosController] Erro ao listar agendamentos:', error);
            res.status(500).json({
                error: 'Erro ao listar agendamentos',
                message: error.message
            });
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ error: 'ID não fornecido' });
                return;
            }
            const agendamento = await getAgendamentoFromFirebase(id);
            if (!agendamento) {
                res.status(404).json({ error: 'Agendamento não encontrado' });
                return;
            }
            res.status(200).json({ agendamento });
        }
        catch (error) {
            console.error('[agendamentosController] Erro ao buscar agendamento:', error);
            res.status(500).json({
                error: 'Erro ao buscar agendamento',
                message: error.message
            });
        }
    }
    async buscarPorPeriodo(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;
            if (!dataInicio || !dataFim) {
                res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
                return;
            }
            const agendamentos = await getAgendamentosPorPeriodo(String(dataInicio), String(dataFim));
            res.status(200).json({ agendamentos });
        }
        catch (error) {
            console.error('[agendamentosController] Erro ao buscar agendamentos por período:', error);
            res.status(500).json({
                error: 'Erro ao buscar agendamentos por período',
                message: error.message
            });
        }
    }
    async editar(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizacao = req.body;
            if (!id) {
                res.status(400).json({ error: 'ID não fornecido' });
                return;
            }
            const agendamentoExiste = await getAgendamentoFromFirebase(id);
            if (!agendamentoExiste) {
                res.status(404).json({ error: 'Agendamento não encontrado' });
                return;
            }
            await updateAgendamentoInFirebase(id, dadosAtualizacao);
            const agendamentoAtualizado = await getAgendamentoFromFirebase(id);
            res.status(200).json({
                message: 'Agendamento atualizado com sucesso',
                agendamento: agendamentoAtualizado
            });
        }
        catch (error) {
            console.error('[agendamentosController] Erro ao editar agendamento:', error);
            res.status(500).json({
                error: 'Erro ao editar agendamento',
                message: error.message
            });
        }
    }
    async deletar(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ error: 'ID não fornecido' });
                return;
            }
            const agendamentoExiste = await getAgendamentoFromFirebase(id);
            if (!agendamentoExiste) {
                res.status(404).json({ error: 'Agendamento não encontrado' });
                return;
            }
            await deleteAgendamentoFromFirebase(id);
            res.status(200).json({
                message: 'Agendamento deletado com sucesso',
                id
            });
        }
        catch (error) {
            console.error('[agendamentosController] Erro ao deletar agendamento:', error);
            res.status(500).json({
                error: 'Erro ao deletar agendamento',
                message: error.message
            });
        }
    }
}
exports.AgendamentosController = AgendamentosController;
exports.default = new AgendamentosController();
//# sourceMappingURL=agendamentosController.js.map
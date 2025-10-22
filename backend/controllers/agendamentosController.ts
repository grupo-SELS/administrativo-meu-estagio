import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const agendamentosCollection = db
  .collection('artifacts')
  .doc('registro-itec-dcbc4')
  .collection('public')
  .doc('data')
  .collection('agendamentos');

interface AgendamentoData {
  localEstagio: string;
  area?: string;
  vagasDisponiveis?: number;
  horarioInicio: string;
  horarioFim: string;
  aluno?: string;
  alunoId?: string;
  professor?: string;
  professorId?: string;
  // Novos campos para múltiplos alunos e professores
  alunosIds?: string[];
  alunosNomes?: string[];
  professoresIds?: string[];
  professoresNomes?: string[];
  observacoes?: string;
  data: string;
  status?: 'vigente' | 'encerrado' | 'confirmado' | 'pendente' | 'cancelado';
}

async function createAgendamentoInFirebase(dados: AgendamentoData): Promise<string> {
  try {
    const agendamentoData: any = {
      localEstagio: dados.localEstagio,
      area: dados.area || '',
      horarioInicio: dados.horarioInicio,
      horarioFim: dados.horarioFim,
      aluno: dados.aluno || '',
      alunoId: dados.alunoId || '',
      professor: dados.professor || '',
      professorId: dados.professorId || '',
      // Novos campos para múltiplos alunos e professores
      alunosIds: dados.alunosIds || [],
      alunosNomes: dados.alunosNomes || [],
      professoresIds: dados.professoresIds || [],
      professoresNomes: dados.professoresNomes || [],
      observacoes: dados.observacoes || '',
      data: dados.data,
      status: dados.status || 'vigente',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };


    if (dados.vagasDisponiveis !== undefined) {
      agendamentoData.vagasDisponiveis = dados.vagasDisponiveis;
    }
    
    const docRef = await agendamentosCollection.add(agendamentoData);
    return docRef.id;
  } catch (error: any) {
    console.error('[agendamentosController] Erro ao criar agendamento:', error);
    throw error;
  }
}

async function getAllAgendamentosFromFirebase(): Promise<any[]> {
  try {
    const snapshot = await agendamentosCollection.get();
    const agendamentos: any[] = [];
    
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
        // Novos campos
        alunosIds: data.alunosIds || [],
        alunosNomes: data.alunosNomes || [],
        professoresIds: data.professoresIds || [],
        professoresNomes: data.professoresNomes || [],
        vagasDisponiveis: data.vagasDisponiveis || 0,
        observacoes: data.observacoes || '',
        data: data.data || '',
        status: data.status || 'vigente',
        createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
      });
    });
    
    agendamentos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return agendamentos;
  } catch (error: any) {
    console.error('[agendamentosController] Erro ao listar agendamentos:', error);
    throw error;
  }
}

async function getAgendamentoFromFirebase(firebaseId: string): Promise<any | null> {
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
        // Novos campos
        alunosIds: data?.alunosIds || [],
        alunosNomes: data?.alunosNomes || [],
        professoresIds: data?.professoresIds || [],
        professoresNomes: data?.professoresNomes || [],
        vagasDisponiveis: data?.vagasDisponiveis || 0,
        observacoes: data?.observacoes || '',
        data: data?.data || '',
        status: data?.status || 'vigente',
        createdAt: data?.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data?.updatedAt && data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString()
      };
    }

    return null;
  } catch (error: any) {
    console.error('[agendamentosController] Erro ao buscar agendamento:', error);
    throw error;
  }
}

async function updateAgendamentoInFirebase(firebaseId: string, dados: Partial<AgendamentoData>): Promise<void> {
  try {
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (dados.localEstagio !== undefined) updateData.localEstagio = dados.localEstagio;
    if (dados.area !== undefined) updateData.area = dados.area;
    if (dados.vagasDisponiveis !== undefined) updateData.vagasDisponiveis = dados.vagasDisponiveis;
    if (dados.horarioInicio !== undefined) updateData.horarioInicio = dados.horarioInicio;
    if (dados.horarioFim !== undefined) updateData.horarioFim = dados.horarioFim;
    if (dados.aluno !== undefined) updateData.aluno = dados.aluno;
    if (dados.alunoId !== undefined) updateData.alunoId = dados.alunoId;
    if (dados.professor !== undefined) updateData.professor = dados.professor;
    if (dados.professorId !== undefined) updateData.professorId = dados.professorId;
    // Novos campos
    if (dados.alunosIds !== undefined) updateData.alunosIds = dados.alunosIds;
    if (dados.alunosNomes !== undefined) updateData.alunosNomes = dados.alunosNomes;
    if (dados.professoresIds !== undefined) updateData.professoresIds = dados.professoresIds;
    if (dados.professoresNomes !== undefined) updateData.professoresNomes = dados.professoresNomes;
    if (dados.observacoes !== undefined) updateData.observacoes = dados.observacoes;
    if (dados.data !== undefined) updateData.data = dados.data;
    if (dados.status !== undefined) updateData.status = dados.status;

    await agendamentosCollection.doc(firebaseId).update(updateData);
  } catch (error: any) {
    console.error('[agendamentosController] Erro ao atualizar agendamento:', error);
    throw error;
  }
}

async function deleteAgendamentoFromFirebase(firebaseId: string): Promise<void> {
  try {
    await agendamentosCollection.doc(firebaseId).delete();
  } catch (error: any) {
    console.error('[agendamentosController] Erro ao deletar agendamento:', error);
    throw error;
  }
}

async function getAgendamentosPorPeriodo(dataInicio: string, dataFim: string): Promise<any[]> {
  try {
    const snapshot = await agendamentosCollection
      .where('data', '>=', dataInicio)
      .where('data', '<=', dataFim)
      .get();
    
    const agendamentos: any[] = [];
    
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
  } catch (error: any) {
    console.error('[agendamentosController] Erro ao buscar agendamentos por período:', error);
    throw error;
  }
}

export class AgendamentosController {

  async criar(req: Request, res: Response): Promise<void> {
    try {
      const { localEstagio, area, vagasDisponiveis, horarioInicio, horarioFim, aluno, alunoId, professor, professorId, observacoes, data, status } = req.body;

      if (!localEstagio || !horarioInicio || !horarioFim || !data) {
        res.status(400).json({
          error: 'Campos obrigatórios: localEstagio, horarioInicio, horarioFim, data'
        });
        return;
      }

      const dadosAgendamento: AgendamentoData = {
        localEstagio,
        area,
        vagasDisponiveis,
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
    } catch (error: any) {
      console.error('[agendamentosController] Erro ao criar agendamento:', error);
      res.status(500).json({
        error: 'Erro ao criar agendamento',
        message: error.message
      });
    }
  }

  async listar(req: Request, res: Response): Promise<void> {
    try {
      const agendamentos = await getAllAgendamentosFromFirebase();
      res.status(200).json({ agendamentos });
    } catch (error: any) {
      console.error('[agendamentosController] Erro ao listar agendamentos:', error);
      res.status(500).json({
        error: 'Erro ao listar agendamentos',
        message: error.message
      });
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      console.error('[agendamentosController] Erro ao buscar agendamento:', error);
      res.status(500).json({
        error: 'Erro ao buscar agendamento',
        message: error.message
      });
    }
  }

  async buscarPorPeriodo(req: Request, res: Response): Promise<void> {
    try {
      const { dataInicio, dataFim } = req.query;

      if (!dataInicio || !dataFim) {
        res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
        return;
      }

      const agendamentos = await getAgendamentosPorPeriodo(String(dataInicio), String(dataFim));
      res.status(200).json({ agendamentos });
    } catch (error: any) {
      console.error('[agendamentosController] Erro ao buscar agendamentos por período:', error);
      res.status(500).json({
        error: 'Erro ao buscar agendamentos por período',
        message: error.message
      });
    }
  }

  async editar(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      console.error('[agendamentosController] Erro ao editar agendamento:', error);
      res.status(500).json({
        error: 'Erro ao editar agendamento',
        message: error.message
      });
    }
  }

  async deletar(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      console.error('[agendamentosController] Erro ao deletar agendamento:', error);
      res.status(500).json({
        error: 'Erro ao deletar agendamento',
        message: error.message
      });
    }
  }
}

export default new AgendamentosController();

import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface Estagio {
    id: string;
    local: string;
    horarios: string[];
    area: string;
    vagasDisponiveis: number;
    professor?: string;
    alunosIds?: string[];
    alunosNomes?: string[];
    professoresIds?: string[];
    professoresNomes?: string[];
    status?: 'vigente' | 'encerrado';
}

export const useEstagioData = () => {
    const [estagios, setEstagios] = useState<Estagio[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function fetchEstagios() {
            setLoading(true);
            setErro(null);
            try {
                const response = await apiService.get<any>('/agendamentos');
                if (response && Array.isArray(response.agendamentos)) {
                    const estagiosData = response.agendamentos.map((agendamento: any) => ({
                        id: agendamento.id,
                        local: agendamento.localEstagio || 'Local não informado',
                        area: agendamento.area || 'Área não informada',
                        horarios: [
                            agendamento.horarioInicio && agendamento.horarioFim 
                                ? `${agendamento.horarioInicio} - ${agendamento.horarioFim}` 
                                : 'Horário não informado'
                        ],
                        vagasDisponiveis: agendamento.vagasDisponiveis || 1,
                        professor: agendamento.professor,
                        professorId: agendamento.professorId,
                        data: agendamento.data,
                        status: agendamento.status
                    }));
                    setEstagios(estagiosData);
                } else {
                    setErro('Nenhum estágio encontrado.');
                }
            } catch (err: any) {
                console.error('❌ Erro ao buscar estágios:', err);
                if (err.message?.includes('401')) {
                    setErro('Você precisa estar logado para ver os estágios.');
                } else {
                    setErro('Erro ao buscar estágios. Tente novamente.');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchEstagios();
    }, []);

    return { estagios, loading, erro, setEstagios };
};

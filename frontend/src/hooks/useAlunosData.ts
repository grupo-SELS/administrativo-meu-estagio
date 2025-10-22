import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface Aluno {
    id: string;
    nome: string;
    matricula: string;
    [key: string]: any;
}

export const useAlunosData = () => {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAlunos() {
            setLoading(true);
            setErro(null);
            try {
                const timestamp = Date.now();
                const response = await apiService.get<any>(`/alunos?t=${timestamp}`);
                if (response && Array.isArray(response.alunos)) {
                    setAlunos(response.alunos);
                } else {
                    setErro('Nenhum aluno encontrado.');
                }
            } catch (err: any) {
                console.error('❌ Erro ao buscar alunos:', err);
                if (err.message?.includes('401')) {
                    setErro('Você precisa estar logado para ver os alunos.');
                } else {
                    setErro('Erro ao buscar alunos. Tente novamente.');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchAlunos();
    }, []);

    return { alunos, loading, erro, setAlunos };
};

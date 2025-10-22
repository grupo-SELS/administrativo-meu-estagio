import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

export const useProfessoresData = () => {
    const [professores, setProfessores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfessores() {
            setLoading(true);
            setErro(null);
            try {
                const response = await apiService.get<any>('/professores');
                if (response && Array.isArray(response.professores)) {
                    setProfessores(response.professores);
                } else {
                    setErro('Nenhum professor encontrado.');
                }
            } catch (err: any) {
                console.error('❌ Erro ao buscar professores:', err);
                if (err.message?.includes('401')) {
                    setErro('Você precisa estar logado para ver os professores.');
                } else {
                    setErro('Erro ao buscar professores. Tente novamente.');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchProfessores();
    }, []);

    return { professores, loading, erro, setProfessores };
};

import { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';

import apiService from '../services/apiService';

interface Aluno {
    id: string;
    nome: string;
    matricula: string;
    [key: string]: any;
}

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

interface AtribuicoesEstagio {
    estagioId: string;
    professorId: string | null;
    professorNome: string | null;
    alunosIds: string[];
}

export default function AgendamentoEstagio() {
    const { showSuccess, showError, showWarning } = useToast();
    const { confirm, ConfirmComponent } = useConfirm();
    const [estagios, setEstagios] = useState<Estagio[]>([]);
    const [estagioSelecionado, setEstagioSelecionado] = useState<string | null>(null);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [loadingAlunos, setLoadingAlunos] = useState(true);
    const [erroAlunos, setErroAlunos] = useState<string | null>(null);
    const [loadingEstagios, setLoadingEstagios] = useState(true);
    const [erroEstagios, setErroEstagios] = useState<string | null>(null);
    const [loadingProfessores, setLoadingProfessores] = useState(true);
    const [erroProfessores, setErroProfessores] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAlunos() {
            setLoadingAlunos(true);
            setErroAlunos(null);
            try {
                // Adicionar timestamp para evitar cache
                const timestamp = new Date().getTime();
                const response = await apiService.get<any>(`/alunos?t=${timestamp}`);
                if (response && Array.isArray(response.alunos)) {
                    console.log(`📊 AgendamentoEstagio: Total de alunos recebidos: ${response.alunos.length}`);
                    setAlunos(response.alunos);
                } else {
                    setErroAlunos('Nenhum aluno encontrado.');
                }
            } catch (err: any) {
                console.error('❌ Erro ao buscar alunos:', err);
                if (err.message && err.message.includes('401')) {
                    setErroAlunos('Você precisa estar logado para ver os alunos.');
                } else {
                    setErroAlunos('Erro ao buscar alunos. Tente novamente.');
                }
            } finally {
                setLoadingAlunos(false);
            }
        }
        fetchAlunos();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterPolo, setFilterPolo] = useState<string | null>(null);
    const [showProfessores, setShowProfessores] = useState(false);
    const [professores, setProfessores] = useState<any[]>([]);
    const [atribuindoProfessor, setAtribuindoProfessor] = useState(false);
    const [professorSelecionadoId, setProfessorSelecionadoId] = useState<string | null>(null);
    const [atribuindoAlunos, setAtribuindoAlunos] = useState(false);
    const [alunosAtribuidosIds, setAlunosAtribuidosIds] = useState<string[]>([]);
    const [menuAberto, setMenuAberto] = useState<string | null>(null);
    const [atribuicoes, setAtribuicoes] = useState<AtribuicoesEstagio[]>([]);
    const [modalAtribuidosAberto, setModalAtribuidosAberto] = useState(false);
    const [estagioVisualizando, setEstagioVisualizando] = useState<string | null>(null);
    const [alunosPage, setAlunosPage] = useState(1);
    const [professoresPage, setProfessoresPage] = useState(1);
    const [estagiosPage, setEstagiosPage] = useState(1);
    const itemsPerPageAlunos = 5;
    const itemsPerPageProfessores = 5;
    const itemsPerPageEstagios = 2;
    

    const [mostrarOcupados, setMostrarOcupados] = useState(false);
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [estagioEditando, setEstagioEditando] = useState<Estagio | null>(null);
    const [formEdicao, setFormEdicao] = useState({
        local: '',
        area: '',
        horarioInicio: '',
        horarioFim: '',
        vagasDisponiveis: 0,
        status: 'vigente' as 'vigente' | 'encerrado'
    });

    useEffect(() => {
        
    }, [estagioSelecionado, atribuicoes]);

    useEffect(() => {
        async function fetchEstagios() {
            setLoadingEstagios(true);
            setErroEstagios(null);
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
                    setErroEstagios('Nenhum estágio encontrado.');
                    setEstagios([]);
                }
            } catch (err: any) {
                console.error('❌ Erro ao buscar estágios:', err);
                setErroEstagios('Erro ao buscar estágios. Tente novamente.');
                setEstagios([]);
            } finally {
                setLoadingEstagios(false);
            }
        }
        fetchEstagios();
    }, []);

    useEffect(() => {
        async function fetchProfessores() {
            setLoadingProfessores(true);
            setErroProfessores(null);
            try {
                const response = await apiService.get<any>('/professores');
                if (response && Array.isArray(response.professores)) {
                    setProfessores(response.professores);
                } else {
                    setErroProfessores('Nenhum professor encontrado.');
                    setProfessores([]);
                }
            } catch (err: any) {
                console.error('❌ Erro ao buscar professores:', err);
                setErroProfessores('Erro ao buscar professores. Tente novamente.');
                setProfessores([]);
            } finally {
                setLoadingProfessores(false);
            }
        }
        fetchProfessores();
    }, []);

    const handleExportarCSV = () => {
        try {

            if (estagios.length === 0) {
                showWarning('Não há estágios cadastrados para exportar.');
                return;
            }


            const csvLines: string[] = [];
            

            csvLines.push('RELATÓRIO DE AGENDAMENTOS DE ESTÁGIO');
            csvLines.push(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`);
            csvLines.push(''); 


            estagios.forEach((estagio, index) => {
                // Buscar atribuições deste estágio
                const atribuicao = atribuicoes.find(a => a.estagioId === estagio.id);
                

                const professorAtribuido = atribuicao?.professorId 
                    ? professores.find(p => p.id === atribuicao.professorId)
                    : null;
                

                const alunosAtribuidos = atribuicao?.alunosIds
                    ? alunos.filter(a => atribuicao.alunosIds.includes(a.id))
                    : [];


                csvLines.push(`ESTÁGIO ${index + 1}`);
                

                csvLines.push(`Local:,${estagio.local || 'Local não informado'}`);
                csvLines.push(`Área:,${estagio.area || 'Área não informada'}`);
                csvLines.push(`Horários:,${estagio.horarios?.length > 0 ? estagio.horarios.join(', ') : 'Horário não informado'}`);
                csvLines.push(`Vagas Disponíveis:,,,${estagio.vagasDisponiveis}`);
                csvLines.push(`Vagas Preenchidas:,,,${alunosAtribuidos.length}`);
                csvLines.push('');
                

                csvLines.push('Professor Orientador:');
                csvLines.push('Nome,Matrícula,Polo,Horário');
                if (professorAtribuido) {
                    const horarioProfessor = professorAtribuido.horario || estagio.horarios?.join(' - ') || '';
                    csvLines.push(`${professorAtribuido.nome},${professorAtribuido.matricula || 'N/A'},${professorAtribuido.polo || 'resende'},${horarioProfessor}`);
                } else {
                    csvLines.push('Nenhum professor atribuído,,,');
                }
                csvLines.push('');
                

                csvLines.push('Alunos no Estágio:');
                csvLines.push('Nome,Matrícula,Polo,Horário');
                if (alunosAtribuidos.length > 0) {
                    alunosAtribuidos.forEach((aluno) => {
                        const horarioAluno = aluno.horario || estagio.horarios?.join(' - ') || '';
                        csvLines.push(`${aluno.nome},${aluno.matricula || 'N/A'},${aluno.polo || 'voltaredonda'},${horarioAluno}`);
                    });
                } else {
                    csvLines.push('Nenhum aluno atribuído,,,');
                }
                csvLines.push('');
            });


            const csvContent = csvLines.join('\n');


            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });


            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            

            const dataHora = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.setAttribute('download', `agendamentos-estagio-${dataHora}.csv`);
            

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            

            URL.revokeObjectURL(url);

            showSuccess('CSV exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            showError('Erro ao exportar CSV. Tente novamente.');
        }
    };

    const handleDeletarEstagio = async (estagioId: string) => {
        const estagio = estagios.find(e => e.id === estagioId);
        if (!estagio) {
            showError('Estágio não encontrado.');
            return;
        }

        const confirmacao = await confirm({
            title: 'Deletar Estágio',
            message: `Tem certeza que deseja deletar o estágio?\n\nLocal: ${estagio.local}\nÁrea: ${estagio.area}\n\nEsta ação não pode ser desfeita.`,
            confirmText: 'Deletar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmacao) return;

        try {
            await apiService.deletarAgendamento(estagioId);
            
            setEstagios(prev => prev.filter(e => e.id !== estagioId));
            

            setAtribuicoes(prev => prev.filter(a => a.estagioId !== estagioId));
            

            if (estagioSelecionado === estagioId) {
                setEstagioSelecionado(null);
            }

            showSuccess('Estágio deletado com sucesso!');
        } catch (error: any) {
            console.error('❌ Erro ao deletar estágio:', error);
            showError('Erro ao deletar estágio. Verifique o console para mais detalhes.');
        }
    };


    const handleSalvarAtribuicoes = async (estagioId: string, mostrarMensagem: boolean = true) => {
        try {
            const atribuicao = atribuicoes.find(a => a.estagioId === estagioId);
            if (!atribuicao) {
                if (mostrarMensagem) {
                    showWarning('Nenhuma atribuição encontrada para este estágio.');
                }
                return;
            }


            const alunosNomes = alunos
                .filter(a => atribuicao.alunosIds.includes(a.id))
                .map(a => a.nome);
            
            const professoresNomes = atribuicao.professorId 
                ? [professores.find(p => p.id === atribuicao.professorId)?.nome || '']
                : [];

            const professoresIds = atribuicao.professorId ? [atribuicao.professorId] : [];


            await apiService.updateAgendamento(estagioId, {
                alunosIds: atribuicao.alunosIds,
                alunosNomes: alunosNomes,
                professoresIds: professoresIds,
                professoresNomes: professoresNomes
            });

            if (mostrarMensagem) {
                showSuccess('Atribuições salvas com sucesso!');
            }
            

            const response = await apiService.get<any>('/agendamentos');
            if (response && Array.isArray(response.agendamentos)) {
                const estagiosData = response.agendamentos.map((agendamento: any) => ({
                    id: agendamento.id,
                    local: agendamento.localEstagio,
                    horarios: [agendamento.horarioInicio, agendamento.horarioFim],
                    area: agendamento.area,
                    vagasDisponiveis: agendamento.vagasDisponiveis || 0,
                    alunosIds: agendamento.alunosIds || [],
                    alunosNomes: agendamento.alunosNomes || [],
                    professoresIds: agendamento.professoresIds || [],
                    professoresNomes: agendamento.professoresNomes || [],
                    status: agendamento.status || 'vigente'
                }));
                setEstagios(estagiosData);
            }
        } catch (error: any) {
            console.error('❌ Erro ao salvar atribuições:', error);
            if (mostrarMensagem) {
                showError('Erro ao salvar atribuições. Verifique o console para mais detalhes.');
            }
        }
    };


    const handleAbrirModalEdicao = (estagio: Estagio) => {
        setEstagioEditando(estagio);
        setFormEdicao({
            local: estagio.local,
            area: estagio.area,
            horarioInicio: estagio.horarios[0] || '',
            horarioFim: estagio.horarios[1] || '',
            vagasDisponiveis: estagio.vagasDisponiveis,
            status: estagio.status || 'vigente'
        });
        setModalEditarAberto(true);
    };


    const handleSalvarEdicao = async () => {
        if (!estagioEditando) return;

        try {
            await apiService.updateAgendamento(estagioEditando.id, {
                localEstagio: formEdicao.local,
                area: formEdicao.area,
                horarioInicio: formEdicao.horarioInicio,
                horarioFim: formEdicao.horarioFim,
                vagasDisponiveis: formEdicao.vagasDisponiveis,
                status: formEdicao.status
            });

            showSuccess('Estágio atualizado com sucesso!');
            setModalEditarAberto(false);
            setEstagioEditando(null);


            const response = await apiService.get<any>('/agendamentos');
            if (response && Array.isArray(response.agendamentos)) {
                const estagiosData = response.agendamentos.map((agendamento: any) => ({
                    id: agendamento.id,
                    local: agendamento.localEstagio,
                    horarios: [agendamento.horarioInicio, agendamento.horarioFim],
                    area: agendamento.area,
                    vagasDisponiveis: agendamento.vagasDisponiveis || 0,
                    alunosIds: agendamento.alunosIds || [],
                    alunosNomes: agendamento.alunosNomes || [],
                    professoresIds: agendamento.professoresIds || [],
                    professoresNomes: agendamento.professoresNomes || [],
                    status: agendamento.status || 'vigente'
                }));
                setEstagios(estagiosData);
            }
        } catch (error: any) {
            console.error('❌ Erro ao salvar edição:', error);
            showError('Erro ao salvar edição. Verifique o console para mais detalhes.');
        }
    };

    const polosDisponiveis = useMemo(() => {
        const polos = Array.from(new Set(alunos.map(a => a.polo).filter(Boolean)));
        return polos;
    }, [alunos]);


    const filteredAlunos = useMemo(() => {
        return alunos.filter(a => {
            const matchesSearch = searchTerm.trim() === '' || 
                a.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (a.matricula && a.matricula.includes(searchTerm));
            const matchesPolo = !filterPolo || a.polo === filterPolo;
            return matchesSearch && matchesPolo;
        });
    }, [alunos, searchTerm, filterPolo]);


    const filteredEstagios = useMemo(() => {
        if (!mostrarOcupados) {
            return estagios;
        }
        return estagios.filter(e => {
            const temAlunos = (e.alunosIds && e.alunosIds.length > 0) || 
                             atribuicoes.some(a => a.estagioId === e.id && a.alunosIds.length > 0);
            return temAlunos;
        });
    }, [estagios, mostrarOcupados, atribuicoes]);

    
    const alunosTotalPages = Math.max(1, Math.ceil(filteredAlunos.length / itemsPerPageAlunos));
    const alunosStartIndex = (alunosPage - 1) * itemsPerPageAlunos;
    const alunosEndIndex = alunosStartIndex + itemsPerPageAlunos;
    const currentAlunos = filteredAlunos.slice(alunosStartIndex, alunosEndIndex);

    
    const professoresTotalPages = Math.max(1, Math.ceil(professores.length / itemsPerPageProfessores));
    const professoresStartIndex = (professoresPage - 1) * itemsPerPageProfessores;
    const professoresEndIndex = professoresStartIndex + itemsPerPageProfessores;
    const currentProfessores = professores.slice(professoresStartIndex, professoresEndIndex);

    
    const estagiosTotalPages = Math.max(1, Math.ceil(filteredEstagios.length / itemsPerPageEstagios));
    const estagiosStartIndex = (estagiosPage - 1) * itemsPerPageEstagios;
    const estagiosEndIndex = estagiosStartIndex + itemsPerPageEstagios;
    const currentEstagios = filteredEstagios.slice(estagiosStartIndex, estagiosEndIndex);

    
    useEffect(() => {
        setAlunosPage(1);
    }, [searchTerm, filterPolo]);

    return (
        <>
            <Header />
            <main className="bg-gray-900 min-h-screen pt-20 sm:ml-64">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Agendamento de Estágio</h1>
                        <p className="text-gray-400">Gerencie os agendamentos e atribuições de estágios</p>
                    </div>

                    <section className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700/50 p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-4 justify-between">
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
                                <div>
                                    <h3 className="text-gray-100 text-lg font-semibold">
                                        Ações Rápidas
                                    </h3>
                                    {estagioSelecionado && (() => {
                                        const atribuicaoAtual = atribuicoes.find(a => a.estagioId === estagioSelecionado);
                                        return (
                                            <div className="text-xs mt-1 flex items-center gap-2">
                                                {atribuicaoAtual ? (
                                                    <>
                                                        {atribuicaoAtual.professorId && (
                                                            <span className="text-green-400">✓ Professor</span>
                                                        )}
                                                        {atribuicaoAtual.alunosIds && atribuicaoAtual.alunosIds.length > 0 && (
                                                            <span className="text-green-400">✓ {atribuicaoAtual.alunosIds.length} Aluno(s)</span>
                                                        )}
                                                        {(!atribuicaoAtual.professorId || !atribuicaoAtual.alunosIds || atribuicaoAtual.alunosIds.length === 0) && (
                                                            <span className="text-yellow-400">⚠ Atribuições incompletas</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">Nenhuma atribuição</span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                            <nav className="flex gap-3 flex-wrap">
                                <Link to="/novo-agendamento">
                                    <button
                                        className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-700"
                                    >
                                        <svg className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        <span>Novo Agendamento</span>
                                    </button>
                                </Link>


                                <button
                                    onClick={handleExportarCSV}
                                    className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path opacity="0.4" d="M18.4067 5.68442C18.4067 5.2702 18.7425 4.93442 19.1567 4.93442C19.5709 4.93442 19.9067 5.2702 19.9067 5.68442V17.2514C19.9067 19.8747 17.7801 22.0014 15.1567 22.0014H7.79785C7.38364 22.0014 7.04785 21.6656 7.04785 21.2514C7.04785 20.8371 7.38364 20.5014 7.79785 20.5014H15.1567C16.9516 20.5014 18.4067 19.0463 18.4067 17.2514V5.68442Z" fill="#343C54" />
                                        <path d="M16.8923 16.7332V4.25C16.8923 3.00736 15.885 2 14.6423 2H10.6929C10.0959 2 9.52341 2.23725 9.10142 2.65951L4.75226 7.01138C4.33061 7.4333 4.09375 8.00538 4.09375 8.60187V16.7332C4.09375 17.9759 5.10111 18.9832 6.34375 18.9832H14.6423C15.885 18.9832 16.8923 17.9759 16.8923 16.7332ZM14.6423 17.4832H6.34375C5.92954 17.4832 5.59375 17.1475 5.59375 16.7332V8.73129H8.57486C9.81813 8.73129 10.8257 7.72296 10.8249 6.47969L10.8227 3.5H14.6423C15.0565 3.5 15.3923 3.83579 15.3923 4.25V16.7332C15.3923 17.1475 15.0566 17.4832 14.6423 17.4832ZM6.65314 7.23129L9.32349 4.55928L9.32486 6.48076C9.32516 6.89518 8.98928 7.23129 8.57486 7.23129H6.65314Z" fill="#343C54" />
                                    </svg>
                                    <span>Exportar CSV</span>
                                </button>
                                <input
                                    type="text"
                                    placeholder="Pesquisar aluno ou matrícula..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-400 text-sm w-60"
                                />
                                <select 
                                    className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-blue-400 text-sm min-w-[200px]" 
                                    value={filterPolo || ''} 
                                    onChange={e => {
                                        const newValue = e.target.value || null;
                                        setFilterPolo(newValue);
                                    }}
                                >
                                    <option value="">Todos os polos ({alunos.length} alunos)</option>
                                    {polosDisponiveis.length === 0 ? (
                                        <option disabled>Nenhum polo disponível</option>
                                    ) : (
                                        polosDisponiveis.map(p => {
                                            const qtdAlunos = alunos.filter(a => a.polo === p).length;
                                            return <option key={p} value={p}>{p} ({qtdAlunos})</option>;
                                        })
                                    )}
                                </select>
                            </nav>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ overflow: 'visible' }}>

                        <section className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col" style={{ overflow: 'visible' }}>
                            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 px-6 py-4 border-b border-gray-700 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            {showProfessores ? (
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{showProfessores ? 'Professores' : 'Alunos'}</h2>
                                            {showProfessores && atribuindoProfessor && (
                                                <span className="text-blue-300 text-xs font-medium">Modo: Atribuir Professor</span>
                                            )}
                                            {!showProfessores && atribuindoAlunos && (
                                                <span className="text-blue-300 text-xs font-medium">Modo: Atribuir Alunos</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg"
                                        onClick={() => {
                                            setShowProfessores((prev) => !prev);
                                            setAtribuindoProfessor(false);
                                            setProfessorSelecionadoId(null);
                                        }}
                                    >
                                        {showProfessores ? 'Ver Alunos' : 'Professores'}
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                            {showProfessores ? (
                                <>
                                    {loadingProfessores ? (
                                        <div className="text-gray-300 text-center py-8">Carregando professores...</div>
                                    ) : erroProfessores ? (
                                        <div className="text-red-400 text-center py-8">{erroProfessores}</div>
                                    ) : (
                                        <>
                                    <ul className="flex-1 overflow-y-auto pr-2 scrollbar-styled space-y-3">
                                        {currentProfessores.length === 0 ? (
                                            <div className="text-gray-400 text-center py-8">
                                                Nenhum professor cadastrado.
                                            </div>
                                        ) : (
                                            currentProfessores.map(prof => (
                                            <li
                                                key={prof.id}
                                                className={`p-4 rounded-xl border transition-all duration-200 ${
                                                    professorSelecionadoId === prof.id
                                                        ? 'bg-blue-600 border-blue-400 shadow-lg'
                                                        : 'bg-gray-700/70 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {atribuindoProfessor && (
                                                        <input
                                                            type="checkbox"
                                                            checked={professorSelecionadoId === prof.id}
                                                            onChange={() => setProfessorSelecionadoId(prof.id)}
                                                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                        />
                                                    )}
                                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {prof.nome.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-white">{prof.nome}</div>
                                                        <div className="text-xs text-gray-300 flex items-center gap-1 mt-0.5">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                            </svg>
                                                            {prof.matricula}
                                                        </div>
                                                        {prof.polo && (
                                                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                </svg>
                                                                {prof.polo}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                            ))
                                        )}
                                    </ul>


                                    {professoresTotalPages > 1 && !atribuindoProfessor && professores.length > 0 && (
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                                            <div className="text-xs text-gray-400">
                                                {professoresStartIndex + 1}-{Math.min(professoresEndIndex, professores.length)} de {professores.length}
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setProfessoresPage(prev => Math.max(1, prev - 1))}
                                                    disabled={professoresPage === 1}
                                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-all"
                                                >
                                                    ←
                                                </button>
                                                <span className="px-3 py-1 text-gray-300 text-xs">
                                                    {professoresPage}/{professoresTotalPages}
                                                </span>
                                                <button
                                                    onClick={() => setProfessoresPage(prev => Math.min(professoresTotalPages, prev + 1))}
                                                    disabled={professoresPage === professoresTotalPages}
                                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-all"
                                                >
                                                    →
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {atribuindoProfessor && (
                                        <div className="flex gap-3 justify-end mt-4">
                                            <button
                                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md font-medium text-sm"
                                                onClick={async () => {
                                                    if (professorSelecionadoId && estagioSelecionado) {
                                                        const professorSelecionado = professores.find(p => p.id === professorSelecionadoId);

                                                        setAtribuicoes(prev => {
                                                            const existe = prev.find(a => a.estagioId === estagioSelecionado);
                                                            
                                                            let novasAtribuicoes;
                                                            if (existe) {
                                                                novasAtribuicoes = prev.map(a => 
                                                                    a.estagioId === estagioSelecionado 
                                                                        ? { ...a, professorId: professorSelecionadoId, professorNome: professorSelecionado?.nome || null }
                                                                        : a
                                                                );
                                                            } else {
                                                                novasAtribuicoes = [...prev, {
                                                                    estagioId: estagioSelecionado,
                                                                    professorId: professorSelecionadoId,
                                                                    professorNome: professorSelecionado?.nome || null,
                                                                    alunosIds: []
                                                                }];
                                                            }
                                                            return novasAtribuicoes;
                                                        });
                                                        

                                                        setTimeout(async () => {
                                                            await handleSalvarAtribuicoes(estagioSelecionado, false);
                                                            showSuccess('Professor atribuído com sucesso!');
                                                        }, 100);
                                                    }
                                                    setAtribuindoProfessor(false);
                                                    setProfessorSelecionadoId(null);
                                                }}
                                                disabled={!professorSelecionadoId}
                                            >Confirmar</button>
                                            <button
                                                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium text-sm"
                                                onClick={() => {
                                                    setAtribuindoProfessor(false);
                                                    setProfessorSelecionadoId(null);
                                                }}
                                            >Cancelar</button>
                                        </div>
                                    )}
                                        </>
                                    )}
                                </>
                            ) : loadingAlunos ? (
                                <div className="text-gray-300">Carregando alunos...</div>
                            ) : erroAlunos ? (
                                <div className="text-red-400">{erroAlunos}</div>
                            ) : (
                                <>
                                    <div className="mb-4 flex flex-col gap-3">
                                        <input
                                            type="text"
                                            placeholder="Pesquisar por nome ou matrícula..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setAlunosPage(1);
                                            }}
                                            className="w-full px-4 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                    <ul className="flex-1 overflow-y-auto pr-2 scrollbar-styled space-y-3">
                                        {currentAlunos.length === 0 ? (
                                            <div className="text-gray-400 text-center py-8">
                                                {searchTerm || filterPolo ? 'Nenhum aluno encontrado com os filtros aplicados.' : 'Nenhum aluno cadastrado.'}
                                            </div>
                                        ) : (
                                            currentAlunos.map(aluno => (
                                            <li
                                                key={aluno.id}
                                                className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                                                    alunosAtribuidosIds.includes(aluno.id) 
                                                        ? 'bg-blue-600 border-blue-400 shadow-lg' 
                                                        : 'bg-gray-700/70 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {atribuindoAlunos && (
                                                        <input
                                                            type="checkbox"
                                                            checked={alunosAtribuidosIds.includes(aluno.id)}
                                                            disabled={
                                                                !alunosAtribuidosIds.includes(aluno.id) && alunosAtribuidosIds.length >= (estagios.find((e: Estagio) => e.id === estagioSelecionado)?.vagasDisponiveis || 1)
                                                            }
                                                            onChange={() => {
                                                                if (alunosAtribuidosIds.includes(aluno.id)) {
                                                                    setAlunosAtribuidosIds(alunosAtribuidosIds.filter(id => id !== aluno.id));
                                                                } else if (alunosAtribuidosIds.length < (estagios.find((e: Estagio) => e.id === estagioSelecionado)?.vagasDisponiveis || 1)) {
                                                                    setAlunosAtribuidosIds([...alunosAtribuidosIds, aluno.id]);
                                                                }
                                                            }}
                                                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                        />
                                                    )}
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {aluno.nome.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-white">{aluno.nome}</div>
                                                        <div className="text-xs text-gray-300 flex items-center gap-1 mt-0.5">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                            </svg>
                                                            {aluno.matricula}
                                                        </div>
                                                        {aluno.polo && (
                                                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                </svg>
                                                                {aluno.polo}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                            ))
                                        )}
                                    </ul>


                                    {alunosTotalPages > 1 && !atribuindoAlunos && filteredAlunos.length > 0 && (
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                                            <div className="text-xs text-gray-400">
                                                {alunosStartIndex + 1}-{Math.min(alunosEndIndex, filteredAlunos.length)} de {filteredAlunos.length}
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setAlunosPage(prev => Math.max(1, prev - 1))}
                                                    disabled={alunosPage === 1}
                                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-all"
                                                >
                                                    ←
                                                </button>
                                                <span className="px-3 py-1 text-gray-300 text-xs">
                                                    {alunosPage}/{alunosTotalPages}
                                                </span>
                                                <button
                                                    onClick={() => setAlunosPage(prev => Math.min(alunosTotalPages, prev + 1))}
                                                    disabled={alunosPage === alunosTotalPages}
                                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-all"
                                                >
                                                    →
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {atribuindoAlunos && (
                                        <div className="flex gap-3 justify-end mt-4">
                                            <button
                                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md font-medium text-sm"
                                                onClick={async () => {
                                                    if (estagioSelecionado && alunosAtribuidosIds.length > 0) {
                                                        setAtribuicoes(prev => {
                                                            const existe = prev.find(a => a.estagioId === estagioSelecionado);
                                                            
                                                            let novasAtribuicoes;
                                                            if (existe) {
                                                                novasAtribuicoes = prev.map(a => 
                                                                    a.estagioId === estagioSelecionado 
                                                                        ? { ...a, alunosIds: alunosAtribuidosIds }
                                                                        : a
                                                                );
                                                            } else {
                                                                novasAtribuicoes = [...prev, {
                                                                    estagioId: estagioSelecionado,
                                                                    professorId: null,
                                                                    professorNome: null,
                                                                    alunosIds: alunosAtribuidosIds
                                                                }];
                                                            }
                                                            return novasAtribuicoes;
                                                        });
                                                        
                                                        setTimeout(async () => {
                                                            await handleSalvarAtribuicoes(estagioSelecionado, false);
                                                            showSuccess('Alunos atribuídos com sucesso!');
                                                        }, 100);
                                                    }
                                                    setAtribuindoAlunos(false);
                                                    setAlunosAtribuidosIds([]);
                                                }}
                                                disabled={alunosAtribuidosIds.length === 0}
                                            >Confirmar</button>
                                            <button
                                                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium text-sm"
                                                onClick={() => {
                                                    setAtribuindoAlunos(false);
                                                    setAlunosAtribuidosIds([]);
                                                }}
                                            >Cancelar</button>
                                        </div>
                                    )}
                                </>
                            )}
                            </div>
                        </section>


                        <section className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col" style={{ overflow: 'visible' }}>
                            <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 px-6 py-4 border-b border-gray-700 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Locais de Estágio</h2>
                                            <p className="text-green-300 text-xs">Vagas disponíveis para agendamento</p>
                                        </div>
                                    </div>
                                    <button
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg ${
                                            mostrarOcupados 
                                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                : 'bg-green-700 hover:bg-green-600 text-white'
                                        }`}
                                        onClick={() => {
                                            setMostrarOcupados(!mostrarOcupados);
                                            setEstagiosPage(1);
                                        }}
                                    >
                                        {mostrarOcupados ? 'Todos' : 'Ocupados'}
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 flex-1 scrollbar-styled" style={{ overflowY: 'auto', overflowX: 'visible' }}>
                            {loadingEstagios ? (
                                <div className="text-gray-300 text-center py-8">Carregando estágios...</div>
                            ) : erroEstagios ? (
                                <div className="text-red-400 text-center py-8">{erroEstagios}</div>
                            ) : (
                            <div className="flex flex-col gap-6" style={{ overflow: 'visible' }}>
                                {currentEstagios.length === 0 && (
                                    <div className="text-gray-400 text-center py-8">
                                        Nenhum estágio disponível no momento.
                                    </div>
                                )}
                                {currentEstagios.map((estagio: Estagio) => (
                                    <div
                                        key={estagio.id}
                                        className={`relative rounded-xl p-5 shadow-xl cursor-pointer transition-all duration-300 border-2 ${
                                            estagioSelecionado === estagio.id 
                                                ? 'border-blue-500 bg-gradient-to-br from-blue-900/40 to-blue-800/40 shadow-blue-500/20' 
                                                : 'border-gray-700 bg-gray-700/50 hover:border-blue-400 hover:shadow-2xl'
                                        }`}
                                        style={{ zIndex: menuAberto === estagio.id ? 100000 : 1, position: 'relative' }}
                                        onClick={() => setEstagioSelecionado(estagio.id)}
                                    >
                                        {estagioSelecionado === estagio.id && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-white">{estagio.area}</h3>
                                                    {estagio.status === 'encerrado' && (
                                                        <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-xs font-bold">
                                                            Encerrado
                                                        </span>
                                                    )}
                                                    {estagio.status === 'vigente' && (
                                                        <span className="px-2 py-0.5 rounded-md bg-green-600 text-white text-xs font-bold">
                                                            Vigente
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-300 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {estagio.local}
                                                </p>
                                            </div>
                                            <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold shadow-lg flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                                </svg>
                                                {estagio.vagasDisponiveis} vaga{estagio.vagasDisponiveis > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-4 bg-gray-800/50 px-3 py-2 rounded-lg">
                                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{estagio.horarios.join(', ')}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-600">
                                            <div className="flex gap-2">
                                                <button
                                                    className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 flex items-center gap-1.5 shadow-md"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowProfessores(true);
                                                        setAtribuindoProfessor(true);
                                                    }}
                                                    disabled={atribuindoProfessor}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Professor
                                                </button>
                                                <button
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 flex items-center gap-1.5 shadow-md"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAtribuindoAlunos(true);
                                                        setEstagioSelecionado(estagio.id);
                                                        setAlunosAtribuidosIds([]);
                                                    }}
                                                    disabled={atribuindoAlunos}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    Alunos
                                                </button>
                                            </div>
                                            

                                            <div className="relative">
                                                <button
                                                    className="p-2 hover:bg-gray-700 rounded-md transition-all duration-200"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuAberto(menuAberto === estagio.id ? null : estagio.id);
                                                    }}
                                                    title="Mais opções"
                                                >
                                                    <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                                    </svg>
                                                </button>
                                                

                                                {menuAberto === estagio.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-2xl border border-gray-600" style={{ zIndex: 99999 }}>
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-600 rounded-t-lg flex items-center gap-2 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEstagioVisualizando(estagio.id);
                                                                setModalAtribuidosAberto(true);
                                                                setMenuAberto(null);
                                                            }}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            Ver Atribuídos
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-gray-600 flex items-center gap-2 transition-colors border-t border-gray-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAbrirModalEdicao(estagio);
                                                                setMenuAberto(null);
                                                            }}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Editar Estágio
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-600 hover:text-white rounded-b-lg flex items-center gap-2 transition-colors border-t border-gray-600"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeletarEstagio(estagio.id);
                                                                setMenuAberto(null);
                                                            }}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            Deletar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            )}

                            {estagiosTotalPages > 1 && estagios.length > 0 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700 px-6">
                                    <div className="text-xs text-gray-400">
                                        {estagiosStartIndex + 1}-{Math.min(estagiosEndIndex, estagios.length)} de {estagios.length}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setEstagiosPage(prev => Math.max(1, prev - 1))}
                                            disabled={estagiosPage === 1}
                                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-all"
                                        >
                                            ←
                                        </button>
                                        <span className="px-3 py-1 text-gray-300 text-xs">
                                            {estagiosPage}/{estagiosTotalPages}
                                        </span>
                                        <button
                                            onClick={() => setEstagiosPage(prev => Math.min(estagiosTotalPages, prev + 1))}
                                            disabled={estagiosPage === estagiosTotalPages}
                                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-all"
                                        >
                                            →
                                        </button>
                                    </div>
                                </div>
                            )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>


            {modalAtribuidosAberto && estagioVisualizando && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setModalAtribuidosAberto(false)}
                >
                    <div 
                        className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Atribuições do Estágio
                                </h3>
                                <p className="text-blue-200 text-sm mt-1">
                                    {estagios.find((e: Estagio) => e.id === estagioVisualizando)?.area} - {estagios.find((e: Estagio) => e.id === estagioVisualizando)?.local}
                                </p>
                            </div>
                            <button
                                onClick={() => setModalAtribuidosAberto(false)}
                                className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                aria-label="Fechar modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>


                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                            {(() => {
                                const atribuicaoEstagio = atribuicoes.find(a => a.estagioId === estagioVisualizando);
                                const professorAtribuido = atribuicaoEstagio?.professorId 
                                    ? professores.find(p => p.id === atribuicaoEstagio.professorId)
                                    : null;
                                const alunosAtribuidos = atribuicaoEstagio?.alunosIds
                                    ? alunos.filter(a => atribuicaoEstagio.alunosIds.includes(a.id))
                                    : [];

                                return (
                                    <>

                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Professor Orientador
                                            </h4>
                                            {professorAtribuido ? (
                                                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                            {professorAtribuido.nome.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-white text-base">{professorAtribuido.nome}</div>
                                                            <div className="text-sm text-gray-300">Matrícula: {professorAtribuido.matricula}</div>
                                                            {professorAtribuido.polo && (
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    Polo: <span className="text-gray-300">{professorAtribuido.polo}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 border-dashed">
                                                    <p className="text-gray-400 text-center text-sm flex items-center justify-center gap-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        Nenhum professor atribuído
                                                    </p>
                                                </div>
                                            )}
                                        </div>


                                        <div>
                                            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                Alunos Atribuídos
                                                <span className="text-sm font-normal text-gray-400">
                                                    ({alunosAtribuidos.length}/{estagios.find((e: Estagio) => e.id === estagioVisualizando)?.vagasDisponiveis || 0})
                                                </span>
                                            </h4>
                                            {alunosAtribuidos.length > 0 ? (
                                                <div className="space-y-3">
                                                    {alunosAtribuidos.map((aluno, index) => (
                                                        <div key={aluno.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                                    {index + 1}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="font-semibold text-white">{aluno.nome}</div>
                                                                    <div className="text-xs text-gray-300">Matrícula: {aluno.matricula}</div>
                                                                    {aluno.polo && (
                                                                        <div className="text-xs text-gray-400 mt-0.5">
                                                                            Polo: <span className="text-gray-300">{aluno.polo}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 border-dashed">
                                                    <p className="text-gray-400 text-center text-sm flex items-center justify-center gap-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        Nenhum aluno atribuído
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>


                        <div className="bg-gray-700 px-6 py-4 flex justify-end border-t border-gray-600">
                            <button
                                onClick={() => setModalAtribuidosAberto(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalEditarAberto && estagioEditando && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setModalEditarAberto(false)}
                >
                    <div 
                        className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Editar Estágio
                                </h3>
                                <p className="text-blue-200 text-sm mt-1">
                                    Atualize as informações do local de estágio
                                </p>
                            </div>
                            <button
                                onClick={() => setModalEditarAberto(false)}
                                className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                aria-label="Fechar modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Local do Estágio</label>
                                    <input
                                        type="text"
                                        value={formEdicao.local}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, local: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
                                        placeholder="Ex: Hospital Municipal"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Área</label>
                                    <input
                                        type="text"
                                        value={formEdicao.area}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, area: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
                                        placeholder="Ex: Enfermagem"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Horário Início</label>
                                        <input
                                            type="time"
                                            value={formEdicao.horarioInicio}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, horarioInicio: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Horário Fim</label>
                                        <input
                                            type="time"
                                            value={formEdicao.horarioFim}
                                            onChange={(e) => setFormEdicao({ ...formEdicao, horarioFim: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Vagas Disponíveis</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formEdicao.vagasDisponiveis}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, vagasDisponiveis: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                    <select
                                        value={formEdicao.status}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, status: e.target.value as 'vigente' | 'encerrado' })}
                                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
                                    >
                                        <option value="vigente">Vigente</option>
                                        <option value="encerrado">Encerrado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-700 px-6 py-4 flex justify-end gap-3 border-t border-gray-600">
                            <button
                                onClick={() => setModalEditarAberto(false)}
                                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSalvarEdicao}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmComponent />
        </>
    );
}

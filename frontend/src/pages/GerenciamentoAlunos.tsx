import { Header } from "../components/Header";
import { IoIosAdd, IoMdCloseCircleOutline, IoIosTime, IoMdTime } from "react-icons/io";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import  apiService  from '../services/apiService';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../hooks/useConfirm';



type Student = {
    id: string;
    nome: string;
    matricula: string;
    localEstagio: string;
    professorOrientador: string;
    faltasEstagio: number;
    statusMatricula: 'Ativo' | 'Inativo' | 'Bloqueado';
    polo: string;
    horasCumpridas: number;
    horasTotais: number;
    type?: string;
};

function DropdownStatus({ selectedStatus, onStatusChange }: { selectedStatus: string | null, onStatusChange: (status: string | null) => void }) {
    return (
        <Menu as="div" className="relative inline-block">
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20">
                {selectedStatus || 'Todos'}
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
                <div className="py-1">
                    <MenuItem>
                        <button
                            onClick={() => onStatusChange(null)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Todos
                        </button>
                    </MenuItem>
                    <MenuItem>
                        <button
                            onClick={() => onStatusChange('Ativo')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Ativo
                        </button>
                    </MenuItem>
                    <MenuItem>
                        <button
                            onClick={() => onStatusChange('Inativo')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Inativo
                        </button>
                    </MenuItem>
                    <MenuItem>
                        <button
                            onClick={() => onStatusChange('Bloqueado')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Bloqueado
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    );
}

function DropdownPolo({ selectedPolo, onPoloChange }: { selectedPolo: string | null, onPoloChange: (polo: string | null) => void }) {
    return (
        <Menu as="div" className="relative inline-block">
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20">
                {selectedPolo || 'Todos'}
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
                <div className="py-1">
                    <MenuItem>
                        <button
                            onClick={() => onPoloChange(null)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Todos
                        </button>
                    </MenuItem>
                    <MenuItem>
                        <button
                            onClick={() => onPoloChange('Volta Redonda')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Volta Redonda
                        </button>
                    </MenuItem>
                    <MenuItem>
                        <button
                            onClick={() => onPoloChange('Resende')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Resende
                        </button>
                    </MenuItem>
                    <MenuItem>
                        <button
                            onClick={() => onPoloChange('Angra dos Reis')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Angra dos Reis
                        </button>
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    );
}
function GerenciamentoAlunos() {
    const navigate = useNavigate();
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const { confirm, ConfirmComponent } = useConfirm();
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [filterPolo, setFilterPolo] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Filtrar alunos por status, polo e termo de pesquisa
    const filteredStudents = selectedStudents.filter(student => {
        const matchesStatus = !filterStatus || student.statusMatricula === filterStatus;
        const matchesPolo = !filterPolo || student.polo === filterPolo;
        const matchesSearch = !searchTerm || 
            (student.nome && student.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (student.matricula && student.matricula.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesStatus && matchesPolo && matchesSearch;
    });

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, endIndex);

    const isAllSelected = currentStudents.length > 0 && currentStudents.every(s => selectedStudentIds.has(s.id));
    const isSomeSelected = currentStudents.some(s => selectedStudentIds.has(s.id)) && !isAllSelected;

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            } else {
                fetchAlunos();
            }
        });
        async function fetchAlunos() {
            try {
                const response = await apiService.get(`/alunos`);
                if (response !== undefined && response !== null && typeof response === 'object' && 'alunos' in response && Array.isArray((response as any).alunos)) {
                    let alunos = (response as { alunos: Student[] }).alunos;
                    console.log(`📊 Frontend: Total de alunos recebidos da API: ${alunos.length}`);
                    let alunosFiltrados = alunos.filter((aluno: Student) => aluno.type === 'aluno');
                    if (alunosFiltrados.length === 0 && alunos.length > 0) {
                        alunosFiltrados = alunos;
                    }
                    console.log(`📊 Frontend: Total de alunos após filtragem de type: ${alunosFiltrados.length}`);
                    setStudents(alunosFiltrados);
                    setSelectedStudents(alunosFiltrados);
                } else {
                    setError('Resposta inesperada da API ao buscar alunos.');
                }
            } catch (err: any) {
                setError('Não foi possível carregar os alunos. Faça login ou tente novamente.');
                console.error('Erro ao buscar alunos:', err);
            }
        }
        return () => unsubscribe();
    }, [navigate]);

    // Aplicar filtros sempre que mudarem
    useEffect(() => {
        let filtered = [...students];

        if (filterStatus) {
            filtered = filtered.filter(student => student.statusMatricula === filterStatus);
        }

        if (filterPolo) {
            filtered = filtered.filter(student => student.polo === filterPolo);
        }

        setSelectedStudents(filtered);
        setCurrentPage(1); // Resetar para primeira página ao filtrar
    }, [filterStatus, filterPolo, students]);


    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSet = new Set(selectedStudentIds);
            currentStudents.forEach(s => newSet.add(s.id));
            setSelectedStudentIds(newSet);
        } else {
            const newSet = new Set(selectedStudentIds);
            currentStudents.forEach(s => newSet.delete(s.id));
            setSelectedStudentIds(newSet);
        }
    };


    const handleSelectStudent = (id: string, checked: boolean) => {
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };


    const handleCheckAbsences = () => {
        showInfo("Verificar faltas e atrasos dos alunos selecionados.");
    };

    const handleDeleteAluno = async (id: string, nome: string) => {
        const confirmed = await confirm({
            title: 'Deletar Aluno',
            message: `Tem certeza que deseja deletar o aluno "${nome}"?`,
            confirmText: 'Deletar',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            await apiService.deleteAluno(id);


            setStudents(students.filter(s => s.id !== id));
            setSelectedStudents(selectedStudents.filter(s => s.id !== id));
            setSelectedStudentIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });

            showSuccess('Aluno deletado com sucesso!');
        } catch (error: any) {
            console.error('❌ Erro ao deletar aluno:', error);
            showError(`Erro ao deletar aluno: ${error.message}`);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedStudentIds.size === 0) {
            showError("Nenhum aluno selecionado.");
            return;
        }

        const confirmed = await confirm({
            title: 'Deletar Alunos',
            message: `Tem certeza que deseja deletar ${selectedStudentIds.size} aluno(s) selecionado(s)?`,
            confirmText: 'Deletar Todos',
            cancelText: 'Cancelar',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const deletePromises = Array.from(selectedStudentIds).map(id =>
                apiService.deleteAluno(id)
            );

            await Promise.allSettled(deletePromises).then(results => {
                const errors = results.filter(r => r.status === 'rejected');
                
                if (errors.length > 0) {
                    showWarning(`Erro ao deletar ${errors.length} aluno(s). Os demais foram deletados.`);
                } else {
                    showSuccess('Alunos deletados com sucesso!');
                }
            });


            setStudents(students.filter(s => !selectedStudentIds.has(s.id)));
            setSelectedStudents(selectedStudents.filter(s => !selectedStudentIds.has(s.id)));
            setSelectedStudentIds(new Set());
        } catch (error: any) {
            console.error('❌ Erro ao deletar alunos:', error);
            showError(`Erro ao deletar alunos: ${error.message}`);
        }
    };


    const getStatusBadge = (status: string) => {
        const baseClasses = "px-1.5 py-0.5 rounded-full text-xs font-medium";
        switch (status) {
            case 'Ativo':
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
            case 'Inativo':
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
            case 'Bloqueado':
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
        }
    };

    return (
        <>
            <Header />
            <section className="p-4 sm:ml-64 mt-20">
                <h1 className="text-gray-100 text-4xl font-bold font-manrope leading-normal pb-10">
                    Gerenciamento de Alunos ({selectedStudents.length})
                </h1>
                {error ? (
                    <div className="bg-red-900 text-red-200 p-4 rounded-xl mb-6 text-center">
                        {error}
                    </div>
                ) : (
                    <>
                        <section className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700/50 p-4 mb-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
                                    <h3 className="text-gray-100 text-lg font-semibold">
                                        Ações Rápidas
                                        {selectedStudentIds.size > 0 && (
                                            <span className="ml-2 text-sm text-blue-400">
                                                ({selectedStudentIds.size} selecionado{selectedStudentIds.size > 1 ? 's' : ''})
                                            </span>
                                        )}
                                    </h3>
                                </div>
                                <nav className="flex gap-3">
                                    <Link
                                        to="/alunos/create"
                                        className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-700"
                                    >
                                        <IoIosAdd className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                                        <span>Novo Aluno</span>
                                    </Link>
                                    
                                    <Link
                                        to="/agendamento-estagio"
                                        className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-700"
                                    >
                                        <IoMdTime className="w-5 h-5 transition-transform group-hover:duration-300" />
                                        <span>Agendar Estágio</span>
                                    </Link>
                                    {selectedStudentIds.size > 0 && (
                                        <>
                                            <a href="/pontos/correcao">
                                                <button
                                                    onClick={handleCheckAbsences}
                                                    className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-700"
                                                >
                                                    <IoIosTime className="w-5 h-5" />
                                                    <span>Verificar Faltas e Atrasos</span>
                                                </button>
                                            </a>
                                            <button
                                                onClick={handleDeleteSelected}
                                                className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-700"
                                            >
                                                <IoMdCloseCircleOutline className="w-5 h-5" />
                                                <span>Deletar</span>
                                            </button>
                                        </>
                                    )}
                                </nav>
                            </div>
                        </section>
                        <div className="flex flex-col gap-4 pb-4">
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    placeholder="Pesquisar por nome ou matrícula..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <h2 className="text-gray-100">Filtrar por:</h2>
                                <div className="flex gap-4 text-gray-100 items-center">
                                    <h2>Status:</h2>
                                    <DropdownStatus selectedStatus={filterStatus} onStatusChange={setFilterStatus} />
                                    <h2>Polo:</h2>
                                    <DropdownPolo selectedPolo={filterPolo} onPoloChange={setFilterPolo} />
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                            <table className="w-full text-xs text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="p-2">
                                            <div className="flex items-center">
                                                <input
                                                    id="checkbox-all-search"
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    ref={(input) => {
                                                        if (input) input.indeterminate = isSomeSelected;
                                                    }}
                                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                                    className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                                            </div>
                                        </th>
                                        <th scope="col" className="px-3 py-2">
                                            Nome do aluno
                                        </th>
                                        <th scope="col" className="px-3 py-2">
                                            Matrícula
                                        </th>
                                        <th scope="col" className="px-3 py-2">
                                            Local de Estágio
                                        </th>
                                        <th scope="col" className="px-3 py-2">
                                            Professor Orientador
                                        </th>
                                        <th scope="col" className="px-3 py-2">
                                            Status da Matrícula
                                        </th>
                                        <th scope="col" className="px-3 py-2">
                                            Faltas de Estágio
                                        </th>
                                        <th scope="col" className="px-3 py-2">
                                            Horas de Estágio
                                        </th>
                                        <th scope="col" className="px-3 py-2">
                                            Polo
                                        </th>
                                        <th scope="col" className="px-3 py-2">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="text-center py-8 text-gray-400">
                                                {searchTerm || filterStatus || filterPolo 
                                                    ? 'Nenhum aluno encontrado com os filtros aplicados.'
                                                    : 'Nenhum aluno encontrado. Verifique se há dados cadastrados ou se você está autenticado corretamente.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentStudents.map((student) => (
                                            <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="w-4 p-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            id={`checkbox-table-search-${student.id}`}
                                                            type="checkbox"
                                                            checked={selectedStudentIds.has(String(student.id))}
                                                            onChange={(e) => handleSelectStudent(String(student.id), e.target.checked)}
                                                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                        <label htmlFor={`checkbox-table-search-${student.id}`} className="sr-only">checkbox</label>
                                                    </div>
                                                </td>
                                                <th scope="row" className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {student.nome}
                                                </th>
                                                <td className="px-3 py-2">
                                                    {student.matricula}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {student.localEstagio}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {student.professorOrientador}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className={getStatusBadge(student.statusMatricula)}>
                                                        {student.statusMatricula}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${student.faltasEstagio === 0
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            : student.faltasEstagio <= 2
                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                            }`}>
                                                            {student.faltasEstagio}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className="px-1.5 py-0.5 text-gray-400 rounded-full text-xs font-medium">
                                                        {student.horasCumpridas} / {student.horasTotais}h
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">
                                                        {student.polo}
                                                    </span>
                                                </td>
                                                <td className="flex items-center gap-3 px-3 py-2">
                                                    <Link
                                                        to={`/alunos/editar/${student.id}`}
                                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline text-xs"
                                                    >
                                                        Editar
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteAluno(student.id, student.nome)}
                                                        className="font-medium text-red-600 dark:text-red-500 hover:underline text-xs"
                                                    >
                                                        Deletar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between mt-6 px-4">
                            <div className="text-sm text-gray-400">
                                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredStudents.length)} de {filteredStudents.length} alunos
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 border border-gray-700"
                                    >
                                        Anterior
                                    </button>
                                    <div className="flex gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-10 h-10 rounded-lg transition-all duration-200 border ${
                                                        currentPage === pageNum
                                                            ? 'bg-blue-600 text-white border-blue-500'
                                                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 border border-gray-700"
                                    >
                                        Próximo
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>
            <ConfirmComponent />
        </>
    );
}

export default GerenciamentoAlunos;   ;


import { Header } from "../components/Header";
import { IoIosAdd, IoMdCloseCircleOutline, IoIosTime } from "react-icons/io";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { Link } from 'react-router-dom';



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
function GerenciamentoProfessores() {
    const navigate = useNavigate();
    const [professors, setProfessor] = useState<Student[]>([]);
    const [selectedProfessors, setSelectedProfessors] = useState<Student[]>([]);
    const [selectedProfessorsIds, setSelectedProfessorsIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [filterPolo, setFilterPolo] = useState<string | null>(null);


    const totalPages = Math.ceil(selectedProfessors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProfessors = selectedProfessors.slice(startIndex, endIndex);

    const isAllSelected = currentProfessors.length > 0 && currentProfessors.every(s => selectedProfessorsIds.has(s.id));
    const isSomeSelected = currentProfessors.some(s => selectedProfessorsIds.has(s.id)) && !isAllSelected;

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            } else {
                fetchProfessors();
            }
        });
        async function fetchProfessors() {
            try {
                const response = await apiService.get(`/professores`);
                if (response !== undefined && response !== null && typeof response === 'object' && 'professores' in response && Array.isArray((response as any).professores)) {
                    let professors = (response as { professores: Student[] }).professores;
                    let professorsFiltrados = professors.filter((aluno: Student) => aluno.type === 'professor');
                    if (professorsFiltrados.length === 0 && professors.length > 0) {
                        professorsFiltrados = professors;
                    }
                    setProfessor(professorsFiltrados);
                    setSelectedProfessors(professorsFiltrados);
                } else {
                    setError('Resposta inesperada da API ao buscar professores.');
                }
            } catch (err: any) {
                setError('Não foi possível carregar os professores. Faça login ou tente novamente.');
                console.error('Erro ao buscar professores:', err);
            }
        }
        return () => unsubscribe();
    }, [navigate]);

    // Aplicar filtro de polo
    useEffect(() => {
        let filtered = [...professors];

        if (filterPolo) {
            filtered = filtered.filter(professor => professor.polo === filterPolo);
        }

        setSelectedProfessors(filtered);
        setCurrentPage(1);
    }, [filterPolo, professors]);


    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSet = new Set(selectedProfessorsIds);
            currentProfessors.forEach(s => newSet.add(s.id));
            setSelectedProfessorsIds(newSet);
        } else {
            const newSet = new Set(selectedProfessorsIds);
            currentProfessors.forEach(s => newSet.delete(s.id));
            setSelectedProfessorsIds(newSet);
        }
    };


    const handleSelectStudent = (id: string, checked: boolean) => {
        setSelectedProfessorsIds(prev => {
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
        alert("Verificar faltas e atrasos dos professors selecionados.");
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`Tem certeza que deseja deletar ${selectedProfessorsIds.size} professor(es) selecionado(s)?`)) {
            return;
        }

        const deletionResults: { id: string; success: boolean }[] = [];
        for (const id of Array.from(selectedProfessorsIds)) {
            try {
                await apiService.deleteProfessor(id);
                deletionResults.push({ id, success: true });
            } catch (error) {
                console.error(`Erro ao deletar professor ${id}:`, error);
                deletionResults.push({ id, success: false });
            }
        }

        const successCount = deletionResults.filter(r => r.success).length;
        const failCount = deletionResults.filter(r => !r.success).length;

        if (successCount > 0) {
            const successIds = new Set(deletionResults.filter(r => r.success).map(r => r.id));
            setProfessor(professors.filter(s => !successIds.has(s.id)));
            setSelectedProfessors(selectedProfessors.filter(s => !successIds.has(s.id)));
            setSelectedProfessorsIds(new Set());
        }

        if (failCount > 0) {
            alert(`${successCount} professor(es) deletado(s) com sucesso.\n${failCount} falha(s) ao deletar.`);
        } else {
            alert(`${successCount} professor(es) deletado(s) com sucesso!`);
        }
    };

    return (
        <>
            <Header />
            <section className="p-4 sm:ml-64 mt-20">
                <h1 className="text-gray-100 text-4xl font-bold font-manrope leading-normal pb-10">
                    Gerenciamento de Professores ({selectedProfessors.length})
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
                                        {selectedProfessorsIds.size > 0 && (
                                            <span className="ml-2 text-sm text-blue-400">
                                                ({selectedProfessorsIds.size} selecionado{selectedProfessorsIds.size > 1 ? 's' : ''})
                                            </span>
                                        )}
                                    </h3>
                                </div>
                                <nav className="flex gap-3">
                                    <Link
                                        to="/professores/create"
                                        className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-700"
                                    >
                                        <IoIosAdd className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                                        <span>Novo Professor</span>
                                    </Link>
                                    
                                    {selectedProfessorsIds.size > 0 && (
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
                        <div className="flex justify-between items-center pb-4">
                            <h2 className="text-gray-100">Filtrar por:</h2>
                            <div className="flex gap-4 text-gray-100 items-center">
                                <h2>Polo:</h2>
                                <DropdownPolo selectedPolo={filterPolo} onPoloChange={setFilterPolo} />
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
                                        <th scope="col" className="px-6 py-3">
                                            Nome do Professor
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Matrícula
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Local de Estágio
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Status da Matrícula
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Horas de Estágio
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Polo
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProfessors.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="text-center py-8 text-gray-400">
                                                Nenhum professor encontrado. Verifique se há dados cadastrados ou se você está autenticado corretamente.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentProfessors.map((student) => (
                                            <tr key={student.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <td className="w-4 p-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            id={`checkbox-table-search-${student.id}`}
                                                            type="checkbox"
                                                            checked={selectedProfessorsIds.has(String(student.id))}
                                                            onChange={(e) => handleSelectStudent(String(student.id), e.target.checked)}
                                                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        />
                                                        <label htmlFor={`checkbox-table-search-${student.id}`} className="sr-only">checkbox</label>
                                                    </div>
                                                </td>
                                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {student.nome}
                                                </th>
                                                <td className="px-6 py-4">
                                                    {student.matricula || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {student.localEstagio || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-medium">
                                                        -
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    -
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium">
                                                        {student.polo || 'resende'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/professores/editar/${student.id}`}
                                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                                    >
                                                        Editar
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 px-4">
                                <div className="text-sm text-gray-400">
                                    Mostrando {startIndex + 1} a {Math.min(endIndex, selectedProfessors.length)} de {selectedProfessors.length} professores
                                </div>
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
                            </div>
                        )}
                    </>
                )}
            </section>
            
        </>
    );
}

export default GerenciamentoProfessores;


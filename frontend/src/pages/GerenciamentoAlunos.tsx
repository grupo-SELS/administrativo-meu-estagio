import { Header } from "../components/Header";
import { IoIosAdd, IoMdCloseCircleOutline, IoIosTime } from "react-icons/io";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Link } from 'react-router-dom';

// Mock removido, agora busca da API

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

function DropdownStatus() {
    return (
        <Menu as="div" className="relative inline-block">
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20">
                Todos
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
                <div className="py-1">
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Ativo
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Inativo
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Bloqueado
                        </a>
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    );
}

function DropdownPolo() {
    return (
        <Menu as="div" className="relative inline-block">
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-white/20">
                Todos
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
                <div className="py-1">
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Volta Redonda
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Resende
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-300 data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
                        >
                            Angra dos Reis
                        </a>
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    );
}
function GerenciamentoAlunos() {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    // Helper variables for select all checkbox
    const isAllSelected = selectedStudents.length > 0 && selectedStudents.every(s => selectedStudentIds.has(s.id));
    const isSomeSelected = selectedStudents.some(s => selectedStudentIds.has(s.id)) && !isAllSelected;

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
                const response = await apiService.get(`/api/alunos`);
                if (response !== undefined && response !== null && typeof response === 'object' && 'alunos' in response && Array.isArray((response as any).alunos)) {
                    let alunos = (response as { alunos: Student[] }).alunos;
                    // Se não houver nenhum aluno com type 'aluno', exibe todos para debug
                    let alunosFiltrados = alunos.filter((aluno: Student) => aluno.type === 'aluno');
                    if (alunosFiltrados.length === 0 && alunos.length > 0) {
                        alunosFiltrados = alunos;
                    }
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

    // Select all handler
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(new Set(selectedStudents.map(s => s.id)));
        } else {
            setSelectedStudentIds(new Set());
        }
    };

    // Select single student handler
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

    // Dummy handlers for actions
    const handleCheckAbsences = () => {
        alert("Verificar faltas e atrasos dos alunos selecionados.");
    };

    const handleDeleteSelected = () => {
        if (window.confirm("Tem certeza que deseja deletar os alunos selecionados?")) {
            setStudents(students.filter(s => !selectedStudentIds.has(s.id)));
            setSelectedStudents(selectedStudents.filter(s => !selectedStudentIds.has(s.id)));
            setSelectedStudentIds(new Set());
        }
    };

    // Status badge helper
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
                        <div className="flex justify-between items-center pb-4">
                            <h2 className="text-gray-100">Filtrar por:</h2>
                            <div className="flex gap-4 text-gray-100 items-center">
                                <h2>Status:</h2>
                                <DropdownStatus />
                                <h2>Polo:</h2>
                                <DropdownPolo />
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
                                    {selectedStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="text-center py-8 text-gray-400">
                                                Nenhum aluno encontrado. Verifique se há dados cadastrados ou se você está autenticado corretamente.
                                            </td>
                                        </tr>
                                    ) : (
                                        selectedStudents.map((student) => (
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
                                                <td className="flex items-center px-3 py-2">
                                                    <Link
                                                        to={`/alunos/editar/${student.id}`}
                                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline text-xs"
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
                    </>
                )}
            </section>
        </>
    );
}

export default GerenciamentoAlunos;   ;

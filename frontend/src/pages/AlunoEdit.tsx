interface FaltaDetalhada {
    data: string;
    motivo: string;
    justificativa?: string;
}

const faltasDetalhadas: Record<number, FaltaDetalhada[]> = {
    1: [
        { data: '2024-01-15', motivo: 'Falta não justificada' },
        { data: '2024-01-22', motivo: 'Atestado médico', justificativa: 'Consulta médica agendada' }
    ],
    2: [],
    3: [
        { data: '2024-01-10', motivo: 'Falta não justificada' },
        { data: '2024-01-17', motivo: 'Falta não justificada' },
        { data: '2024-01-24', motivo: 'Falta não justificada' },
        { data: '2024-01-31', motivo: 'Problema de transporte', justificativa: 'Greve do transporte público' },
        { data: '2024-02-07', motivo: 'Falta não justificada' }
    ],
    4: [
        { data: '2024-02-05', motivo: 'Atestado médico', justificativa: 'Exames médicos' }
    ]
};
import { Header } from "../components/Header";
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

interface Student {
    id: number;
    name: string;
    matricula: string;
    localEstagio: string;
    professorOrientador: string;
    faltasEstagio: number;
    statusMatricula: 'Ativo' | 'Inativo' | 'Bloqueado';
    polo: 'Volta Redonda' | 'Resende' | 'Angra dos Reis';
    email?: string;
    telefone?: string;
    turma?: string;
    supervisor?: string;
}

const mockStudents: Student[] = [
    {
        id: 1,
        name: 'Maxley Lima',
        matricula: '2021001',
        localEstagio: 'Hospital São João Batista',
        professorOrientador: 'Dr. Ana Clara Silva',
        faltasEstagio: 2,
        statusMatricula: 'Bloqueado',
        polo: 'Volta Redonda',
        email: 'maxley.lima@example.com',
        telefone: '(24) 99999-9999',
        turma: '3A',
        supervisor: 'Enf. Carlos Silva'
    },
    {
        id: 2,
        name: 'Ana Silva',
        matricula: '2021002',
        localEstagio: 'UBS Centro - Resende',
        professorOrientador: 'Dr. Carlos Mendes',
        faltasEstagio: 0,
        statusMatricula: 'Ativo',
        polo: 'Resende',
        email: 'ana.silva@example.com',
        telefone: '(24) 98888-8888',
        turma: '3B',
        supervisor: 'Enf. Maria Santos'
    },
    {
        id: 3,
        name: 'Carlos Oliveira',
        matricula: '2021003',
        localEstagio: 'Hospital da Marinha',
        professorOrientador: 'Dra. Maria Santos',
        faltasEstagio: 5,
        statusMatricula: 'Bloqueado',
        polo: 'Angra dos Reis',
        email: 'carlos.oliveira@example.com',
        telefone: '(24) 97777-7777',
        turma: '3A',
        supervisor: 'Enf. João Costa'
    },
    {
        id: 4,
        name: 'Maria Santos',
        matricula: '2021004',
        localEstagio: 'CSU Vila Mury',
        professorOrientador: 'Dr. José Ferreira',
        faltasEstagio: 1,
        statusMatricula: 'Ativo',
        polo: 'Volta Redonda',
        email: 'maria.santos@example.com',
        telefone: '(24) 96666-6666',
        turma: '3C',
        supervisor: 'Enf. Ana Costa'
    },
];

export default function AlunoEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [showFaltasModal, setShowFaltasModal] = useState(false);
    const [formData, setFormData] = useState<Student>({
        id: 0,
        name: '',
        matricula: '',
        localEstagio: '',
        professorOrientador: '',
        faltasEstagio: 0,
        statusMatricula: 'Ativo',
        polo: 'Volta Redonda',
        email: '',
        telefone: '',
        turma: '',
        supervisor: ''
    });

    useEffect(() => {
        if (id) {
            const student = mockStudents.find(s => s.id === parseInt(id));
            if (student) {
                setFormData(student);
            } else {
                navigate('/alunos');
            }
        }
        setIsLoading(false);
    }, [id, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'faltasEstagio' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log('Salvando dados do aluno:', formData);
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/alunos');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar as informações do aluno');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <section className="p-4 sm:ml-64 mt-20">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-300 text-lg">Carregando...</div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <Header />
            <section className="p-4 sm:ml-64 mt-20">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-gray-100 text-4xl font-bold font-manrope leading-normal">
                                Editar Aluno
                            </h1>
                            <p className="text-gray-400 mt-2">
                                Edite as informações do aluno {formData.name}
                            </p>
                        </div>
                        <Link
                            to="/alunos"
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Voltar
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="matricula" className="block text-sm font-medium text-gray-300 mb-2">
                                    Matrícula
                                </label>
                                <input
                                    type="text"
                                    id="matricula"
                                    name="matricula"
                                    value={formData.matricula}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="telefone" className="block text-sm font-medium text-gray-300 mb-2">
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    id="telefone"
                                    name="telefone"
                                    value={formData.telefone || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="turma" className="block text-sm font-medium text-gray-300 mb-2">
                                    Turma
                                </label>
                                <input
                                    type="text"
                                    id="turma"
                                    name="turma"
                                    value={formData.turma || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="polo" className="block text-sm font-medium text-gray-300 mb-2">
                                    Polo
                                </label>
                                <select
                                    id="polo"
                                    name="polo"
                                    value={formData.polo}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Volta Redonda">Volta Redonda</option>
                                    <option value="Resende">Resende</option>
                                    <option value="Angra dos Reis">Angra dos Reis</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="localEstagio" className="block text-sm font-medium text-gray-300 mb-2">
                                    Local de Estágio
                                </label>
                                <input
                                    type="text"
                                    id="localEstagio"
                                    name="localEstagio"
                                    value={formData.localEstagio}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="supervisor" className="block text-sm font-medium text-gray-300 mb-2">
                                    Supervisor de Estágio
                                </label>
                                <input
                                    type="text"
                                    id="supervisor"
                                    name="supervisor"
                                    value={formData.supervisor || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="professorOrientador" className="block text-sm font-medium text-gray-300 mb-2">
                                    Professor Orientador
                                </label>
                                <input
                                    type="text"
                                    id="professorOrientador"
                                    name="professorOrientador"
                                    value={formData.professorOrientador}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="statusMatricula" className="block text-sm font-medium text-gray-300 mb-2">
                                    Status da Matrícula
                                </label>
                                <select
                                    id="statusMatricula"
                                    name="statusMatricula"
                                    value={formData.statusMatricula}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                    <option value="Bloqueado">Bloqueado</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="faltasEstagio" className="block text-sm font-medium text-gray-300 mb-2">
                                    Faltas de Estágio
                                </label>
                                <input
                                    type="number"
                                    id="faltasEstagio"
                                    name="faltasEstagio"
                                    value={formData.faltasEstagio}
                                    onChange={handleInputChange}
                                    min="0"
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                    {formData.faltasEstagio > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowFaltasModal(true)}
                                            className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                                        >
                                            Verificar
                                        </button>
                                    )}
                            </div>
            {showFaltasModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Faltas de Estágio - {formData.name}
                            </h3>
                            <button
                                onClick={() => setShowFaltasModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Matrícula: {formData.matricula} | Local de Estágio: {formData.localEstagio}
                            </p>
                        </div>
                        {(faltasDetalhadas[formData.id]?.length ?? 0) === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                Nenhuma falta registrada para este aluno.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {faltasDetalhadas[formData.id]?.map((falta, index) => (
                                    <div key={index} className="border rounded-lg p-3 dark:border-gray-600">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {new Date(falta.data).toLocaleDateString('pt-BR')}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                falta.justificativa 
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }`}>
                                                {falta.justificativa ? 'Justificada' : 'Não Justificada'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            <strong>Motivo:</strong> {falta.motivo}
                                        </p>
                                        {falta.justificativa && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <strong>Justificativa:</strong> {falta.justificativa}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowFaltasModal(false)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <Link
                                to="/alunos"
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
                            >
                                {isLoading ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}
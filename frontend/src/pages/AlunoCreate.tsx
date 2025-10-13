import { Header } from "../components/Header";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { CPFInput } from '../components/CPFInput';

interface Student {
    id: number;
    name: string;
    cpf: string;
    matricula: string;
    localEstagio: string;
    professorOrientador: string;
    faltasEstagio: number;
    statusMatricula: 'Ativo' | 'Inativo' | 'Bloqueado';
    polo: 'Volta Redonda' | 'Resende' | 'Angra dos Reis';
    email?: string;
    telefone?: string;
    turma?: string;
}


export const AlunoCreate = () => {

    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Student>({
        id: 0,
        name: '',
        cpf: '',
        matricula: '',
        localEstagio: '',
        professorOrientador: '',
        faltasEstagio: 0,
        statusMatricula: 'Ativo',
        polo: 'Volta Redonda',
        email: '',
        telefone: '',
        turma: ''
    });



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'faltasEstagio' ? parseInt(value) || 0 : value
        }));
    };

    const handleCPFChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            cpf: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log('📝 Enviando dados do aluno:', formData);
            
            const alunoData = {
                nome: formData.name,
                cpf: formData.cpf,
                email: formData.email || `${formData.matricula}@aluno.com`,
                polo: formData.polo,
                localEstagio: formData.localEstagio,
                professorOrientador: formData.professorOrientador,
                statusMatricula: formData.statusMatricula,
                turma: formData.turma,
                telefone: formData.telefone
            };

            const response = await fetch('http://localhost:3001/api/alunos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-dev-bypass': 'true'
                },
                body: JSON.stringify(alunoData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao criar aluno');
            }

            const result = await response.json();
            console.log('✅ Aluno criado:', result);
            showSuccess('Aluno criado com sucesso!');
            navigate('/alunos');
        } catch (error: any) {
            console.error('❌ Erro ao salvar:', error);
            showError(`Erro ao salvar: ${error.message}`);
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
                                Adicionar Novo Aluno
                            </h1>
                            <p className="text-gray-400 mt-2">
                                Adicione as informações do novo aluno {formData.name}
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
                                <CPFInput
                                    value={formData.cpf}
                                    onChange={handleCPFChange}
                                    label="CPF"
                                    required={true}
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
    )
}
import { Header } from "../components/Header";
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../services/apiService';
import { CPFInput } from '../components/CPFInput';
import { useToast } from '../contexts/ToastContext';

interface Professor {
    id: string;
    nome: string;
    cpf: string;
    email: string;
    polo: 'Volta Redonda' | 'Resende' | 'Angra dos Reis';
    localEstagio: string;
}

export default function ProfessorEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<Professor>({
        id: '',
        nome: '',
        cpf: '',
        email: '',
        polo: 'Volta Redonda',
        localEstagio: ''
    });

    useEffect(() => {
        async function fetchProfessor() {
            if (id) {
                setIsLoading(true);
                try {
                    const professor = await apiService.getProfessorById(id);
                    if (professor && professor.id) {
                        setFormData({
                            id: professor.id,
                            nome: professor.nome || '',
                            cpf: professor.cpf || '',
                            email: professor.email || '',
                            polo: professor.polo || 'Volta Redonda',
                            localEstagio: professor.localEstagio || ''
                        });
                    } else {
                        showError('Professor não encontrado');
                        navigate('/professores');
                    }
                } catch (error) {
                    showError('Erro ao carregar professor');
                    navigate('/professores');
                } finally {
                    setIsLoading(false);
                }
            }
        }
        fetchProfessor();
    }, [id, navigate, showError]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            const professorData = {
                nome: formData.nome,
                cpf: formData.cpf,
                email: formData.email,
                polo: formData.polo,
                localEstagio: formData.localEstagio
            };

            await apiService.updateProfessor(id!, professorData);
            showSuccess('Professor atualizado com sucesso!');
            navigate('/professores');
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            showError(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
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
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Editar Professor
                            </h1>
                            <p className="text-gray-400">
                                Atualize as informações do professor
                            </p>
                        </div>
                        <Link
                            to="/professores"
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            Voltar
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="nome" className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={formData.nome}
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
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
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
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Volta Redonda">Volta Redonda</option>
                                    <option value="Resende">Resende</option>
                                    <option value="Angra dos Reis">Angra dos Reis</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="localEstagio" className="block text-sm font-medium text-gray-300 mb-2">
                                    Local de Estágio
                                </label>
                                <input
                                    type="text"
                                    id="localEstagio"
                                    name="localEstagio"
                                    value={formData.localEstagio}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Hospital Municipal, Clínica XYZ, etc."
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <Link
                                to="/professores"
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}

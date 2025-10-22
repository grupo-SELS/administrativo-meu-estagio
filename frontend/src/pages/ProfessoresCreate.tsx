import { Header } from "../components/Header";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import ApiService from '../services/apiService';

interface Professor {
    id: number;
    name: string;
    cpf?: string;
    localEstagio: string;
    polo: 'Volta Redonda' | 'Resende' | 'Angra dos Reis';
    email?: string;
}


export const ProfessorCreate = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Professor>({
        id: 0,
        name: '',
        cpf: '',
        localEstagio: '',
        polo: 'Volta Redonda',
        email: ''
    });



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'faltasEstagio' ? Number.parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const bodyData = {
                nome: formData.name,
                cpf: formData.cpf,
                email: formData.email,
                polo: formData.polo,
                localEstagio: formData.localEstagio
            };

            console.log('📤 Enviando dados do professor:', bodyData);

            const data = await ApiService.createProfessor(bodyData);
            console.log('✅ Professor criado com sucesso:', data);
            showSuccess('Professor criado com sucesso!');
            navigate('/professores');
        } catch (error: any) {
            console.error('❌ Erro ao salvar:', error);
            showError(error.message || 'Erro ao salvar as informações do professor');
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
                                Adicionar Novo Professor
                            </h1>
                            <p className="text-gray-400 mt-2">
                                Adicione as informações do novo professor {formData.name}
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
                                <label htmlFor="cpf" className="block text-sm font-medium text-gray-300 mb-2">
                                    CPF
                                </label>
                                <input
                                    type="text"
                                    id="cpf"
                                    name="cpf"
                                    value={formData.cpf || ''}
                                    onChange={(e) => {
                                        // Remove caracteres não numéricos
                                        const valor = e.target.value.replaceAll(/\D/g, '');
                                        let cpfFormatado = valor;
                                        
                                        // Formata: XXX.XXX.XXX-XX
                                        if (valor.length > 3) {
                                            cpfFormatado = valor.substring(0, 3) + '.' + valor.substring(3);
                                        }
                                        if (valor.length > 6) {
                                            cpfFormatado = valor.substring(0, 3) + '.' + valor.substring(3, 6) + '.' + valor.substring(6);
                                        }
                                        if (valor.length > 9) {
                                            cpfFormatado = valor.substring(0, 3) + '.' + valor.substring(3, 6) + '.' + valor.substring(6, 9) + '-' + valor.substring(9, 11);
                                        }
                                        
                                        setFormData(prev => ({ ...prev, cpf: cpfFormatado }));
                                    }}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
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
import { Header } from "../components/Header";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";
import { useNotification } from "../contexts/NotificationContext";

export const NotesCreate = () => {
    const navigate = useNavigate();
    const { success, error, warning, showConfirm } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    
    // Form state
    const [formData, setFormData] = useState({
        titulo: "",
        conteudo: "",
        polo: "",
        categoria: "Geral",
        prioridade: "media"
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...files]);
            
            // Criar previews das imagens
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setImagePreview(prev => [...prev, event.target!.result as string]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    // Função para gerar preview do autor baseado no polo
    const getAutorPreview = () => {
        if (formData.polo && formData.polo.trim() !== '') {
            return `Admin - ${formData.polo}`;
        }
        return 'Admin';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.titulo || !formData.conteudo) {
            warning('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Preparar tags incluindo data agendada se selecionada
            const tags = [...(formData.titulo ? [formData.titulo.toLowerCase()] : [])];
            if (selectedDate) {
                const formattedDate = new Date(selectedDate).toLocaleDateString('pt-BR');
                tags.push(`agendado para ${formattedDate}`);
            }

            const comunicadoData = {
                ...formData,
                tags,
                imagens: selectedImages
            };

            console.log('🚀 Enviando dados:', comunicadoData);
            
            try {
                await apiService.createComunicado(comunicadoData);
                success('Comunicado criado', 'Comunicado criado com sucesso!');
                // Redirecionar para a lista de comunicados
                navigate('/comunicados');
            } catch (uploadError: any) {
                // Se erro contém "upload" ou "bucket" ou "storage", tentar sem imagens
                if (uploadError.message && (
                    uploadError.message.includes('upload') || 
                    uploadError.message.includes('bucket') || 
                    uploadError.message.includes('storage') ||
                    uploadError.message.includes('Firebase')
                )) {
                    console.warn('⚠️ Erro no upload de imagens, tentando sem imagens...');
                    
                    // Confirmar com usuário se quer criar sem imagens
                    const confirmWithoutImages = await showConfirm({
                        title: 'Erro no upload de imagens',
                        message: 'Erro no upload de imagens. Deseja criar o comunicado sem as imagens?',
                        confirmText: 'Criar sem imagens',
                        cancelText: 'Cancelar',
                        type: 'warning'
                    });
                    
                    if (confirmWithoutImages) {
                        const comunicadoSemImagens = {
                            ...formData,
                            tags
                            // Sem campo imagens
                        };
                        
                        await apiService.createComunicado(comunicadoSemImagens);
                        success('Comunicado criado', 'Comunicado criado com sucesso (sem imagens)');
                        navigate('/comunicados');
                    } else {
                        throw uploadError; // Re-lança o erro se usuário não confirmar
                    }
                } else {
                    throw uploadError; // Re-lança outros tipos de erro
                }
            }
        } catch (error: any) {
            console.error('❌ Erro detalhado ao criar comunicado:', error);
            console.error('❌ Stack trace:', error.stack);
            
            let errorMessage = 'Erro ao criar comunicado. Tente novamente.';
            if (error.message) {
                errorMessage = `${error.message}`;
            }
            
            error('Erro ao criar comunicado', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-900 via-gray-800 to-gray-900 pt-20 sm:pl-25 md:pl-65 lg:pl-65">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* Header da página */}
                        <div className="text-start mb-8">
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Criar Novo Comunicado
                            </h1>
                            
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Formulário Principal */}
                            <div className="lg:col-span-2">
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        
                                        {/* Título */}
                                        <div className="space-y-2">
                                            <label htmlFor="titulo" className="flex items-center text-sm font-semibold text-gray-200">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                                                Título do comunicado *
                                            </label>
                                            <input
                                                id="titulo"
                                                name="titulo"
                                                type="text"
                                                required
                                                value={formData.titulo}
                                                onChange={handleInputChange}
                                                placeholder="Digite um título chamativo..."
                                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        {/* Descrição */}
                                        <div className="space-y-2">
                                            <label htmlFor="conteudo" className="flex items-center text-sm font-semibold text-gray-200">
                                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                                                Descrição *
                                            </label>
                                            <textarea 
                                                id="conteudo" 
                                                name="conteudo"
                                                rows={6} 
                                                value={formData.conteudo}
                                                onChange={handleInputChange}
                                                placeholder="Descreva o comunicado em detalhes..."
                                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 resize-none"
                                                required 
                                            />
                                        </div>

                                        {/* Upload de Imagens */}
                                        <div className="space-y-4">
                                            <label className="flex items-center text-sm font-semibold text-gray-200">
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                Imagens (opcional)
                                            </label>
                                            
                                            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-blue-600 transition-colors duration-200">
                                                <input
                                                    id="images"
                                                    name="images"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                />
                                                <label 
                                                    htmlFor="images" 
                                                    className="cursor-pointer flex flex-col items-center space-y-2"
                                                >
                                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-gray-300">
                                                        <span className="font-medium text-blue-400">Clique para enviar</span> ou arraste imagens aqui
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        PNG, JPG, GIF até 5MB (máx. 5 arquivos)
                                                    </div>
                                                </label>
                                            </div>
                                            
                                            {/* Preview das imagens */}
                                            {imagePreview.length > 0 && (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                                    {imagePreview.map((preview, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={preview}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-600 group-hover:border-blue-600 transition-colors duration-200"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Campos organizados em grid */}
                                        <div className="grid grid-cols-1 gap-6">
                                            
                                            {/* Categoria */}
                                            <div className="space-y-2">
                                                <label htmlFor="categoria" className="flex items-center text-sm font-semibold text-gray-200">
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                                    Categoria
                                                </label>
                                                <select
                                                    id="categoria"
                                                    name="categoria"
                                                    value={formData.categoria}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                                >
                                                    <option value="Geral" className="bg-gray-800 text-white">Geral</option>
                                                    <option value="Urgente" className="bg-gray-800 text-white">Urgente</option>
                                                    <option value="Comunicado" className="bg-gray-800 text-white"> Comunicado</option>
                                                    <option value="Evento" className="bg-gray-800 text-white">Evento</option>
                                                    <option value="Aviso" className="bg-gray-800 text-white">Aviso</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Polo */}
                                        <div className="space-y-2">
                                            <label htmlFor="polo" className="flex items-center text-sm font-semibold text-gray-200">
                                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                                Polo de origem
                                            </label>
                                            <select
                                                id="polo"
                                                name="polo"
                                                value={formData.polo}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                                            >
                                                <option value="" className="bg-gray-800 text-white">Selecione um polo</option>
                                                <option value="Volta Redonda" className="bg-gray-800 text-white">Volta Redonda</option>
                                                <option value="Resende" className="bg-gray-800 text-white">Resende</option>
                                                <option value="Angra dos Reis" className="bg-gray-800 text-white">Angra dos Reis</option>
                                            </select>
                                            
                                            {/* Preview do autor */}
                                            <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-3 mt-2">
                                                <div className="flex items-center space-x-2 text-sm">
                                                    <span className="text-gray-400">Autor do comunicado:</span>
                                                    <span className="font-semibold text-blue-300">{getAutorPreview()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botão de envio */}
                                        <div className="pt-6">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Criando comunicado...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <span>Criar Comunicado</span>
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Sidebar de Agendamento */}
                            <div className="lg:col-span-1">
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl sticky top-8">
                                    
                                    {/* Header da sidebar */}
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            Agendar Publicação
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Programe quando seu comunicado será publicado
                                        </p>
                                    </div>

                                    {/* Calendário */}
                                    <div className="space-y-4">
                                        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                                            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-3">
                                                📆 Selecione a data
                                            </label>
                                            <input 
                                                type="date" 
                                                id="date"
                                                value={selectedDate}
                                                onChange={handleDateChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        {/* Preview da data selecionada */}
                                        {selectedDate && (
                                            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-xl p-4">
                                                <div className="flex items-center space-x-2 text-blue-300">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="font-medium">Agendado para:</span>
                                                </div>
                                                <p className="text-white font-semibold mt-1">
                                                    {new Date(selectedDate).toLocaleDateString('pt-BR', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        {/* Resumo do comunicado */}
                                        <div className="bg-gray-700/20 rounded-xl p-4 border border-gray-600/30">
                                            <h4 className="font-semibold text-gray-300 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Resumo
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Autor:</span>
                                                    <span className="text-blue-300 font-medium">{getAutorPreview()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Categoria:</span>
                                                    <span className="text-purple-300">{formData.categoria}</span>
                                                </div>
                                                {formData.polo && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">🏢 Polo:</span>
                                                        <span className="text-orange-300">{formData.polo}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Imagens:</span>
                                                    <span className="text-green-300">{selectedImages.length} arquivo(s)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Informações úteis */}
                                        <div className="bg-gray-700/20 rounded-xl p-4 border border-gray-600/30">
                                            <h4 className="font-semibold text-gray-300 mb-3 flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Dicas importantes
                                            </h4>
                                            <ul className="space-y-2 text-sm text-gray-400">
                                                <li className="flex items-start">
                                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                    O autor é gerado automaticamente baseado no polo
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                    Comunicados urgentes são publicados automaticamente
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                    Você pode editar após a publicação
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Status da publicação */}
                                        <div className="text-center">
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300 border border-green-600/30">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                                Status: Pronto para publicar
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
import { Header } from "../components/Header";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../services/apiService";
import { useNotification } from "../contexts/NotificationContext";

export const NotesEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { success, error, warning, showConfirm } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    

    const [formData, setFormData] = useState({
        titulo: "",
        conteudo: "",
        email: "",
        polo: "",
        categoria: "Geral",
        prioridade: "media"
    });


    useEffect(() => {
        const loadComunicado = async () => {
            if (!id) {
                error('Erro', 'ID do comunicado não fornecido');
                navigate('/comunicados');
                return;
            }

            try {
                setIsLoading(true);
                console.log('📖 Carregando comunicado para edição:', id);
                
                const comunicado = await apiService.getComunicadoById(id);
                console.log('📄 Dados carregados:', comunicado);
                

                setFormData({
                    titulo: comunicado.titulo || "",
                    conteudo: comunicado.conteudo || "",
                    email: comunicado.email || "",
                    polo: comunicado.polo || "",
                    categoria: comunicado.categoria || "Geral",
                    prioridade: comunicado.prioridade || "media"
                });


                if (comunicado.imagens && comunicado.imagens.length > 0) {
                    setExistingImages(comunicado.imagens);
                    console.log('🖼️ Imagens existentes:', comunicado.imagens);
                }

                setIsLoading(false);
            } catch (err: any) {
                console.error('❌ Erro ao carregar comunicado:', err);
                error('Erro ao carregar', 'Não foi possível carregar os dados do comunicado.');
                navigate('/comunicados');
            }
        };

        loadComunicado();
    }, [id, navigate, error]);

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

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };


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

            const tags = [...(formData.titulo ? [formData.titulo.toLowerCase()] : [])];
            if (selectedDate) {
                const formattedDate = new Date(selectedDate).toLocaleDateString('pt-BR');
                tags.push(`agendado para ${formattedDate}`);
            }

            const comunicadoData = {
                ...formData,
                tags,
                imagens: selectedImages.length > 0 ? selectedImages : undefined, 
                existingImages: existingImages 
            };

            console.log('🔄 Atualizando comunicado:', comunicadoData);
            
            try {
                await apiService.updateComunicado(id!, comunicadoData);
                success('Comunicado atualizado', 'Comunicado atualizado com sucesso!');
                
                navigate('/comunicados');
            } catch (uploadError: any) {
                
                if (uploadError.message && (
                    uploadError.message.includes('upload') || 
                    uploadError.message.includes('bucket') || 
                    uploadError.message.includes('storage') ||
                    uploadError.message.includes('Firebase')
                )) {
                    console.warn('⚠️ Erro no upload de imagens, tentando sem imagens...');
                    
                    
                    const confirmWithoutImages = await showConfirm({
                        title: 'Erro no upload de imagens',
                        message: 'Erro no upload de novas imagens. Deseja atualizar o comunicado mantendo apenas as imagens existentes?',
                        confirmText: 'Atualizar sem novas imagens',
                        cancelText: 'Cancelar',
                        type: 'warning'
                    });
                    
                    if (confirmWithoutImages) {
                        const comunicadoSemImagens = {
                            ...formData,
                            tags,
                            existingImages: existingImages
                            
                        };
                        
                        await apiService.updateComunicado(id!, comunicadoSemImagens);
                        success('Comunicado atualizado', 'Comunicado atualizado com sucesso (sem novas imagens)');
                        navigate('/comunicados');
                    } else {
                        throw uploadError; 
                    }
                } else {
                    throw uploadError; 
                }
            }
        } catch (error: any) {
            console.error('❌ Erro detalhado ao atualizar comunicado:', error);
            console.error('❌ Stack trace:', error.stack);
            
            let errorMessage = 'Erro ao atualizar comunicado. Tente novamente.';
            if (error.message) {
                errorMessage = `${error.message}`;
            }
            
            error('Erro ao atualizar comunicado', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-900 via-gray-800 to-gray-900 pt-20 md:pl-50 lg:pl-50">
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-center items-center py-20">
                                <div className="text-white text-lg">Carregando dados do comunicado...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-900 via-gray-800 to-gray-900 pt-20 md:pl-50 lg:pl-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        

                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-2">
                                        Editar Comunicado
                                    </h1>
                                    <p className="text-gray-300">
                                        Atualize as informações do comunicado conforme necessário
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/comunicados')}
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 border border-gray-600"
                                >
                                    ← Voltar
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            <div className="lg:col-span-1 space-y-6">
                                

                                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                        Preview do Autor
                                    </h3>
                                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">A</span>
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{getAutorPreview()}</p>
                                                <p className="text-gray-400 text-sm">Administrador</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                                        Instruções de Edição
                                    </h3>
                                    <div className="space-y-3 text-sm text-gray-300">
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <p>Mantenha o título claro e descritivo</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <p>O autor será atualizado automaticamente com base no polo selecionado</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <p>Novas imagens serão adicionadas às existentes</p>
                                        </div>
                                        <div className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <p>Você pode remover imagens existentes se necessário</p>
                                        </div>
                                    </div>
                                </div>


                                {existingImages.length > 0 && (
                                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                                            Imagens Existentes
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {existingImages.map((imageUrl, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Imagem existente ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg border border-gray-600"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(index)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>


                            <div className="lg:col-span-2">
                                <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-8">
                                    

                                    <div className="space-y-6">
                                        

                                        <div>
                                            <label htmlFor="titulo" className="block text-sm font-medium text-white mb-2">
                                                Título do Comunicado *
                                            </label>
                                            <input
                                                type="text"
                                                id="titulo"
                                                name="titulo"
                                                value={formData.titulo}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                placeholder="Digite o título do comunicado..."
                                                required
                                            />
                                        </div>


                                        <div>
                                            <label htmlFor="conteudo" className="block text-sm font-medium text-white mb-2">
                                                Conteúdo *
                                            </label>
                                            <textarea
                                                id="conteudo"
                                                name="conteudo"
                                                value={formData.conteudo}
                                                onChange={handleInputChange}
                                                rows={6}
                                                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                                placeholder="Digite o conteúdo do comunicado..."
                                                required
                                            />
                                        </div>


                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            

                                            <div>
                                                <label htmlFor="polo" className="block text-sm font-medium text-white mb-2">
                                                    Polo
                                                </label>
                                                <select
                                                    id="polo"
                                                    name="polo"
                                                    value={formData.polo}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                >
                                                    <option value="" className="bg-gray-900 text-white">Selecione um polo</option>
                                                    <option value="Volta Redonda" className="bg-gray-900 text-white">Volta Redonda</option>
                                                    <option value="Resende" className="bg-gray-900 text-white">Resende</option>
                                                    <option value="Angra dos Reis" className="bg-gray-900 text-white">Angra dos Reis</option>
                                                </select>
                                            </div>


                                            <div>
                                                <label htmlFor="categoria" className="block text-sm font-medium text-white mb-2">
                                                    Categoria
                                                </label>
                                                <select
                                                    id="categoria"
                                                    name="categoria"
                                                    value={formData.categoria}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                >
                                                    <option value="Geral" className="bg-gray-900 text-white">Geral</option>
                                                    <option value="Urgente" className="bg-gray-900 text-white">Urgente</option>
                                                    <option value="Reunião" className="bg-gray-900 text-white">Reunião</option>
                                                    <option value="Evento" className="bg-gray-900 text-white">Evento</option>
                                                    <option value="Informativo" className="bg-gray-900 text-white">Informativo</option>
                                                </select>
                                            </div>
                                        </div>


                                        <div>
                                            <label htmlFor="prioridade" className="block text-sm font-medium text-white mb-2">
                                                Prioridade
                                            </label>
                                            <select
                                                id="prioridade"
                                                name="prioridade"
                                                value={formData.prioridade}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            >
                                                <option value="baixa" className="bg-gray-900 text-white">Baixa</option>
                                                <option value="media" className="bg-gray-900 text-white">Média</option>
                                                <option value="alta" className="bg-gray-900 text-white">Alta</option>
                                            </select>
                                        </div>


                                        <div>
                                            <label htmlFor="dataAgendada" className="block text-sm font-medium text-white mb-2">
                                                Data Agendada (Opcional)
                                            </label>
                                            <input
                                                type="date"
                                                id="dataAgendada"
                                                value={selectedDate}
                                                onChange={handleDateChange}
                                                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>


                                        <div>
                                            <label htmlFor="imagens" className="block text-sm font-medium text-white mb-2">
                                                Adicionar Novas Imagens
                                            </label>
                                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors duration-200">
                                                <input
                                                    type="file"
                                                    id="imagens"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageSelect}
                                                    className="hidden"
                                                />
                                                <label htmlFor="imagens" className="cursor-pointer">
                                                    <div className="text-gray-400 mb-2">
                                                        <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-300 font-medium">Clique para adicionar novas imagens</p>
                                                    <p className="text-gray-500 text-sm mt-1">PNG, JPG, JPEG até 5MB cada</p>
                                                </label>
                                            </div>
                                        </div>


                                        {imagePreview.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-white mb-3">Novas Imagens Selecionadas</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {imagePreview.map((preview, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={preview}
                                                                alt={`Preview ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg border border-gray-600"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeImage(index)}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>


                                    <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Atualizando...
                                                </div>
                                            ) : (
                                                'Atualizar Comunicado'
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/comunicados')}
                                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                                        >
                                            Cancelar
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
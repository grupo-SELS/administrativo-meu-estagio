import { Header } from "../components/Header";
import { CompanyLogo } from "../components/CompanyLogo";
import { IoIosAdd } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";
import { FiChevronLeft, FiChevronRight, FiEdit3, FiTrash2 } from "react-icons/fi";
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService, type Comunicado } from '../services/apiService';
import { useNotification } from '../contexts/NotificationContext';

export function Notes() {
    const navigate = useNavigate();
    const { success, error: showError, showConfirm } = useNotification();
    const [edit, setEdit] = useState<string | null>(null);
    const [comunicados, setComunicados] = useState<Comunicado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; title: string }>({
        isOpen: false,
        imageUrl: '',
        title: ''
    });
    const menuRef = useRef<HTMLDivElement>(null);
    const comunicadosPorPagina = 6;


    const indexOfLastComunicado = currentPage * comunicadosPorPagina;
    const indexOfFirstComunicado = indexOfLastComunicado - comunicadosPorPagina;
    const comunicadosAtuais = comunicados.slice(indexOfFirstComunicado, indexOfLastComunicado);
    const totalPaginas = Math.ceil(comunicados.length / comunicadosPorPagina);

    const handleToggleButton = (comunicadoId: string) => {
        setEdit(edit === comunicadoId ? null : comunicadoId);
    };

    const handleEditComunicado = (comunicadoId: string) => {
        console.log(`Editando comunicado: ${comunicadoId}`);
        setEdit(null); 
        navigate(`/comunicados/edit/${comunicadoId}`);
    };

    const handleDeleteComunicado = async (comunicadoId: string) => {
        console.log(`Deletando comunicado: ${comunicadoId}`);
        setEdit(null); 
        

        const confirmDelete = await showConfirm({
            title: 'Confirmar exclusão',
            message: 'Tem certeza que deseja deletar este comunicado? Esta ação não pode ser desfeita.',
            confirmText: 'Deletar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
        
        if (!confirmDelete) {
            return;
        }

        try {
            console.log('🗑️ Iniciando deleção do comunicado:', comunicadoId);
            
            await apiService.deleteComunicado(comunicadoId);
            

            setComunicados(prevComunicados => 
                prevComunicados.filter(comunicado => comunicado.id !== comunicadoId)
            );
            
            console.log('✅ Comunicado deletado com sucesso');
            success('Comunicado deletado', 'Comunicado deletado com sucesso!');
            
        } catch (error: any) {
            console.error('❌ Erro ao deletar comunicado:', error);
            showError('Erro ao deletar', `Erro ao deletar comunicado: ${error.message || 'Erro desconhecido'}`);
        }
    };

    const openImageModal = (imageUrl: string, title: string) => {
        setImageModal({
            isOpen: true,
            imageUrl,
            title
        });
    };

    const closeImageModal = () => {
        setImageModal({
            isOpen: false,
            imageUrl: '',
            title: ''
        });
    };

    const goToPage = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        setEdit(null); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPaginas) {
            goToPage(currentPage + 1);
        }
    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setEdit(null);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeImageModal();
                setEdit(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);


    useEffect(() => {
        const loadComunicados = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiService.getComunicados();
                setComunicados(response.comunicados || []);
            } catch (err) {
                console.error('Erro ao carregar comunicados:', err);
                setError('Erro ao carregar comunicados. Tente novamente.');
            } finally {
                setLoading(false);
            }
        };

        loadComunicados();
    }, []);


    const getTempoRelativo = (dataPublicacao: string) => {
        const data = new Date(dataPublicacao);
        const agora = new Date();
        const diff = agora.getTime() - data.getTime();
        const minutos = Math.floor(diff / (1000 * 60));
        const horas = Math.floor(diff / (1000 * 60 * 60));
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutos < 60) {
            return `${minutos} min atrás`;
        } else if (horas < 24) {
            return `${horas}h atrás`;
        } else {
            return `${dias} dias atrás`;
        }
    };

    useEffect(() => {
        if (edit) {
            console.log(`Menu aberto para comunicado: ${edit}`);
        } else {
            console.log('Menu fechado');
        }
    }, [edit]);



    return (
        <>
            <Header />


            <main className="w-auto pt-0 sm:ml-64">
                <section className="py-12 relative">
                    <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
                        <div className="w-full flex-col justify-start items-start lg:gap-14 gap-7 inline-flex">
                            <h2 className="text-gray-100 text-4xl font-bold pt-10 leading-normal">
                                Comunicados ({comunicados.length})
                            </h2>
                            <div className="w-full flex-col justify-start items-start gap-8 flex">

                                <section className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700/50 p-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
                                            <h3 className="text-gray-100 text-lg font-semibold">Ações Rápidas</h3>
                                        </div>
                                        <nav className="flex gap-3">
                                            <Link
                                                to="/comunicados/create" 
                                                className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-700"
                                            >
                                                <IoIosAdd className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                                                <span>Novo Comunicado</span>
                                            </Link>
                                        </nav>
                                    </div>
                                </section>


                                {loading ? (
                                    <div className="w-full flex justify-center items-center py-20">
                                        <div className="text-gray-300 text-lg">Carregando comunicados...</div>
                                    </div>
                                ) : error ? (
                                    <div className="w-full flex justify-center items-center py-20">
                                        <div className="text-red-400 text-lg">{error}</div>
                                    </div>
                                ) : comunicados.length === 0 ? (
                                    <div className="w-full flex justify-center items-center py-20">
                                        <div className="text-gray-300 text-lg">Nenhum comunicado encontrado</div>
                                    </div>
                                ) : (
                                    <div className="w-full flex-col justify-start items-start gap-6 flex">
                                        {comunicadosAtuais.map((comunicado) => (
                                        <div
                                            key={comunicado.id}
                                            className="w-full lg:p-8 p-5 bg-gray-800 rounded-3xl border border-gray-700 flex-col justify-start items-start gap-2.5 flex"
                                        >
                                            <div className="w-full flex-col justify-start items-start gap-3.5 flex">
                                                <div className="w-full justify-between items-center inline-flex">
                                                    <div className="w-full justify-start items-center gap-2.5 flex">
                                                        <div className="w-10 h-10 bg-gray-700 rounded-full justify-center items-center flex p-1">
                                                            <CompanyLogo size={32} className="rounded-full" />
                                                        </div>
                                                        <div className="flex-col justify-start items-start gap-1 inline-flex">
                                                            <h5 className="text-gray-100 text-sm font-semibold leading-snug">
                                                                {`admin - ${comunicado.polo || '---'}`}
                                                            </h5>
                                                            <h6 className="text-gray-300 text-xs font-normal leading-5">
                                                                {getTempoRelativo(comunicado.dataPublicacao)}
                                                            </h6>
                                                        </div>
                                                    </div>
                                                    <div className="group justify-end items-center flex relative">
                                                        <button
                                                            onClick={() => handleToggleButton(comunicado.id)} 
                                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
                                                        >
                                                            <SlOptionsVertical 
                                                                fill="white" 
                                                                className="w-4 h-4"
                                                            />
                                                        </button>


                                                        {edit === comunicado.id && (
                                                            <div 
                                                                ref={menuRef}
                                                                className="absolute right-0 top-10 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-200 ease-out scale-100 opacity-100"
                                                                style={{ 
                                                                    minWidth: '180px',
                                                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
                                                                }}
                                                            >

                                                                <div className="absolute -top-2 right-4 w-4 h-4 bg-gray-900 border-l border-t border-gray-700 rotate-45 z-10"></div>
                                                                
                                                                <div className="py-1 relative z-20 bg-gray-900">
                                                                    <button
                                                                        onClick={() => handleEditComunicado(comunicado.id)}
                                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-150 group"
                                                                    >
                                                                        <FiEdit3 className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                                                                        <span className="font-medium">Editar comunicado</span>
                                                                    </button>
                                                                    
                                                                    <div className="h-px bg-gray-700 mx-2 my-1"></div>
                                                                    
                                                                    <button
                                                                        onClick={() => handleDeleteComunicado(comunicado.id)}
                                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-red-900/20 hover:text-red-300 transition-all duration-150 group"
                                                                    >
                                                                        <FiTrash2 className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
                                                                        <span className="font-medium">Deletar comunicado</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-full">
                                                    <h1 className="text-gray-100 pb-3 text-lg font-semibold text-left leading-tight">
                                                        {comunicado.titulo}
                                                    </h1>
                                                    <p className="text-gray-300 text-sm font-normal leading-relaxed text-left">
                                                        {comunicado.conteudo}
                                                    </p>
                                                    

                                                    {comunicado.imagens && comunicado.imagens.length > 0 && (
                                                        <div className="mt-4 w-full">
                                                            <div className={`grid gap-3 ${
                                                                comunicado.imagens.length === 1 
                                                                    ? 'grid-cols-1' 
                                                                    : comunicado.imagens.length === 2 
                                                                    ? 'grid-cols-2' 
                                                                    : 'grid-cols-3'
                                                            }`}>
                                                                {comunicado.imagens.map((imagem, index) => (
                                                                    <div 
                                                                        key={index} 
                                                                        className="relative overflow-hidden rounded-lg aspect-video bg-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                                                                        onClick={() => openImageModal(imagem, comunicado.titulo)}
                                                                    >
                                                                        <img
                                                                            src={imagem}
                                                                            alt={`Anexo ${index + 1} - ${comunicado.titulo}`}
                                                                            className="w-full h-full object-cover"
                                                                            loading="lazy"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                )}


                                {!loading && !error && totalPaginas > 1 && (
                                    <div className="w-full flex justify-center items-center gap-4 mt-8">
                                        <button
                                            onClick={goToPreviousPage}
                                            disabled={currentPage === 1}
                                            className="flex items-center justify-center w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <FiChevronLeft className="w-5 h-5 text-gray-300" />
                                        </button>

                                        <div className="flex gap-2">
                                            {Array.from({ length: totalPaginas }, (_, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => goToPage(pageNumber)}
                                                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                                            currentPage === pageNumber
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={goToNextPage}
                                            disabled={currentPage === totalPaginas}
                                            className="flex items-center justify-center w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <FiChevronRight className="w-5 h-5 text-gray-300" />
                                        </button>
                                    </div>
                                )}


                                <div className="w-full flex justify-center">
                                    <p className="text-gray-400 text-sm">
                                        Mostrando {indexOfFirstComunicado + 1} - {Math.min(indexOfLastComunicado, comunicados.length)} de {comunicados.length} comunicados
                                    </p>
                                </div>



                            </div>
                        </div>
                    </div>
                </section>

            </main>


            {imageModal.isOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={closeImageModal}
                >
                    <div className="relative max-w-7xl max-h-screen p-4 w-full h-full flex items-center justify-center">

                        <button
                            onClick={closeImageModal}
                            className="absolute top-6 right-6 z-10 bg-gray-900/80 hover:bg-gray-800 text-white rounded-full p-3 transition-colors duration-200 border border-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>


                        <div 
                            className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden max-w-5xl max-h-[90vh] w-auto h-auto"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-100 truncate">
                                    {imageModal.title}
                                </h3>
                            </div>


                            <div className="flex items-center justify-center p-4 bg-gray-950">
                                <img
                                    src={imageModal.imageUrl}
                                    alt={imageModal.title}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
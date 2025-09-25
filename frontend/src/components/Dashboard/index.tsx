import { Link } from 'react-router-dom';
import { CompanyLogo } from '../CompanyLogo';
import { apiService, type Comunicado } from '../../services/apiService';
import AlertsSection from '../../components/AlertsSection';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  const dashboardAlerts = {
    pendingRequests: 0,
    absencesToday: 0,
    nearingHourLimit: 0,
    expiringContracts: 0,
  };

  // Carregar comunicados da API
  useEffect(() => {
    const fetchComunicados = async () => {
      try {
        console.log('🔄 Dashboard: Iniciando carregamento de comunicados...');
        setLoading(true);
        const response = await apiService.getComunicados({ limite: 3 });
        console.log('📊 Dashboard: Resposta da API recebida:', response);
        console.log('📋 Dashboard: Comunicados recebidos:', response.comunicados);
        console.log('📊 Dashboard: Total de comunicados:', response.comunicados?.length || 0);
        
        setComunicados(response.comunicados);
        setError(null);
        console.log('✅ Dashboard: Estado atualizado com sucesso');
      } catch (err) {
        console.error('❌ Dashboard: Erro ao carregar comunicados:', err);
        setError('Erro ao carregar comunicados. Tente novamente mais tarde.');
        // Fallback para dados mock em caso de erro
        setComunicados([]);
      } finally {
        setLoading(false);
        console.log('🏁 Dashboard: Carregamento finalizado');
      }
    };

    fetchComunicados();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-15 dark:bg-gray-900 sm:pl-64 md:pl-32 lg:pl-64">
      <main>
        <h1 className="text-3xl font-bold p-4 sm:p-6 lg:p-8 text-gray-200 dark:text-white">
          Painel de Controle
        </h1>

        <AlertsSection alertsData={dashboardAlerts} />

        <h1 className="text-3xl font-bold p-4 sm:p-6 lg:p-8 text-gray-200 dark:text-white">
          Últimos comunicados
        </h1>


        {error && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="text-gray-500 dark:text-gray-400">Carregando comunicados...</div>
          </div>
        ) : (
          <div className='flex flex-wrap justify-start items-stretch gap-6 p-4 sm:p-6 lg:p-8'>
            {comunicados.length === 0 ? (
              <div className="w-full text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">Nenhum comunicado encontrado.</p>
              </div>
            ) : (
              comunicados.map((comunicado) => {
                console.log('🎨 Dashboard: Renderizando comunicado:', comunicado.titulo);
                return (
                  <div key={comunicado.id} className="max-w-sm flex-1 min-w-[300px]">
                    <div className="h-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col">

                      <div className="flex items-center space-x-3 mb-4">
                        <CompanyLogo size={32} className="text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{comunicado.autor}</p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comunicado.dataPublicacao).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>


                <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2">
                  {comunicado.titulo}
                </h5>


                <p className="mb-4 font-normal text-gray-700 dark:text-gray-400 line-clamp-3 flex-grow">
                  {comunicado.conteudo}
                </p>


                {comunicado.imagens && comunicado.imagens.length > 0 && (
                  <div className="mb-4">
                    <div className={`grid gap-2 ${
                      comunicado.imagens.length === 1 
                        ? 'grid-cols-1' 
                        : comunicado.imagens.length === 2 
                        ? 'grid-cols-2' 
                        : 'grid-cols-3'
                    }`}>
                      {comunicado.imagens.slice(0, 3).map((imagem, index) => {
                        console.log(`🖼️ DEBUG - URL da imagem ${index + 1}:`, imagem);
                        return (
                          <div 
                            key={index} 
                            className="relative overflow-hidden rounded-lg aspect-video bg-gray-200 dark:bg-gray-700"
                            style={{ minHeight: '150px', backgroundColor: '#f3f4f6' }}
                          >
                            <img
                              src={imagem}
                              alt={`Imagem ${index + 1} - ${comunicado.titulo}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover',
                                display: 'block',
                                maxWidth: '100%'
                              }}
                              onError={(e) => {
                                console.error(`❌ Erro ao carregar imagem ${index + 1}:`, imagem, e);
                                const target = e.target as HTMLImageElement;
                                target.style.backgroundColor = '#ef4444';
                                target.style.color = '#fff';
                                target.innerHTML = 'Erro ao carregar';
                              }}
                              onLoad={() => {
                                console.log(`✅ Imagem ${index + 1} carregada com sucesso:`, imagem);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {comunicado.imagens.length > 3 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        +{comunicado.imagens.length - 3} imagem(ns) adicional(is)
                      </p>
                    )}
                  </div>
                )}

                {/* Polo e Categoria */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    {comunicado.polo && <span>{comunicado.polo}</span>}
                    {comunicado.categoria && <span>{comunicado.categoria}</span>}
                  </div>
                </div>
              </div>
            </div>
                );
              })
            )}
          </div>
        )}


        <div className="text-center p-4 sm:p-6 lg:p-8">
          <Link 
            to="/comunicados" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Ver todos os comunicados
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
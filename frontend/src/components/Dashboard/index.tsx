import { Link } from 'react-router-dom';
import { CompanyLogo } from '../CompanyLogo';
import apiService, { type Comunicado } from '../../services/apiService';
import AlertsSection from '../../components/AlertsSection';
import { useState, useEffect } from 'react';


const ComunicadoImagem = ({ imagem, index, titulo }: { imagem: string; index: number; titulo: string }) => {
  const [imageError, setImageError] = useState(false);


  if (!imagem || typeof imagem !== 'string') {
    return (
      <div className="relative overflow-hidden rounded-lg aspect-video bg-gray-700" style={{ minHeight: '150px' }}>
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/30 border border-red-700">
          <svg className="w-8 h-8 text-red-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-xs text-red-300">URL inválida</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative overflow-hidden rounded-lg aspect-video bg-gray-700"
      style={{ minHeight: '150px' }}
    >
      {imageError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/30 border border-red-700">
          <svg className="w-8 h-8 text-red-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-xs text-red-300">Falha ao carregar</span>
        </div>
      ) : (
        <img
          src={apiService.getImageUrl(imagem)}
          alt={`Imagem ${index + 1} - ${titulo}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

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


  useEffect(() => {
    const fetchComunicados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getComunicados({ limite: 3 });
        const comunicadosData = Array.isArray(response.comunicados) 
          ? response.comunicados 
          : [];
        setComunicados(comunicadosData);
      } catch (err: any) {
        if (err?.message === 'BACKEND_OFFLINE') {
          setError('Servidor backend não está disponível. Inicie o servidor com: npm run dev');
        } else {
          setError('Erro ao conectar com o servidor. Verifique sua conexão.');
        }
        setComunicados([]);
      } finally {
        setLoading(false);
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
          <div className="mx-4 sm:mx-6 lg:mx-8 mb-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-yellow-400 font-semibold mb-1">Servidor Backend Offline</h3>
                <p className="text-yellow-300 text-sm mb-2">{error}</p>
                <div className="bg-gray-800 rounded p-3 text-xs font-mono text-gray-300">
                  <p className="mb-1">📁 cd backend</p>
                  <p>▶️ npm run dev</p>
                </div>
              </div>
            </div>
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
              comunicados.map((comunicado) => (
                <div key={comunicado.id} className="max-w-sm flex-1 min-w-[300px]">
                    <div className="h-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col">

                      <div className="flex items-center space-x-3 mb-4">
                        <CompanyLogo size={32} className="text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{comunicado.autor}</p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            {comunicado.dataPublicacao ? new Date(comunicado.dataPublicacao).toLocaleDateString('pt-BR') : 'Data não disponível'}
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
                      {comunicado.imagens.slice(0, 3).map((imagem, index) => (
                        <ComunicadoImagem 
                          key={index}
                          imagem={imagem}
                          index={index}
                          titulo={comunicado.titulo}
                        />
                      ))}
                    </div>
                    {comunicado.imagens.length > 3 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        +{comunicado.imagens.length - 3} imagem(ns) adicional(is)
                      </p>
                    )}
                  </div>
                )}

                
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    {comunicado.polo && <span>{comunicado.polo}</span>}
                    {comunicado.categoria && <span>{comunicado.categoria}</span>}
                  </div>
                </div>
              </div>
            </div>
              ))
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

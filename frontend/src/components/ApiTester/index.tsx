import { useState } from 'react';
import ApiService from '../../services/apiService';

const ApiTester = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const healthResult = await ApiService.healthCheck();
      
      setTestResult({
        health: healthResult
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testComunicados = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ApiService.getComunicados({ limite: 5 });
      setTestResult({ comunicados: result });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        🔧 Teste de Conectividade API
      </h3>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Conexão'}
          </button>
          
          <button
            onClick={testComunicados}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Comunicados'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Erro:</strong> {error}
            <div className="mt-2 text-sm">
              <p>• Verifique se o backend está rodando</p>
              <p>• Verifique se o serviceAccountKey.json está configurado</p>
              <p>• Verifique se o Firebase Admin está inicializado</p>
            </div>
          </div>
        )}

        {testResult && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <strong>Sucesso!</strong>
            <pre className="mt-2 text-xs overflow-auto max-h-64 bg-gray-100 p-2 rounded">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTester;
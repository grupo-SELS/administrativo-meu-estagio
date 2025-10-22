import express from 'express';
import cors from 'cors';

console.log('🔧 Iniciando servidor de testes...');

const app = express();
const PORT = 3001;

try {
  console.log('✓ Express app criado');
  
  app.use(cors());
  console.log('✓ CORS configurado');
  
  app.use(express.json());
  console.log('✓ JSON parser configurado');
  
  app.get('/health', (req, res) => {
    console.log('📥 Requisição recebida em /health');
    res.json({ ok: true, message: 'Backend funcionando!' });
  });
  console.log('✓ Rota /health configurada');
  
  app.get('/api/comunicados', (req, res) => {
    console.log('📥 Requisição recebida em /api/comunicados');
    res.json({ comunicados: [], total: 0 });
  });
  console.log('✓ Rota /api/comunicados configurada');
  
  const server = app.listen(PORT, () => {
    console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
    console.log('🎯 Teste: curl http://localhost:3001/health\n');
  });
  
  server.on('error', (error: any) => {
    console.error('❌ Erro no servidor:', error);
    process.exit(1);
  });
  
  process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não capturada:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada não tratada:', reason);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Erro fatal ao configurar servidor:', error);
  process.exit(1);
}

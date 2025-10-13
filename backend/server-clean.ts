import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Importar rotas
import comunicadosRoutes from './routes/comunicadosRoutes';
import alunosRoutes from './routes/alunosRoutes';
import professoresRoutes from './routes/professoresRoutes';
import agendamentosRoutes from './routes/agendamentosRoutes';

dotenv.config();

const app = express();
const PORT = 3001;

console.log('🔧 Configurando servidor...');

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
console.log('✓ CORS configurado');

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('✓ Body parsers configurados');

// Servir arquivos estáticos (uploads)
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  // Se estiver rodando do dist, aponta para ../public, senão para ./public
  express.static(path.join(__dirname, __dirname.includes('dist') ? '../public/uploads' : 'public/uploads'))
);
console.log('✓ Rota /uploads configurada');

// Health check
app.get('/health', (req, res) => {
  console.log('📥 Health check recebido');
  res.json({
    ok: true,
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});
console.log('✓ Rota /health configurada');

// Rotas da API
app.use('/api', comunicadosRoutes);
app.use('/api', alunosRoutes);
app.use('/api', professoresRoutes);
app.use('/api', agendamentosRoutes);
console.log('✓ Rotas da API configuradas');

// Rota 404
app.use('*', (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Tratamento de erros
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro não tratado:', error);
  res.status(error.status || 500).json({
    error: 'Erro interno do servidor',
    message: error.message
  });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ ✅ ✅ SERVIDOR RODANDO EM http://localhost:${PORT} ✅ ✅ ✅\n`);
  console.log('Rotas disponíveis:');
  console.log('  - GET  /health');
  console.log('  - GET  /api/comunicados');
  console.log('  - GET  /api/alunos');
  console.log('  - GET  /api/professores');
  console.log('  - GET  /api/agendamentos\n');
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso!`);
    process.exit(1);
  } else {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promise rejeitada:', reason);
  process.exit(1);
});

export default app;

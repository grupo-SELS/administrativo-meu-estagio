import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import comunicadosRoutes from './routes/comunicadosRoutes';
import alunosRoutes from './routes/alunosRoutes';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;


const startServer = (port: number) => {
  const server = app.listen(port, () => {
    console.log('Servidor iniciado com sucesso!');
    console.log(`URL: http://localhost:${port}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    // Checa se o Firebase Admin foi inicializado corretamente
    let firebaseStatus = '❌ Não configurado';
    try {
      const { admin } = require('./config/firebase-admin');
      if (admin && admin.apps && admin.apps.length > 0) {
        firebaseStatus = '✅ Configurado';
      }
    } catch (e) {
      firebaseStatus = '❌ Não configurado';
    }
    console.log(`Firebase: ${firebaseStatus}`);
    console.log('Rotas disponíveis:');
    console.log('   GET  /health');
    console.log('   GET  /api/comunicados');
    console.log('   GET  /api/comunicados/:id');
    console.log('   POST /api/comunicados (autenticado)');
    console.log('   PUT  /api/comunicados/:id (autenticado)');
    console.log('   DELETE /api/comunicados/:id (autenticado)');
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Porta ${port} já está em uso. Tentando porta ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Erro ao iniciar servidor:', err);
    }
  });
};


app.use(helmet());
app.use(morgan('combined'));


app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-dev-bypass']
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'public/uploads')));

app.use('/test', express.static(path.join(__dirname, 'public')));


app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sistema de Gestão de Estágios - API funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});


app.use('/api', comunicadosRoutes);
app.use('/api', alunosRoutes);


app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /health',
      'GET /api/comunicados',
      'GET /api/comunicados/:id',
      'POST /api/comunicados',
      'PUT /api/comunicados/:id',
      'DELETE /api/comunicados/:id'
    ]
  });
});


app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[  Erro não tratado  ]: ', error);
  
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(error.status || 500).json({
    error: 'Erro interno do servidor',
    ...(isDevelopment && {
      details: error.message,
      stack: error.stack
    }),
    timestamp: new Date().toISOString()
  });
});


startServer(PORT as number);

export default app;
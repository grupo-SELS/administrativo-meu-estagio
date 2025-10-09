import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import './config/production';

import comunicadosRoutes from './routes/comunicadosRoutes';
import alunosRoutes from './routes/alunosRoutes';
import professoresRoutes from './routes/professoresRoutes';
import agendamentosRoutes from './routes/agendamentosRoutes';


dotenv.config();


const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEVELOPMENT = NODE_ENV === 'development';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL || 'http://localhost:5173',
];

const AVAILABLE_ROUTES = [
  'GET /health',
  'GET /api/comunicados',
  'GET /api/comunicados/:id',
  'POST /api/comunicados',
  'PUT /api/comunicados/:id',
  'DELETE /api/comunicados/:id',
  'GET /api/alunos',
  'GET /api/alunos/:id',
  'POST /api/alunos',
  'PUT /api/alunos/:id',
  'DELETE /api/alunos/:id',
  'GET /api/professores',
  'GET /api/professores/:id',
  'POST /api/professores',
  'PUT /api/professores/:id',
  'DELETE /api/professores/:id',
  'GET /api/agendamentos',
  'GET /api/agendamentos/:id',
  'GET /api/agendamentos/periodo',
  'POST /api/agendamentos',
  'PUT /api/agendamentos/:id',
  'DELETE /api/agendamentos/:id',
] as const;


const app = express();

const logServerInfo = (port: number): void => {
  console.log(`\n🚀 Servidor iniciado em http://localhost:${port}`);
  console.log(`🌍 Ambiente: ${NODE_ENV}\n`);
};

interface ServerError extends Error {
  code?: string;
  status?: number;
}

const startServer = (port: number): void => {
  const server = app.listen(port, () => {
    logServerInfo(port);
  });

  server.on('error', (err: ServerError) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Porta ${port} em uso. Tentando porta ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('❌ Erro ao iniciar servidor:', err.message);
      process.exit(1);
    }
  });
};


import { securityHeadersMiddleware, suspiciousActivityLogger, preventParameterPollution, requestTimeout, validateHostHeader } from './middleware/securityMiddleware';
import { apiRateLimit } from './middleware/rateLimitMiddleware';
import { auditMiddleware } from './middleware/auditMiddleware';
import { preventSSRF } from './middleware/ssrfMiddleware';


app.use(securityHeadersMiddleware);


if (!IS_DEVELOPMENT) {
  app.use(validateHostHeader(['localhost:3001', 'localhost']));
}


app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: IS_DEVELOPMENT ? false : {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);


app.use(morgan(IS_DEVELOPMENT ? 'dev' : 'combined', {
  skip: (req) => req.url === '/health'
}));


app.use(suspiciousActivityLogger);


app.use(preventParameterPollution);


app.use(requestTimeout(30000)); 


app.use(apiRateLimit);


app.use(auditMiddleware);


app.use(preventSSRF);

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-dev-bypass', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-JSON'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(
  '/uploads',
  (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'public/uploads'))
);


if (IS_DEVELOPMENT) {
  app.use('/test', express.static(path.join(__dirname, 'public')));
}


app.get('/health', (req: Request, res: Response) => {
  res.json({
    ok: true,
    message: 'Sistema de Gestão de Estágios - API funcionando',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});


app.use('/api', comunicadosRoutes);
app.use('/api', alunosRoutes);
app.use('/api', professoresRoutes);
app.use('/api', agendamentosRoutes);


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
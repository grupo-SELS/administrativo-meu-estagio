"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
require("./config/production");
const comunicadosRoutes_1 = __importDefault(require("./routes/comunicadosRoutes"));
const alunosRoutes_1 = __importDefault(require("./routes/alunosRoutes"));
const professoresRoutes_1 = __importDefault(require("./routes/professoresRoutes"));
const agendamentosRoutes_1 = __importDefault(require("./routes/agendamentosRoutes"));
dotenv_1.default.config();
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
];
const app = (0, express_1.default)();
const logServerInfo = (port) => {
    console.log(`\n🚀 Servidor iniciado em http://localhost:${port}`);
    console.log(`🌍 Ambiente: ${NODE_ENV}\n`);
};
const startServer = (port) => {
    const server = app.listen(port, () => {
        logServerInfo(port);
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`❌ Porta ${port} em uso. Tentando porta ${port + 1}...`);
            startServer(port + 1);
        }
        else {
            console.error('❌ Erro ao iniciar servidor:', err.message);
            process.exit(1);
        }
    });
};
const securityMiddleware_1 = require("./middleware/securityMiddleware");
const rateLimitMiddleware_1 = require("./middleware/rateLimitMiddleware");
const auditMiddleware_1 = require("./middleware/auditMiddleware");
const ssrfMiddleware_1 = require("./middleware/ssrfMiddleware");
app.use(securityMiddleware_1.securityHeadersMiddleware);
if (!IS_DEVELOPMENT) {
    app.use((0, securityMiddleware_1.validateHostHeader)(['localhost:3001', 'localhost']));
}
app.use((0, helmet_1.default)({
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
}));
app.use((0, morgan_1.default)(IS_DEVELOPMENT ? 'dev' : 'combined', {
    skip: (req) => req.url === '/health'
}));
app.use(securityMiddleware_1.suspiciousActivityLogger);
app.use(securityMiddleware_1.preventParameterPollution);
app.use((0, securityMiddleware_1.requestTimeout)(30000));
app.use(rateLimitMiddleware_1.apiRateLimit);
app.use(auditMiddleware_1.auditMiddleware);
app.use(ssrfMiddleware_1.preventSSRF);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        }
        else {
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
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(path_1.default.join(__dirname, 'public/uploads')));
if (IS_DEVELOPMENT) {
    app.use('/test', express_1.default.static(path_1.default.join(__dirname, 'public')));
}
app.get('/health', (req, res) => {
    res.json({
        ok: true,
        message: 'Sistema de Gestão de Estágios - API funcionando',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
    });
});
app.use('/api', comunicadosRoutes_1.default);
app.use('/api', alunosRoutes_1.default);
app.use('/api', professoresRoutes_1.default);
app.use('/api', agendamentosRoutes_1.default);
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
app.use((error, req, res, next) => {
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
startServer(PORT);
exports.default = app;
//# sourceMappingURL=server.js.map
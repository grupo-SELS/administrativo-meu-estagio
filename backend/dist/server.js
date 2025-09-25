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
const comunicadosRoutes_1 = __importDefault(require("./routes/comunicadosRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const startServer = (port) => {
    const server = app.listen(port, () => {
        console.log('Servidor iniciado com sucesso!');
        console.log(`URL: http://localhost:${port}`);
        console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Firebase: ${process.env.FIREBASE_SERVICE_ACCOUNT ? '✅ Configurado' : '❌ Não configurado'}`);
        console.log('Rotas disponíveis:');
        console.log('   GET  /health');
        console.log('   GET  /api/comunicados');
        console.log('   GET  /api/comunicados/:id');
        console.log('   POST /api/comunicados (autenticado)');
        console.log('   PUT  /api/comunicados/:id (autenticado)');
        console.log('   DELETE /api/comunicados/:id (autenticado)');
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`❌ Porta ${port} já está em uso. Tentando porta ${port + 1}...`);
            startServer(port + 1);
        }
        else {
            console.error('❌ Erro ao iniciar servidor:', err);
        }
    });
};
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use((0, cors_1.default)({
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
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(path_1.default.join(__dirname, 'public/uploads')));
app.use('/test', express_1.default.static(path_1.default.join(__dirname, 'public')));
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Sistema de Gestão de Estágios - API funcionando',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api', comunicadosRoutes_1.default);
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

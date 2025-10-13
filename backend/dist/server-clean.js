"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const comunicadosRoutes_1 = __importDefault(require("./routes/comunicadosRoutes"));
const alunosRoutes_1 = __importDefault(require("./routes/alunosRoutes"));
const professoresRoutes_1 = __importDefault(require("./routes/professoresRoutes"));
const agendamentosRoutes_1 = __importDefault(require("./routes/agendamentosRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3001;
console.log('🔧 Configurando servidor...');
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
console.log('✓ CORS configurado');
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
console.log('✓ Body parsers configurados');
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(path_1.default.join(__dirname, __dirname.includes('dist') ? '../public/uploads' : 'public/uploads')));
console.log('✓ Rota /uploads configurada');
app.get('/health', (req, res) => {
    console.log('📥 Health check recebido');
    res.json({
        ok: true,
        message: 'Backend funcionando!',
        timestamp: new Date().toISOString()
    });
});
console.log('✓ Rota /health configurada');
app.use('/api', comunicadosRoutes_1.default);
app.use('/api', alunosRoutes_1.default);
app.use('/api', professoresRoutes_1.default);
app.use('/api', agendamentosRoutes_1.default);
console.log('✓ Rotas da API configuradas');
app.use('*', (req, res) => {
    console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method
    });
});
app.use((error, req, res, next) => {
    console.error('❌ Erro não tratado:', error);
    res.status(error.status || 500).json({
        error: 'Erro interno do servidor',
        message: error.message
    });
});
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ ✅ ✅ SERVIDOR RODANDO EM http://localhost:${PORT} ✅ ✅ ✅\n`);
    console.log('Rotas disponíveis:');
    console.log('  - GET  /health');
    console.log('  - GET  /api/comunicados');
    console.log('  - GET  /api/alunos');
    console.log('  - GET  /api/professores');
    console.log('  - GET  /api/agendamentos\n');
});
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Porta ${PORT} já está em uso!`);
        process.exit(1);
    }
    else {
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
exports.default = app;
//# sourceMappingURL=server-clean.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
console.log('🔧 Iniciando servidor de testes...');
const app = (0, express_1.default)();
const PORT = 3001;
try {
    console.log('✓ Express app criado');
    app.use((0, cors_1.default)());
    console.log('✓ CORS configurado');
    app.use(express_1.default.json());
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
    server.on('error', (error) => {
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
}
catch (error) {
    console.error('❌ Erro fatal ao configurar servidor:', error);
    process.exit(1);
}
//# sourceMappingURL=test-server.js.map
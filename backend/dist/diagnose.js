"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3001;
console.log('🔧 Iniciando servidor de diagnóstico...\n');
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    console.log('✅ Requisição recebida em /health');
    res.json({ ok: true, message: 'Funcionando!' });
});
console.log('Tentando ouvir em 0.0.0.0:3001...');
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ ✅ ✅ SERVIDOR RODANDO ✅ ✅ ✅`);
    console.log(`Endereço: http://localhost:${PORT}`);
    console.log(`Também: http://127.0.0.1:${PORT}`);
    console.log(`\nTeste agora: curl http://localhost:3001/health\n`);
});
server.on('listening', () => {
    const addr = server.address();
    console.log('📊 Detalhes da conexão:', addr);
});
server.on('error', (err) => {
    console.error('\n❌ ERRO AO INICIAR SERVIDOR:');
    console.error('Código:', err.code);
    console.error('Mensagem:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`\n🔴 A porta ${PORT} já está em uso!`);
        console.error('Execute: netstat -ano | findstr :3001');
    }
    process.exit(1);
});
setTimeout(() => {
    console.log('\n🔍 Verificando estado do servidor:');
    console.log('  Processo PID:', process.pid);
    console.log('  Listening:', server.listening);
    if (server.listening) {
        console.log('  ✓ Servidor confirmado ouvindo!');
        console.log('\n  Agora teste no navegador ou terminal:');
        console.log('  → http://localhost:3001/health');
        console.log('  → curl http://localhost:3001/health');
    }
    else {
        console.log('  ✗ Servidor NÃO está ouvindo!');
    }
}, 1000);
//# sourceMappingURL=diagnose.js.map
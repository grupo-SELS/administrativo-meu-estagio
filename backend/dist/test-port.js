"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/test', (req, res) => {
    console.log('✅ Requisição recebida!');
    res.json({ message: 'Funcionou!' });
});
const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`\n🚀 Servidor de teste em http://127.0.0.1:${PORT}`);
    console.log('Teste: curl http://127.0.0.1:8080/test\n');
});
server.on('listening', () => {
    const address = server.address();
    console.log('✓ Servidor REALMENTE ouvindo em:', address);
});
server.on('error', (err) => {
    console.error('❌ Erro:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} em uso!`);
    }
    else if (err.code === 'EACCES') {
        console.error('Sem permissão para usar esta porta!');
    }
    else if (err.code === 'EADDRNOTAVAIL') {
        console.error('Endereço não disponível!');
    }
    process.exit(1);
});
setTimeout(() => {
    console.log('\n📊 Status do servidor:');
    console.log('  - Processo rodando:', process.pid);
    console.log('  - Servidor listening:', server.listening);
    const addr = server.address();
    console.log('  - Address:', addr);
}, 2000);
//# sourceMappingURL=test-port.js.map
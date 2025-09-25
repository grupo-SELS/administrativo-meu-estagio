"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true
}));
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend funcionando!' });
});
app.get('/api/comunicados', (req, res) => {
    res.json({
        comunicados: [
            {
                id: '1',
                titulo: 'Teste',
                conteudo: 'Comunicado de teste',
                autor: 'Sistema',
                status: 'ativo',
                dataPublicacao: new Date().toISOString()
            }
        ],
        total: 1
    });
});
const tryPort = (port) => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            console.log(`✅ Backend rodando em http://localhost:${port}`);
            resolve(port);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`❌ Porta ${port} ocupada, tentando ${port + 1}...`);
                tryPort(port + 1).then(resolve).catch(reject);
            }
            else {
                reject(err);
            }
        });
    });
};
tryPort(3001).catch(console.error);

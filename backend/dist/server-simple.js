"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'Backend funcionando!' });
});
app.get('/api/comunicados', (req, res) => {
    res.json({ comunicados: [], total: 0 });
});
app.listen(PORT, () => {
    console.log(`✅ Servidor SIMPLES rodando em http://localhost:${PORT}`);
});
//# sourceMappingURL=server-simple.js.map
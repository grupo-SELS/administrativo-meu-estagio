"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comunicadosController_1 = __importDefault(require("../controllers/comunicadosController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const router = (0, express_1.Router)();
const controller = comunicadosController_1.default;
const devAuthBypass = (req, res, next) => {
    if (process.env.NODE_ENV === 'development' || req.headers['x-dev-bypass']) {
        console.log('🔓 Bypass de autenticação ativado para desenvolvimento');
        req.user = {
            uid: 'dev-user',
            email: 'dev@test.com',
            name: 'Usuário de Desenvolvimento'
        };
        return next();
    }
    return (0, authMiddleware_1.authMiddleware)(req, res, next);
};
router.get('/comunicados', controller.listar.bind(controller));
router.get('/comunicados/:id', controller.buscarPorId.bind(controller));
router.post('/comunicados', (req, res, next) => {
    console.log('📥 POST /comunicados recebido');
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body keys:', Object.keys(req.body));
    next();
}, devAuthBypass, uploadMiddleware_1.uploadMiddleware, uploadMiddleware_1.processUploads, controller.criar.bind(controller));
router.put('/comunicados/:id', (req, res, next) => {
    console.log('📥 PUT /comunicados/:id recebido');
    console.log('📋 ID:', req.params.id);
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body keys:', Object.keys(req.body));
    next();
}, devAuthBypass, uploadMiddleware_1.uploadMiddleware, uploadMiddleware_1.processUploads, controller.editar.bind(controller));
router.delete('/comunicados/:id', (req, res, next) => {
    console.log('🗑️ DELETE /comunicados/:id recebido');
    console.log('📋 ID:', req.params.id);
    console.log('Headers:', req.headers);
    console.log('URL completa:', req.url);
    console.log('Método:', req.method);
    next();
}, devAuthBypass, controller.deletar.bind(controller));
exports.default = router;

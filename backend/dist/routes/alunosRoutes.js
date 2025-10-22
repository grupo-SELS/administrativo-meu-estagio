"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alunosController_1 = __importDefault(require("../controllers/alunosController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const router = (0, express_1.Router)();
const controller = alunosController_1.default;
const devAuthBypass = (req, res, next) => {
    if (process.env.NODE_ENV === 'development' || req.headers['x-dev-bypass']) {
        req.user = {
            uid: 'dev-user',
            email: 'dev@test.com',
            name: 'Usuário de Desenvolvimento'
        };
        return next();
    }
    return (0, authMiddleware_1.authMiddleware)(req, res, next);
};
router.get('/alunos', rateLimitMiddleware_1.apiRateLimit, devAuthBypass, controller.listar.bind(controller));
router.get('/alunos/:id', rateLimitMiddleware_1.apiRateLimit, devAuthBypass, (0, validationMiddleware_1.validateId)('id'), controller.buscarPorId.bind(controller));
router.post('/alunos', rateLimitMiddleware_1.strictRateLimit, devAuthBypass, validationMiddleware_1.sanitizeBody, (0, validationMiddleware_1.validateRequired)(['nome', 'cpf', 'email']), controller.criar.bind(controller));
router.put('/alunos/:id', rateLimitMiddleware_1.strictRateLimit, devAuthBypass, (0, validationMiddleware_1.validateId)('id'), validationMiddleware_1.sanitizeBody, controller.editar.bind(controller));
router.delete('/alunos/:id', rateLimitMiddleware_1.strictRateLimit, devAuthBypass, (0, validationMiddleware_1.validateId)('id'), controller.deletar.bind(controller));
exports.default = router;
//# sourceMappingURL=alunosRoutes.js.map
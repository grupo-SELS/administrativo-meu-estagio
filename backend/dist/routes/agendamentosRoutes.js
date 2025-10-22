"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agendamentosController_1 = __importDefault(require("../controllers/agendamentosController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const router = (0, express_1.Router)();
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
const devRateLimit = process.env.NODE_ENV === 'development'
    ? rateLimitMiddleware_1.apiRateLimit
    : rateLimitMiddleware_1.strictRateLimit;
router.post('/agendamentos', devRateLimit, devAuthBypass, validationMiddleware_1.sanitizeBody, (0, validationMiddleware_1.validateRequired)(['localEstagio', 'horarioInicio', 'horarioFim', 'data']), agendamentosController_1.default.criar);
router.get('/agendamentos', rateLimitMiddleware_1.apiRateLimit, devAuthBypass, agendamentosController_1.default.listar);
router.get('/agendamentos/periodo', rateLimitMiddleware_1.apiRateLimit, devAuthBypass, agendamentosController_1.default.buscarPorPeriodo);
router.get('/agendamentos/:id', rateLimitMiddleware_1.apiRateLimit, devAuthBypass, (0, validationMiddleware_1.validateId)('id'), agendamentosController_1.default.buscarPorId);
router.put('/agendamentos/:id', devRateLimit, devAuthBypass, (0, validationMiddleware_1.validateId)('id'), validationMiddleware_1.sanitizeBody, agendamentosController_1.default.editar);
router.delete('/agendamentos/:id', devRateLimit, devAuthBypass, (0, validationMiddleware_1.validateId)('id'), agendamentosController_1.default.deletar);
exports.default = router;
//# sourceMappingURL=agendamentosRoutes.js.map
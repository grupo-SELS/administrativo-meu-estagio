"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comunicadosController_1 = __importDefault(require("../controllers/comunicadosController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const rateLimitMiddleware_1 = require("../middleware/rateLimitMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const router = (0, express_1.Router)();
const controller = comunicadosController_1.default;
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
router.get('/comunicados', rateLimitMiddleware_1.apiRateLimit, controller.listar.bind(controller));
router.get('/comunicados/:id', rateLimitMiddleware_1.apiRateLimit, (0, validationMiddleware_1.validateId)('id'), controller.buscarPorId.bind(controller));
router.post('/comunicados', rateLimitMiddleware_1.strictRateLimit, devAuthBypass, validationMiddleware_1.sanitizeBody, (0, validationMiddleware_1.validateRequired)(['titulo', 'conteudo']), uploadMiddleware_1.uploadMiddleware, (0, validationMiddleware_1.validateFileType)(['jpg', 'jpeg', 'png', 'gif', 'webp']), (0, validationMiddleware_1.validateFileSize)(5), uploadMiddleware_1.processUploads, controller.criar.bind(controller));
router.put('/comunicados/:id', rateLimitMiddleware_1.strictRateLimit, devAuthBypass, (0, validationMiddleware_1.validateId)('id'), validationMiddleware_1.sanitizeBody, uploadMiddleware_1.uploadMiddleware, (0, validationMiddleware_1.validateFileType)(['jpg', 'jpeg', 'png', 'gif', 'webp']), (0, validationMiddleware_1.validateFileSize)(5), uploadMiddleware_1.processUploads, controller.editar.bind(controller));
router.delete('/comunicados/:id', rateLimitMiddleware_1.strictRateLimit, devAuthBypass, (0, validationMiddleware_1.validateId)('id'), controller.deletar.bind(controller));
exports.default = router;
//# sourceMappingURL=comunicadosRoutes.js.map
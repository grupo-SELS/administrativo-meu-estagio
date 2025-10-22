"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminMiddleware = adminMiddleware;
const firebase_admin_1 = require("../config/firebase-admin");
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                error: 'Token de autorização não fornecido',
                code: 'NO_TOKEN'
            });
            return;
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                error: 'Formato de token inválido. Use: Bearer <token>',
                code: 'INVALID_FORMAT'
            });
            return;
        }
        try {
            const decodedToken = await firebase_admin_1.auth.verifyIdToken(token);
            req.user = decodedToken;
            next();
        }
        catch (verifyError) {
            console.error('Erro na verificação do token:', verifyError.code);
            let errorMessage = 'Token inválido';
            if (verifyError.code === 'auth/id-token-expired') {
                errorMessage = 'Token expirado';
            }
            else if (verifyError.code === 'auth/id-token-revoked') {
                errorMessage = 'Token revogado';
            }
            res.status(401).json({
                error: errorMessage,
                code: verifyError.code
            });
            return;
        }
    }
    catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
        return;
    }
}
async function adminMiddleware(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Usuário não autenticado' });
            return;
        }
        const userRecord = await firebase_admin_1.auth.getUser(req.user.uid);
        const customClaims = userRecord.customClaims;
        if (!customClaims?.admin) {
            res.status(403).json({
                error: 'Acesso negado. Apenas administradores podem realizar esta ação.',
                code: 'ADMIN_REQUIRED'
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Erro no middleware de admin:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
        return;
    }
}
//# sourceMappingURL=authMiddleware.js.map
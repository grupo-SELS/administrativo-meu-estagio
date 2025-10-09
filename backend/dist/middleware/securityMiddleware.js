"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeadersMiddleware = securityHeadersMiddleware;
exports.suspiciousActivityLogger = suspiciousActivityLogger;
exports.validateHostHeader = validateHostHeader;
exports.preventParameterPollution = preventParameterPollution;
exports.requestTimeout = requestTimeout;
exports.protectSensitiveRoutes = protectSensitiveRoutes;
const security_1 = __importDefault(require("../config/security"));
function securityHeadersMiddleware(req, res, next) {
    Object.entries(security_1.default.securityHeaders).forEach(([header, value]) => {
        res.setHeader(header, value);
    });
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    if (security_1.default.environment.isProduction) {
        const cspDirectives = Object.entries(security_1.default.csp.directives)
            .map(([key, values]) => {
            const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${directive} ${Array.isArray(values) ? values.join(' ') : values}`;
        })
            .join('; ');
        res.setHeader('Content-Security-Policy', cspDirectives);
    }
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    if (security_1.default.environment.isProduction) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
    next();
}
function suspiciousActivityLogger(req, res, next) {
    const suspiciousPatterns = [
        /(\.\.|\/etc\/|\/proc\/|\\\.\.)/i,
        /(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|eval|expression)/i,
        /(cmd|powershell|bash|sh|wget|curl|nc|netcat)/i,
        /(<script|<iframe|<object|<embed|onerror|onload|onclick)/i,
        /(\$\{|\{\{|<%|%>)/i,
    ];
    const urlSuspicious = suspiciousPatterns.some(pattern => pattern.test(req.url));
    const bodySuspicious = req.body && typeof req.body === 'object' &&
        JSON.stringify(req.body).match(suspiciousPatterns.join('|'));
    if (urlSuspicious || bodySuspicious) {
        console.error('🚨 Atividade suspeita detectada:', {
            ip: req.ip,
            method: req.method,
            url: req.url,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString(),
        });
    }
    next();
}
function validateHostHeader(allowedHosts) {
    return (req, res, next) => {
        const host = req.headers.host;
        if (!host || !allowedHosts.some(allowed => host === allowed || host.startsWith(allowed + ':'))) {
            res.status(400).json({
                error: 'Host inválido',
                code: 'INVALID_HOST'
            });
            return;
        }
        next();
    };
}
function preventParameterPollution(req, res, next) {
    const queryKeys = Object.keys(req.query);
    const duplicates = queryKeys.filter(key => Array.isArray(req.query[key]));
    if (duplicates.length > 0) {
        console.error('⚠️ HTTP Parameter Pollution detectado:', {
            ip: req.ip,
            duplicates,
            url: req.url,
        });
        duplicates.forEach(key => {
            const value = req.query[key];
            if (Array.isArray(value)) {
                req.query[key] = value[0];
            }
        });
    }
    next();
}
function requestTimeout(timeoutMs = 30000) {
    return (req, res, next) => {
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({
                    error: 'Tempo de requisição excedido',
                    code: 'REQUEST_TIMEOUT'
                });
            }
        }, timeoutMs);
        res.on('finish', () => {
            clearTimeout(timeout);
        });
        res.on('close', () => {
            clearTimeout(timeout);
        });
        next();
    };
}
function protectSensitiveRoutes(req, res, next) {
    const sensitiveRoutes = ['/admin', '/config', '/env', '/.env', '/backup'];
    const isSensitive = sensitiveRoutes.some(route => req.path.startsWith(route));
    if (isSensitive && !req.user) {
        res.status(403).json({
            error: 'Acesso negado a rota sensível',
            code: 'FORBIDDEN'
        });
        return;
    }
    next();
}
//# sourceMappingURL=securityMiddleware.js.map
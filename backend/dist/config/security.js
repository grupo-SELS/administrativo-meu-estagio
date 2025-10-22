"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityConfig = void 0;
exports.validateSecurityConfig = validateSecurityConfig;
exports.maskSensitiveData = maskSensitiveData;
exports.SecurityConfig = {
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAttempts: 5,
        lockoutDuration: 15 * 60 * 1000,
    },
    session: {
        maxAge: 24 * 60 * 60 * 1000,
        refreshThreshold: 30 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
    },
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-dev-bypass'],
        maxAge: 86400,
    },
    upload: {
        maxFileSize: 5 * 1024 * 1024,
        maxFiles: 10,
        allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        uploadPath: './public/uploads',
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardDelay: 0,
        delayAfter: 50,
        delayMs: 500,
    },
    csp: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    securityHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'no-referrer-when-downgrade',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        logErrors: true,
        logRequests: true,
        maskSensitiveData: true,
        sensitiveFields: ['password', 'token', 'authorization', 'cpf', 'credit_card'],
    },
    validation: {
        maxStringLength: 10000,
        maxArrayLength: 1000,
        maxObjectDepth: 10,
        allowedSpecialChars: /^[a-zA-Z0-9\s\-_.,!?@#$%&*()+=/\[\]{}:;"'<>|\\]+$/,
    },
    environment: {
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
        isTest: process.env.NODE_ENV === 'test',
    },
    backup: {
        enabled: process.env.BACKUP_ENABLED === 'true',
        frequency: 24 * 60 * 60 * 1000,
        retention: 7,
    },
};
function validateSecurityConfig() {
    const errors = [];
    if (!process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.NODE_ENV?.includes('test')) {
        errors.push('FIREBASE_SERVICE_ACCOUNT não configurado');
    }
    if (exports.SecurityConfig.environment.isProduction) {
        if (exports.SecurityConfig.cors.allowedOrigins.some(origin => origin.includes('localhost'))) {
            errors.push('CORS permite localhost em produção');
        }
        if (!exports.SecurityConfig.session.secure) {
            errors.push('Sessão não está configurada como secure em produção');
        }
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
function maskSensitiveData(data) {
    if (!exports.SecurityConfig.logging.maskSensitiveData)
        return data;
    if (typeof data !== 'object' || data === null)
        return data;
    const masked = Array.isArray(data) ? [...data] : { ...data };
    exports.SecurityConfig.logging.sensitiveFields.forEach(field => {
        if (field in masked) {
            masked[field] = '***MASKED***';
        }
    });
    return masked;
}
exports.default = exports.SecurityConfig;
//# sourceMappingURL=security.js.map
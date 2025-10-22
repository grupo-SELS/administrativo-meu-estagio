"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preventBruteForce = preventBruteForce;
exports.recordFailedLogin = recordFailedLogin;
exports.clearLoginAttempts = clearLoginAttempts;
exports.validatePasswordStrength = validatePasswordStrength;
exports.validatePassword = validatePassword;
exports.validateSession = validateSession;
exports.getLoginAttemptStats = getLoginAttemptStats;
const auditMiddleware_1 = require("./auditMiddleware");
const loginAttemptsByIP = new Map();
const loginAttemptsByEmail = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const ATTEMPT_WINDOW = 15 * 60 * 1000;
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
setInterval(() => {
    const now = Date.now();
    for (const [ip, attempt] of loginAttemptsByIP.entries()) {
        if (attempt.lockedUntil && attempt.lockedUntil < now) {
            loginAttemptsByIP.delete(ip);
        }
        else if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
            loginAttemptsByIP.delete(ip);
        }
    }
    for (const [email, attempt] of loginAttemptsByEmail.entries()) {
        if (attempt.lockedUntil && attempt.lockedUntil < now) {
            loginAttemptsByEmail.delete(email);
        }
        else if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
            loginAttemptsByEmail.delete(email);
        }
    }
}, 5 * 60 * 1000);
function recordLoginAttempt(identifier, store) {
    const now = Date.now();
    const attempt = store.get(identifier);
    if (attempt) {
        if (now - attempt.lastAttempt > ATTEMPT_WINDOW) {
            store.set(identifier, { count: 1, lastAttempt: now });
        }
        else {
            attempt.count++;
            attempt.lastAttempt = now;
            if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
                attempt.lockedUntil = now + LOCKOUT_DURATION;
            }
        }
    }
    else {
        store.set(identifier, { count: 1, lastAttempt: now });
    }
}
function isLocked(identifier, store) {
    const attempt = store.get(identifier);
    if (!attempt || !attempt.lockedUntil) {
        return { locked: false };
    }
    const now = Date.now();
    if (attempt.lockedUntil > now) {
        const remainingTime = Math.ceil((attempt.lockedUntil - now) / 1000);
        return { locked: true, remainingTime };
    }
    store.delete(identifier);
    return { locked: false };
}
function preventBruteForce(req, res, next) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email?.toLowerCase();
    const ipLock = isLocked(ip, loginAttemptsByIP);
    if (ipLock.locked) {
        (0, auditMiddleware_1.logAuditEvent)({
            level: 'warn',
            category: auditMiddleware_1.AuditCategory.SECURITY,
            action: 'brute_force_blocked_ip',
            ip,
            method: req.method,
            resource: req.originalUrl,
            details: { remainingTime: ipLock.remainingTime }
        });
        res.status(429).json({
            error: 'Muitas tentativas de login',
            message: `Conta temporariamente bloqueada. Tente novamente em ${ipLock.remainingTime} segundos.`,
            retryAfter: ipLock.remainingTime
        });
        return;
    }
    if (email) {
        const emailLock = isLocked(email, loginAttemptsByEmail);
        if (emailLock.locked) {
            (0, auditMiddleware_1.logAuditEvent)({
                level: 'warn',
                category: auditMiddleware_1.AuditCategory.SECURITY,
                action: 'brute_force_blocked_email',
                ip,
                userEmail: email,
                method: req.method,
                resource: req.originalUrl,
                details: { remainingTime: emailLock.remainingTime }
            });
            res.status(429).json({
                error: 'Muitas tentativas de login',
                message: `Conta temporariamente bloqueada. Tente novamente em ${emailLock.remainingTime} segundos.`,
                retryAfter: emailLock.remainingTime
            });
            return;
        }
    }
    next();
}
function recordFailedLogin(req, res, next) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email?.toLowerCase();
    recordLoginAttempt(ip, loginAttemptsByIP);
    if (email) {
        recordLoginAttempt(email, loginAttemptsByEmail);
    }
    (0, auditMiddleware_1.logAuditEvent)({
        level: 'warn',
        category: auditMiddleware_1.AuditCategory.AUTH,
        action: 'login_failed',
        ip,
        userEmail: email,
        method: req.method,
        resource: req.originalUrl,
        details: { attempts: loginAttemptsByIP.get(ip)?.count || 1 }
    });
    next();
}
function clearLoginAttempts(req, res, next) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email?.toLowerCase();
    loginAttemptsByIP.delete(ip);
    if (email) {
        loginAttemptsByEmail.delete(email);
    }
    (0, auditMiddleware_1.logAuditEvent)({
        level: 'info',
        category: auditMiddleware_1.AuditCategory.AUTH,
        action: 'login_success',
        ip,
        userEmail: email,
        userId: req.user?.uid,
        method: req.method,
        resource: req.originalUrl
    });
    next();
}
function validatePasswordStrength(password) {
    const errors = [];
    if (password.length < 8) {
        errors.push('A senha deve ter no mínimo 8 caracteres');
    }
    if (password.length > 128) {
        errors.push('A senha deve ter no máximo 128 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('A senha deve conter pelo menos um número');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('A senha deve conter pelo menos um caractere especial');
    }
    const commonPasswords = [
        'password', 'Password123!', '12345678', 'Qwerty123!',
        'Admin123!', 'Welcome123!', 'Password1!', 'Abc12345!'
    ];
    if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
        errors.push('A senha é muito comum. Por favor, escolha uma senha mais forte');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
function validatePassword(req, res, next) {
    const password = req.body?.password;
    if (!password) {
        res.status(400).json({
            error: 'Senha obrigatória',
            message: 'O campo senha é obrigatório'
        });
        return;
    }
    const validation = validatePasswordStrength(password);
    if (!validation.valid) {
        (0, auditMiddleware_1.logAuditEvent)({
            level: 'warn',
            category: auditMiddleware_1.AuditCategory.SECURITY,
            action: 'weak_password_rejected',
            ip: req.ip || 'unknown',
            method: req.method,
            resource: req.originalUrl,
            details: { errors: validation.errors }
        });
        res.status(400).json({
            error: 'Senha fraca',
            message: 'A senha não atende aos requisitos de segurança',
            requirements: validation.errors
        });
        return;
    }
    next();
}
function validateSession(req, res, next) {
    const user = req.user;
    if (!user) {
        res.status(401).json({
            error: 'Não autenticado',
            message: 'Sessão inválida ou expirada'
        });
        return;
    }
    if (user.sessionStart) {
        const sessionAge = Date.now() - user.sessionStart;
        if (sessionAge > SESSION_TIMEOUT) {
            (0, auditMiddleware_1.logAuditEvent)({
                level: 'warn',
                category: auditMiddleware_1.AuditCategory.AUTH,
                action: 'session_expired',
                userId: user.uid,
                userEmail: user.email,
                ip: req.ip || 'unknown',
                method: req.method,
                resource: req.originalUrl
            });
            res.status(401).json({
                error: 'Sessão expirada',
                message: 'Sua sessão expirou. Por favor, faça login novamente.'
            });
            return;
        }
    }
    next();
}
function getLoginAttemptStats() {
    return {
        blockedIPs: Array.from(loginAttemptsByIP.values()).filter(a => a.lockedUntil && a.lockedUntil > Date.now()).length,
        blockedEmails: Array.from(loginAttemptsByEmail.values()).filter(a => a.lockedUntil && a.lockedUntil > Date.now()).length,
        totalAttempts: loginAttemptsByIP.size + loginAttemptsByEmail.size
    };
}
//# sourceMappingURL=authSecurityMiddleware.js.map
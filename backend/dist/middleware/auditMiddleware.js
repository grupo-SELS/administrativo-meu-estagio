"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditCategory = void 0;
exports.logAuditEvent = logAuditEvent;
exports.auditMiddleware = auditMiddleware;
exports.auditAuthAttempt = auditAuthAttempt;
exports.auditSensitiveDataChange = auditSensitiveDataChange;
exports.auditAdminAccess = auditAdminAccess;
exports.getAuditLogs = getAuditLogs;
exports.cleanupOldAuditLogs = cleanupOldAuditLogs;
const security_1 = require("../config/security");
var AuditCategory;
(function (AuditCategory) {
    AuditCategory["AUTH"] = "authentication";
    AuditCategory["ACCESS"] = "access_control";
    AuditCategory["DATA"] = "data_access";
    AuditCategory["MUTATION"] = "data_mutation";
    AuditCategory["SECURITY"] = "security_event";
    AuditCategory["ERROR"] = "error";
    AuditCategory["ADMIN"] = "admin_action";
})(AuditCategory || (exports.AuditCategory = AuditCategory = {}));
const auditLog = [];
const MAX_AUDIT_LOG_SIZE = 10000;
function logAuditEvent(event) {
    const auditEvent = {
        timestamp: new Date().toISOString(),
        level: event.level || 'info',
        category: event.category || 'general',
        action: event.action || 'unknown',
        userId: event.userId,
        userEmail: event.userEmail,
        ip: event.ip || 'unknown',
        userAgent: event.userAgent,
        resource: event.resource,
        method: event.method || 'unknown',
        statusCode: event.statusCode,
        details: event.details ? (0, security_1.maskSensitiveData)(event.details) : undefined,
        duration: event.duration
    };
    auditLog.push(auditEvent);
    if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
        auditLog.shift();
    }
    const logMessage = `[AUDIT] ${auditEvent.level.toUpperCase()} | ${auditEvent.category} | ${auditEvent.action} | User: ${auditEvent.userEmail || auditEvent.userId || 'anonymous'} | IP: ${auditEvent.ip} | ${auditEvent.method} ${auditEvent.resource || ''} | Status: ${auditEvent.statusCode || 'N/A'}`;
    switch (auditEvent.level) {
        case 'critical':
        case 'error':
            console.error(logMessage, auditEvent.details ? JSON.stringify(auditEvent.details) : '');
            break;
        case 'warn':
            console.error(logMessage);
            break;
        default:
            break;
    }
}
function auditMiddleware(req, res, next) {
    const startTime = Date.now();
    const requestInfo = {
        method: req.method,
        resource: req.originalUrl,
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'],
        userId: req.user?.uid,
        userEmail: req.user?.email
    };
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        const duration = Date.now() - startTime;
        let category = AuditCategory.ACCESS;
        if (req.originalUrl.includes('/auth') || req.originalUrl.includes('/login')) {
            category = AuditCategory.AUTH;
        }
        else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            category = AuditCategory.MUTATION;
        }
        else if (req.originalUrl.includes('/admin')) {
            category = AuditCategory.ADMIN;
        }
        let level = 'info';
        if (res.statusCode >= 500) {
            level = 'error';
        }
        else if (res.statusCode >= 400) {
            level = 'warn';
        }
        logAuditEvent({
            ...requestInfo,
            level,
            category,
            action: `${req.method} ${req.originalUrl}`,
            statusCode: res.statusCode,
            duration,
            details: res.statusCode >= 400 ? body : undefined
        });
        return originalJson(body);
    };
    next();
}
function auditAuthAttempt(success) {
    return (req, res, next) => {
        logAuditEvent({
            level: success ? 'info' : 'warn',
            category: AuditCategory.AUTH,
            action: success ? 'login_success' : 'login_failed',
            userId: req.user?.uid,
            userEmail: req.body?.email || req.user?.email,
            ip: req.ip || req.socket.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'],
            resource: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode
        });
        next();
    };
}
function auditSensitiveDataChange(resource) {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                logAuditEvent({
                    level: 'warn',
                    category: AuditCategory.MUTATION,
                    action: `${req.method} ${resource}`,
                    userId: req.user?.uid,
                    userEmail: req.user?.email,
                    ip: req.ip || req.socket.remoteAddress || 'unknown',
                    userAgent: req.headers['user-agent'],
                    resource: req.originalUrl,
                    method: req.method,
                    statusCode: res.statusCode,
                    details: { resourceId: req.params.id }
                });
            }
            return originalJson(body);
        };
        next();
    };
}
function auditAdminAccess(req, res, next) {
    logAuditEvent({
        level: 'warn',
        category: AuditCategory.ADMIN,
        action: `admin_access_${req.method}`,
        userId: req.user?.uid,
        userEmail: req.user?.email,
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'],
        resource: req.originalUrl,
        method: req.method
    });
    next();
}
function getAuditLogs(filters) {
    let logs = [...auditLog];
    if (filters) {
        if (filters.startDate) {
            logs = logs.filter(log => new Date(log.timestamp) >= filters.startDate);
        }
        if (filters.endDate) {
            logs = logs.filter(log => new Date(log.timestamp) <= filters.endDate);
        }
        if (filters.level) {
            logs = logs.filter(log => log.level === filters.level);
        }
        if (filters.category) {
            logs = logs.filter(log => log.category === filters.category);
        }
        if (filters.userId) {
            logs = logs.filter(log => log.userId === filters.userId);
        }
        if (filters.limit) {
            logs = logs.slice(-filters.limit);
        }
    }
    return logs.reverse();
}
function cleanupOldAuditLogs(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const initialLength = auditLog.length;
    let removedCount = 0;
    for (let i = auditLog.length - 1; i >= 0; i--) {
        if (new Date(auditLog[i].timestamp) < cutoffDate) {
            auditLog.splice(i, 1);
            removedCount++;
        }
    }
    if (removedCount > 0) {
        console.error(`[AUDIT] Cleanup: Removed ${removedCount} old audit logs (${initialLength} -> ${auditLog.length})`);
    }
}
setInterval(() => cleanupOldAuditLogs(30), 24 * 60 * 60 * 1000);
//# sourceMappingURL=auditMiddleware.js.map
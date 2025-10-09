"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeString = sanitizeString;
exports.isValidEmail = isValidEmail;
exports.isValidCPF = isValidCPF;
exports.isValidPhone = isValidPhone;
exports.isValidDate = isValidDate;
exports.isValidTime = isValidTime;
exports.sanitizeBody = sanitizeBody;
exports.validateRequired = validateRequired;
exports.validateLength = validateLength;
exports.validateFileType = validateFileType;
exports.validateFileSize = validateFileSize;
exports.escapeSQL = escapeSQL;
exports.isValidId = isValidId;
exports.validateId = validateId;
function sanitizeString(str) {
    if (typeof str !== 'string')
        return '';
    return str
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}
function isValidCPF(cpf) {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    if (cleanCPF.length !== 11)
        return false;
    if (/^(\d)\1{10}$/.test(cleanCPF))
        return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10)
        digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(9)))
        return false;
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10)
        digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(10)))
        return false;
    return true;
}
function isValidPhone(phone) {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    return cleanPhone.length === 10 || cleanPhone.length === 11;
}
function isValidDate(date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date))
        return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
}
function isValidTime(time) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
}
function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeString(req.body[key]);
            }
        });
    }
    next();
}
function validateRequired(fields) {
    return (req, res, next) => {
        const missingFields = [];
        fields.forEach(field => {
            if (!req.body[field] || (typeof req.body[field] === 'string' && !req.body[field].trim())) {
                missingFields.push(field);
            }
        });
        if (missingFields.length > 0) {
            res.status(400).json({
                error: 'Campos obrigatórios ausentes',
                missingFields
            });
            return;
        }
        next();
    };
}
function validateLength(field, min, max) {
    return (req, res, next) => {
        const value = req.body[field];
        if (typeof value === 'string') {
            if (value.length < min || value.length > max) {
                res.status(400).json({
                    error: `Campo ${field} deve ter entre ${min} e ${max} caracteres`,
                    field,
                    currentLength: value.length
                });
                return;
            }
        }
        next();
    };
}
function validateFileType(allowedTypes) {
    return (req, res, next) => {
        const files = req.files;
        if (files && files.length > 0) {
            const invalidFiles = files.filter(file => {
                const ext = file.originalname.split('.').pop()?.toLowerCase();
                return !ext || !allowedTypes.includes(ext);
            });
            if (invalidFiles.length > 0) {
                res.status(400).json({
                    error: 'Tipo de arquivo não permitido',
                    allowedTypes,
                    invalidFiles: invalidFiles.map(f => f.originalname)
                });
                return;
            }
        }
        next();
    };
}
function validateFileSize(maxSizeInMB) {
    return (req, res, next) => {
        const files = req.files;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        if (files && files.length > 0) {
            const oversizedFiles = files.filter(file => file.size > maxSizeInBytes);
            if (oversizedFiles.length > 0) {
                res.status(400).json({
                    error: `Arquivo excede o tamanho máximo de ${maxSizeInMB}MB`,
                    maxSize: maxSizeInMB,
                    oversizedFiles: oversizedFiles.map(f => ({
                        name: f.originalname,
                        size: `${(f.size / 1024 / 1024).toFixed(2)}MB`
                    }))
                });
                return;
            }
        }
        next();
    };
}
function escapeSQL(str) {
    if (typeof str !== 'string')
        return '';
    return str.replace(/['";\\]/g, '\\$&');
}
function isValidId(id) {
    return /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 100;
}
function validateId(paramName = 'id') {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id || !isValidId(id)) {
            res.status(400).json({
                error: 'ID inválido',
                param: paramName
            });
            return;
        }
        next();
    };
}
//# sourceMappingURL=validationMiddleware.js.map
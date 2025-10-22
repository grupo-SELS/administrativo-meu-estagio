"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeCPF = sanitizeCPF;
exports.formatCPF = formatCPF;
exports.validarCPF = validarCPF;
exports.maskCPFForLogs = maskCPFForLogs;
exports.processarCPF = processarCPF;
exports.cpfJaExiste = cpfJaExiste;
exports.getMensagemErroCPF = getMensagemErroCPF;
exports.registrarAuditoriaCPF = registrarAuditoriaCPF;
function sanitizeCPF(cpf) {
    if (!cpf)
        return '';
    return cpf.replace(/\D/g, '');
}
function formatCPF(cpf) {
    const sanitized = sanitizeCPF(cpf);
    if (sanitized.length !== 11)
        return cpf;
    return sanitized.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
function validarCPF(cpf) {
    const sanitized = sanitizeCPF(cpf);
    if (sanitized.length !== 11) {
        return false;
    }
    if (/^(\d)\1{10}$/.test(sanitized)) {
        return false;
    }
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(sanitized.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digitoVerificador1 = resto >= 10 ? 0 : resto;
    if (digitoVerificador1 !== parseInt(sanitized.charAt(9))) {
        return false;
    }
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(sanitized.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digitoVerificador2 = resto >= 10 ? 0 : resto;
    if (digitoVerificador2 !== parseInt(sanitized.charAt(10))) {
        return false;
    }
    return true;
}
function maskCPFForLogs(cpf) {
    if (!cpf)
        return '';
    const sanitized = sanitizeCPF(cpf);
    if (sanitized.length !== 11)
        return '***';
    const ultimosDigitos = sanitized.slice(-5);
    return `***.***. ${ultimosDigitos.slice(0, 3)}-${ultimosDigitos.slice(3)}`;
}
function processarCPF(cpf) {
    if (!cpf || cpf.trim() === '') {
        return {
            valido: false,
            cpfSanitizado: '',
            erro: 'CPF é obrigatório'
        };
    }
    const sanitized = sanitizeCPF(cpf);
    if (!validarCPF(sanitized)) {
        return {
            valido: false,
            cpfSanitizado: sanitized,
            erro: 'CPF inválido. Verifique os dígitos.'
        };
    }
    return {
        valido: true,
        cpfSanitizado: sanitized
    };
}
async function cpfJaExiste(firestore, cpf, collection, excludeId) {
    try {
        const sanitized = sanitizeCPF(cpf);
        if (!sanitized || sanitized.length !== 11) {
            return false;
        }
        const snapshot = await firestore
            .collection(collection)
            .where('cpf', '==', sanitized)
            .get();
        if (snapshot.empty) {
            return false;
        }
        if (excludeId) {
            const filtered = snapshot.docs.filter(doc => doc.id !== excludeId);
            return filtered.length > 0;
        }
        return true;
    }
    catch (error) {
        console.error(`[cpfUtils] Erro ao verificar CPF existente:`, error);
        return false;
    }
}
function getMensagemErroCPF(erro) {
    const mensagens = {
        'CPF_OBRIGATORIO': 'CPF é obrigatório para o cadastro',
        'CPF_INVALIDO': 'CPF inválido. Verifique se digitou corretamente.',
        'CPF_DUPLICADO': 'Este CPF já está cadastrado no sistema',
        'CPF_FORMATO': 'CPF deve conter 11 dígitos numéricos'
    };
    return mensagens[erro] || 'Erro ao validar CPF';
}
function registrarAuditoriaCPF(log) {
    console.log('[AUDITORIA CPF]', {
        timestamp: log.timestamp.toISOString(),
        operation: log.operation,
        userId: log.userId,
        collection: log.collection,
        recordId: log.recordId,
        cpfMasked: log.cpfMasked,
        ip: log.ip,
        userAgent: log.userAgent
    });
}
exports.default = {
    sanitizeCPF,
    formatCPF,
    validarCPF,
    maskCPFForLogs,
    processarCPF,
    cpfJaExiste,
    getMensagemErroCPF,
    registrarAuditoriaCPF
};
//# sourceMappingURL=cpfUtils.js.map
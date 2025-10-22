export declare function sanitizeCPF(cpf: string): string;
export declare function formatCPF(cpf: string): string;
export declare function validarCPF(cpf: string): boolean;
export declare function maskCPFForLogs(cpf: string): string;
export declare function processarCPF(cpf: string): {
    valido: boolean;
    cpfSanitizado: string;
    erro?: string;
};
export declare function cpfJaExiste(firestore: FirebaseFirestore.Firestore, cpf: string, collection: 'alunos' | 'professores', excludeId?: string): Promise<boolean>;
export declare function getMensagemErroCPF(erro: string): string;
export interface CPFAuditLog {
    timestamp: Date;
    operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
    userId: string;
    collection: 'alunos' | 'professores';
    recordId: string;
    cpfMasked: string;
    ip?: string;
    userAgent?: string;
}
export declare function registrarAuditoriaCPF(log: CPFAuditLog): void;
declare const _default: {
    sanitizeCPF: typeof sanitizeCPF;
    formatCPF: typeof formatCPF;
    validarCPF: typeof validarCPF;
    maskCPFForLogs: typeof maskCPFForLogs;
    processarCPF: typeof processarCPF;
    cpfJaExiste: typeof cpfJaExiste;
    getMensagemErroCPF: typeof getMensagemErroCPF;
    registrarAuditoriaCPF: typeof registrarAuditoriaCPF;
};
export default _default;
//# sourceMappingURL=cpfUtils.d.ts.map
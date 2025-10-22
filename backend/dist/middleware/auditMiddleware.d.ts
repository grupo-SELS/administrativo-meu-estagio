import { Request, Response, NextFunction } from 'express';
interface AuditEvent {
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'critical';
    category: string;
    action: string;
    userId?: string;
    userEmail?: string;
    ip: string;
    userAgent?: string;
    resource?: string;
    method: string;
    statusCode?: number;
    details?: any;
    duration?: number;
}
export declare enum AuditCategory {
    AUTH = "authentication",
    ACCESS = "access_control",
    DATA = "data_access",
    MUTATION = "data_mutation",
    SECURITY = "security_event",
    ERROR = "error",
    ADMIN = "admin_action"
}
export declare function logAuditEvent(event: Partial<AuditEvent>): void;
export declare function auditMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function auditAuthAttempt(success: boolean): (req: Request, res: Response, next: NextFunction) => void;
export declare function auditSensitiveDataChange(resource: string): (req: Request, res: Response, next: NextFunction) => void;
export declare function auditAdminAccess(req: Request, res: Response, next: NextFunction): void;
export declare function getAuditLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    level?: string;
    category?: string;
    userId?: string;
    limit?: number;
}): AuditEvent[];
export declare function cleanupOldAuditLogs(daysToKeep?: number): void;
export {};
//# sourceMappingURL=auditMiddleware.d.ts.map
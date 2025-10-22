import { Request, Response, NextFunction } from 'express';
import { maskSensitiveData } from '../config/security';


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


export enum AuditCategory {
  AUTH = 'authentication',
  ACCESS = 'access_control',
  DATA = 'data_access',
  MUTATION = 'data_mutation',
  SECURITY = 'security_event',
  ERROR = 'error',
  ADMIN = 'admin_action'
}


const auditLog: AuditEvent[] = [];
const MAX_AUDIT_LOG_SIZE = 10000;


export function logAuditEvent(event: Partial<AuditEvent>): void {
  const auditEvent: AuditEvent = {
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
    details: event.details ? maskSensitiveData(event.details) : undefined,
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


export function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  

  const requestInfo = {
    method: req.method,
    resource: req.originalUrl,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.uid,
    userEmail: (req as any).user?.email
  };


  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const duration = Date.now() - startTime;


    let category = AuditCategory.ACCESS;
    if (req.originalUrl.includes('/auth') || req.originalUrl.includes('/login')) {
      category = AuditCategory.AUTH;
    } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      category = AuditCategory.MUTATION;
    } else if (req.originalUrl.includes('/admin')) {
      category = AuditCategory.ADMIN;
    }


    let level: 'info' | 'warn' | 'error' | 'critical' = 'info';
    if (res.statusCode >= 500) {
      level = 'error';
    } else if (res.statusCode >= 400) {
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


export function auditAuthAttempt(success: boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    logAuditEvent({
      level: success ? 'info' : 'warn',
      category: AuditCategory.AUTH,
      action: success ? 'login_success' : 'login_failed',
      userId: (req as any).user?.uid,
      userEmail: req.body?.email || (req as any).user?.email,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
      resource: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode
    });
    next();
  };
}


export function auditSensitiveDataChange(resource: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAuditEvent({
          level: 'warn',
          category: AuditCategory.MUTATION,
          action: `${req.method} ${resource}`,
          userId: (req as any).user?.uid,
          userEmail: (req as any).user?.email,
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


export function auditAdminAccess(req: Request, res: Response, next: NextFunction): void {
  logAuditEvent({
    level: 'warn',
    category: AuditCategory.ADMIN,
    action: `admin_access_${req.method}`,
    userId: (req as any).user?.uid,
    userEmail: (req as any).user?.email,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'],
    resource: req.originalUrl,
    method: req.method
  });
  next();
}


export function getAuditLogs(filters?: {
  startDate?: Date;
  endDate?: Date;
  level?: string;
  category?: string;
  userId?: string;
  limit?: number;
}): AuditEvent[] {
  let logs = [...auditLog];

  if (filters) {
    if (filters.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= filters.startDate!);
    }
    if (filters.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= filters.endDate!);
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


export function cleanupOldAuditLogs(daysToKeep: number = 30): void {
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

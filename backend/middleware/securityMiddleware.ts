import { Request, Response, NextFunction } from 'express';
import SecurityConfig from '../config/security';


export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  Object.entries(SecurityConfig.securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });


  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');


  if (SecurityConfig.environment.isProduction) {
    const cspDirectives = Object.entries(SecurityConfig.csp.directives)
      .map(([key, values]) => {
        const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${directive} ${Array.isArray(values) ? values.join(' ') : values}`;
      })
      .join('; ');
    
    res.setHeader('Content-Security-Policy', cspDirectives);
  }


  res.setHeader('X-Content-Type-Options', 'nosniff');


  res.setHeader('X-Frame-Options', 'DENY');


  if (SecurityConfig.environment.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }


  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');


  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

  next();
}


export function suspiciousActivityLogger(req: Request, res: Response, next: NextFunction): void {
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


export function validateHostHeader(allowedHosts: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
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


export function preventParameterPollution(req: Request, res: Response, next: NextFunction): void {

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


export function requestTimeout(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction): void => {
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


export function protectSensitiveRoutes(req: Request, res: Response, next: NextFunction): void {
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

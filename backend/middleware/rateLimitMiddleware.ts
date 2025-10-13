import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; 
  max: number; 
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs = 15 * 60 * 1000, 
    max = 100,
    message = 'Muitas requisições deste IP, tente novamente mais tarde.',
    statusCode = 429,
    skipSuccessfulRequests = false
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || 
               req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.socket.remoteAddress || 
               'unknown';
    
    const key = `${ip}-${req.path}`;
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      store[key].count++;
    }

    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    if (store[key].count > max) {
      res.status(statusCode).json({
        error: message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
      return;
    }

    if (!skipSuccessfulRequests) {
      next();
    } else {
      const originalSend = res.send;
      res.send = function(data: any) {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          store[key].count--;
        }
        return originalSend.call(this, data);
      };
      next();
    }
  };
}


export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  skipSuccessfulRequests: true
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Limite de requisições excedido. Tente novamente mais tarde.'
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, 
  max: 30,
  message: 'Limite de requisições excedido. Aguarde 1 minuto.'
});

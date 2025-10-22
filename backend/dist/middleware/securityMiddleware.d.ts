import { Request, Response, NextFunction } from 'express';
export declare function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function suspiciousActivityLogger(req: Request, res: Response, next: NextFunction): void;
export declare function validateHostHeader(allowedHosts: string[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function preventParameterPollution(req: Request, res: Response, next: NextFunction): void;
export declare function requestTimeout(timeoutMs?: number): (req: Request, res: Response, next: NextFunction) => void;
export declare function protectSensitiveRoutes(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=securityMiddleware.d.ts.map
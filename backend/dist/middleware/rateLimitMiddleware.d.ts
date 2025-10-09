import { Request, Response, NextFunction } from 'express';
export interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
    statusCode?: number;
    skipSuccessfulRequests?: boolean;
}
export declare function rateLimit(options: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => void;
export declare const loginRateLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const apiRateLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const strictRateLimit: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rateLimitMiddleware.d.ts.map
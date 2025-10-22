import { Request, Response, NextFunction } from 'express';
export declare function preventBruteForce(req: Request, res: Response, next: NextFunction): void;
export declare function recordFailedLogin(req: Request, res: Response, next: NextFunction): void;
export declare function clearLoginAttempts(req: Request, res: Response, next: NextFunction): void;
export declare function validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
};
export declare function validatePassword(req: Request, res: Response, next: NextFunction): void;
export declare function validateSession(req: Request, res: Response, next: NextFunction): void;
export declare function getLoginAttemptStats(): {
    blockedIPs: number;
    blockedEmails: number;
    totalAttempts: number;
};
//# sourceMappingURL=authSecurityMiddleware.d.ts.map
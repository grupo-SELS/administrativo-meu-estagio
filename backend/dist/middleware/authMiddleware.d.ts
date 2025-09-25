import { Request, Response, NextFunction } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
declare global {
    namespace Express {
        interface Request {
            user?: DecodedIdToken;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function adminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;

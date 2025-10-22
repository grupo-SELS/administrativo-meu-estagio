import { Request, Response, NextFunction } from 'express';
export declare function sanitizeString(str: string): string;
export declare function isValidEmail(email: string): boolean;
export declare function isValidCPF(cpf: string): boolean;
export declare function isValidPhone(phone: string): boolean;
export declare function isValidDate(date: string): boolean;
export declare function isValidTime(time: string): boolean;
export declare function sanitizeBody(req: Request, res: Response, next: NextFunction): void;
export declare function validateRequired(fields: string[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function validateLength(field: string, min: number, max: number): (req: Request, res: Response, next: NextFunction) => void;
export declare function validateFileType(allowedTypes: string[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function validateFileSize(maxSizeInMB: number): (req: Request, res: Response, next: NextFunction) => void;
export declare function escapeSQL(str: string): string;
export declare function isValidId(id: string): boolean;
export declare function validateId(paramName?: string): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validationMiddleware.d.ts.map
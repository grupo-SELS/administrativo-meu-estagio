import { Request, Response, NextFunction } from 'express';
import { URL } from 'url';
interface URLValidationResult {
    valid: boolean;
    error?: string;
    url?: URL;
}
export declare function validateExternalURL(urlString: string): URLValidationResult;
export declare function validateRequestURLs(fieldNames?: string[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function preventSSRF(req: Request, res: Response, next: NextFunction): void;
export declare function validateBeforeFetch(url: string): void;
export declare function addAllowedDomain(domain: string): void;
export declare function removeAllowedDomain(domain: string): void;
export declare function getAllowedDomains(): string[];
export {};
//# sourceMappingURL=ssrfMiddleware.d.ts.map
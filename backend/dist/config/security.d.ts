export declare const SecurityConfig: {
    password: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        maxAttempts: number;
        lockoutDuration: number;
    };
    session: {
        maxAge: number;
        refreshThreshold: number;
        secure: boolean;
        httpOnly: boolean;
        sameSite: "strict";
    };
    cors: {
        allowedOrigins: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
        maxAge: number;
    };
    upload: {
        maxFileSize: number;
        maxFiles: number;
        allowedMimeTypes: string[];
        allowedExtensions: string[];
        uploadPath: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
        standardDelay: number;
        delayAfter: number;
        delayMs: number;
    };
    csp: {
        directives: {
            defaultSrc: string[];
            scriptSrc: string[];
            styleSrc: string[];
            imgSrc: string[];
            connectSrc: string[];
            fontSrc: string[];
            objectSrc: string[];
            mediaSrc: string[];
            frameSrc: string[];
        };
    };
    securityHeaders: {
        'X-Content-Type-Options': string;
        'X-Frame-Options': string;
        'X-XSS-Protection': string;
        'Strict-Transport-Security': string;
        'Referrer-Policy': string;
        'Permissions-Policy': string;
    };
    logging: {
        level: string;
        logErrors: boolean;
        logRequests: boolean;
        maskSensitiveData: boolean;
        sensitiveFields: string[];
    };
    validation: {
        maxStringLength: number;
        maxArrayLength: number;
        maxObjectDepth: number;
        allowedSpecialChars: RegExp;
    };
    environment: {
        isDevelopment: boolean;
        isProduction: boolean;
        isTest: boolean;
    };
    backup: {
        enabled: boolean;
        frequency: number;
        retention: number;
    };
};
export declare function validateSecurityConfig(): {
    valid: boolean;
    errors: string[];
};
export declare function maskSensitiveData(data: any): any;
export default SecurityConfig;
//# sourceMappingURL=security.d.ts.map
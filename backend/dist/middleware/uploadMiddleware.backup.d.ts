import { Request, Response, NextFunction } from 'express';
export declare const uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function uploadToFirebaseStorage(files: Express.Multer.File[]): Promise<string[]>;
export declare function processUploads(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteFromFirebaseStorage(imageUrls: string[]): Promise<void>;
export declare function saveComunicadoToFirebaseStorage(comunicado: any): Promise<string>;
export declare function getComunicadosFromFirebaseStorage(): Promise<any[]>;
export declare function getComunicadoByIdFromFirebaseStorage(id: string): Promise<any | null>;
export declare function deleteComunicadoFromFirebaseStorage(id: string): Promise<void>;

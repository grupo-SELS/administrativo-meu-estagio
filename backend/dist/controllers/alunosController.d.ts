import { Request, Response } from 'express';
export declare class AlunosController {
    criar(req: Request, res: Response): Promise<void>;
    listar(req: Request, res: Response): Promise<void>;
    buscarPorId(req: Request, res: Response): Promise<void>;
    private validateCPFForUpdate;
    private processTags;
    private processImages;
    editar(req: Request, res: Response): Promise<void>;
    deletar(req: Request, res: Response): Promise<void>;
}
declare const _default: AlunosController;
export default _default;
//# sourceMappingURL=alunosController.d.ts.map
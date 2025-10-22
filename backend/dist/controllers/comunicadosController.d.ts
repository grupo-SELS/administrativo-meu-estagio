import { Request, Response } from 'express';
export declare class ComunicadosController {
    criar(req: Request, res: Response): Promise<void>;
    listar(req: Request, res: Response): Promise<void>;
    buscarPorId(req: Request, res: Response): Promise<void>;
    editar(req: Request, res: Response): Promise<void>;
    deletar(req: Request, res: Response): Promise<void>;
}
declare const _default: ComunicadosController;
export default _default;
//# sourceMappingURL=comunicadosController.d.ts.map
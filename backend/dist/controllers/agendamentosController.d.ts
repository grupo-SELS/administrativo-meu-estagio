import { Request, Response } from 'express';
export declare class AgendamentosController {
    criar(req: Request, res: Response): Promise<void>;
    listar(req: Request, res: Response): Promise<void>;
    buscarPorId(req: Request, res: Response): Promise<void>;
    buscarPorPeriodo(req: Request, res: Response): Promise<void>;
    editar(req: Request, res: Response): Promise<void>;
    deletar(req: Request, res: Response): Promise<void>;
}
declare const _default: AgendamentosController;
export default _default;
//# sourceMappingURL=agendamentosController.d.ts.map
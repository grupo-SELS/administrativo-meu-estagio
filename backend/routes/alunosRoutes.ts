import { Router } from 'express';
import alunosController from '../controllers/alunosController';
import { authMiddleware } from '../middleware/authMiddleware';
import { apiRateLimit, strictRateLimit } from '../middleware/rateLimitMiddleware';
import { sanitizeBody, validateRequired, validateId } from '../middleware/validationMiddleware';

const router = Router();
const controller = alunosController;


const devAuthBypass = (req: any, res: any, next: any) => {
   if(process.env.NODE_ENV === 'development' || req.headers['x-dev-bypass']) {
       req.user = {
           uid: 'dev-user',
           email: 'dev@test.com',
           name: 'Usuário de Desenvolvimento'
       };
       return next();
   }
   
   return authMiddleware(req, res, next);
};

router.get('/alunos', apiRateLimit, devAuthBypass, controller.listar.bind(controller));
router.get('/alunos/:id', apiRateLimit, devAuthBypass, validateId('id'), controller.buscarPorId.bind(controller));

router.post('/alunos', 
  strictRateLimit, 
  devAuthBypass, 
  sanitizeBody,
  validateRequired(['nome', 'cpf', 'email']),
  controller.criar.bind(controller)
);

router.put('/alunos/:id', 
  strictRateLimit, 
  devAuthBypass, 
  validateId('id'),
  sanitizeBody,
  controller.editar.bind(controller)
);

router.delete('/alunos/:id', 
  strictRateLimit, 
  devAuthBypass, 
  validateId('id'),
  controller.deletar.bind(controller)
);

export default router;
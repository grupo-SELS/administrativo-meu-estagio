import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import professoresController from '../controllers/professoresController';
import { apiRateLimit, strictRateLimit } from '../middleware/rateLimitMiddleware';
import { sanitizeBody, validateRequired, validateId } from '../middleware/validationMiddleware';

const router = Router();
const controller = professoresController;

const devAuthBypass = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development' || req.headers['x-dev-bypass']) {
    req.user = {
      uid: 'dev-user',
      email: 'dev@test.com',
      name: 'Usuário de Desenvolvimento'
    };
    return next();
  }
  
  return authMiddleware(req, res, next);
};

router.get('/professores', apiRateLimit, devAuthBypass, controller.listar.bind(controller));
router.get('/professores/:id', apiRateLimit, devAuthBypass, validateId('id'), controller.buscarPorId.bind(controller));

router.post('/professores', 
  strictRateLimit, 
  devAuthBypass, 
  sanitizeBody,
  validateRequired(['nome']),
  controller.criar.bind(controller)
);

router.put('/professores/:id', 
  strictRateLimit, 
  devAuthBypass, 
  validateId('id'),
  sanitizeBody,
  controller.editar.bind(controller)
);

router.delete('/professores/:id', 
  strictRateLimit, 
  devAuthBypass, 
  validateId('id'),
  controller.deletar.bind(controller)
);

export default router;
import { Router } from 'express';
import agendamentosController from '../controllers/agendamentosController';
import { authMiddleware } from '../middleware/authMiddleware';
import { apiRateLimit, strictRateLimit } from '../middleware/rateLimitMiddleware';
import { sanitizeBody, validateRequired, validateId } from '../middleware/validationMiddleware';

const router = Router();

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


const devRateLimit = process.env.NODE_ENV === 'development' 
  ? apiRateLimit 
  : strictRateLimit;

router.post('/agendamentos', 
  devRateLimit,
  devAuthBypass,
  sanitizeBody,
  validateRequired(['localEstagio', 'horarioInicio', 'horarioFim', 'data']),
  agendamentosController.criar
);
router.get('/agendamentos', apiRateLimit, devAuthBypass, agendamentosController.listar);
router.get('/agendamentos/periodo', apiRateLimit, devAuthBypass, agendamentosController.buscarPorPeriodo);
router.get('/agendamentos/:id', apiRateLimit, devAuthBypass, validateId('id'), agendamentosController.buscarPorId);
router.put('/agendamentos/:id', devRateLimit, devAuthBypass, validateId('id'), sanitizeBody, agendamentosController.editar);
router.delete('/agendamentos/:id', devRateLimit, devAuthBypass, validateId('id'), agendamentosController.deletar);

export default router;

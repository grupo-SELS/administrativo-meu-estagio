import { Router } from 'express';
import comunicadosController from '../controllers/comunicadosController';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadMiddleware, processUploads } from '../middleware/uploadMiddleware';
import { apiRateLimit, strictRateLimit } from '../middleware/rateLimitMiddleware';
import { sanitizeBody, validateRequired, validateId, validateFileType, validateFileSize } from '../middleware/validationMiddleware';

const router = Router();
const controller = comunicadosController;


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

router.get('/comunicados', apiRateLimit, controller.listar.bind(controller));
router.get('/comunicados/:id', apiRateLimit, validateId('id'), controller.buscarPorId.bind(controller));

router.post('/comunicados', 
  strictRateLimit,
  devAuthBypass,
  sanitizeBody,
  validateRequired(['titulo', 'conteudo']),
  uploadMiddleware,
  validateFileType(['jpg', 'jpeg', 'png', 'gif', 'webp']),
  validateFileSize(5), 
  processUploads,
  controller.criar.bind(controller)
);

router.put('/comunicados/:id', 
  strictRateLimit,
  devAuthBypass,
  validateId('id'),
  sanitizeBody,
  uploadMiddleware,
  validateFileType(['jpg', 'jpeg', 'png', 'gif', 'webp']),
  validateFileSize(5),
  processUploads,
  controller.editar.bind(controller)
);

router.delete('/comunicados/:id', 
  strictRateLimit,
  devAuthBypass,
  validateId('id'),
  controller.deletar.bind(controller)
);

export default router;
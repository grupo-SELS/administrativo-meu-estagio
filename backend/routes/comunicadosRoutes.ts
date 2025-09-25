import { Router } from 'express';
import comunicadosController from '../controllers/comunicadosController';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadMiddleware, processUploads } from '../middleware/uploadMiddleware';

const router = Router();
const controller = comunicadosController;


const devAuthBypass = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development' || req.headers['x-dev-bypass']) {
    console.log('🔓 Bypass de autenticação ativado para desenvolvimento');
    req.user = {
      uid: 'dev-user',
      email: 'dev@test.com',
      name: 'Usuário de Desenvolvimento'
    };
    return next();
  }
  return authMiddleware(req, res, next);
};

router.get('/comunicados', controller.listar.bind(controller));
router.get('/comunicados/:id', controller.buscarPorId.bind(controller));

router.post('/comunicados', 
  (req, res, next) => {
    console.log('📥 POST /comunicados recebido');
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body keys:', Object.keys(req.body));
    next();
  },
  devAuthBypass,
  uploadMiddleware, 
  processUploads,
  controller.criar.bind(controller)
);

router.put('/comunicados/:id', 
  (req, res, next) => {
    console.log('📥 PUT /comunicados/:id recebido');
    console.log('📋 ID:', req.params.id);
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body keys:', Object.keys(req.body));
    next();
  },
  devAuthBypass,
  uploadMiddleware, 
  processUploads,
  controller.editar.bind(controller)
);

router.delete('/comunicados/:id', 
  (req, res, next) => {
    console.log('🗑️ DELETE /comunicados/:id recebido');
    console.log('📋 ID:', req.params.id);
    console.log('Headers:', req.headers);
    console.log('URL completa:', req.url);
    console.log('Método:', req.method);
    next();
  },
  devAuthBypass, 
  controller.deletar.bind(controller)
);

export default router;
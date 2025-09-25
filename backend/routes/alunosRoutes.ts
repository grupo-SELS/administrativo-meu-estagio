import { Router } from 'express';
import alunosController from '../controllers/alunosController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const controller = alunosController;



/* const devAuthBypass = (req: any, res: any, next: any) => {
   if(process.env.NODE_ENV === 'development' || req.headers['x-dev-bypass']) {
       console.log('Bypass de autenticação ativado para desenvolvimento');
       req.user = {
           uid: 'dev-user',
           email: 'dev@test.com',
           name: 'Usuário de Desenvolvimento'
       };
       return next();
   }
   return authMiddleware(req, res, next);
// }; */

router.get('/alunos', authMiddleware, controller.listar.bind(controller));
router.get('/alunos/:id', authMiddleware, controller.buscarPorId.bind(controller));

router.post('/alunos', authMiddleware,
  (req, res, next) => {
    console.log('📥 POST /alunos recebido');
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body keys:', Object.keys(req.body));
    next();
  },
  controller.criar.bind(controller)
);

router.put('/alunos/:id', authMiddleware,
  (req, res, next) => {
    console.log('📥 PUT /alunos/:id recebido');
    console.log('📋 ID:', req.params.id);
    console.log('Headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Body keys:', Object.keys(req.body));
    next();
  },
  controller.editar.bind(controller)
);

router.delete('/alunos/:id', authMiddleware,
  (req, res, next) => {
    console.log('🗑️ DELETE /alunos/:id recebido');
    console.log('📋 ID:', req.params.id);
    console.log('Headers:', req.headers);
    console.log('URL completa:', req.url);
    console.log('Método:', req.method);
    next();
  },
  controller.deletar.bind(controller)
);

export default router;
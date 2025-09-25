import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

// Estender a interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ 
        error: 'Token de autorização não fornecido',
        code: 'NO_TOKEN'
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        error: 'Formato de token inválido. Use: Bearer <token>',
        code: 'INVALID_FORMAT'
      });
      return;
    }

    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = decodedToken;
      
      console.log(`🔐 Usuário autenticado: ${decodedToken.email || decodedToken.uid}`);
      next();
    } catch (verifyError: any) {
      console.error('Erro na verificação do token:', verifyError.code);
      
      let errorMessage = 'Token inválido';
      if (verifyError.code === 'auth/id-token-expired') {
        errorMessage = 'Token expirado';
      } else if (verifyError.code === 'auth/id-token-revoked') {
        errorMessage = 'Token revogado';
      }
      
      res.status(401).json({ 
        error: errorMessage,
        code: verifyError.code
      });
      return;
    }
  } catch (error: any) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
    return;
  }
}

// Middleware para verificar se usuário é admin (opcional)
export async function adminMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    // Verificar se usuário tem custom claims de admin
    const userRecord = await auth.getUser(req.user.uid);
    const customClaims = userRecord.customClaims;
    
    if (!customClaims?.admin) {
      res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores podem realizar esta ação.',
        code: 'ADMIN_REQUIRED'
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error('Erro no middleware de admin:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
    return;
  }
}
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, 
    files: 5 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

export const uploadMiddleware = upload.array('imagens', 5);

export const processUploads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    const uploadError = req.body.uploadError;
    
    console.log(`📤 processUploads - ${files ? files.length : 0} arquivos recebidos`);
    
    if (uploadError) {
      console.log(`⚠️ Upload Error detectado: ${uploadError}`);
      req.body.imagens = [];
      return next();
    }
    
    if (!files || files.length === 0) {
      console.log('📷 Nenhum arquivo para processar');
      req.body.imagens = [];
      return next();
    }
    
    console.log('🔄 Processando arquivos recebidos pelo upload');
    req.body.imagens = [`/notifications/comunicados/imagem-placeholder.jpg`]; 
    
    next();
  } catch (error: any) {
    console.error('❌ Erro no processamento de uploads:', error);
    req.body.uploadError = error.message;
    req.body.imagens = [];
    next(); 
  }
};
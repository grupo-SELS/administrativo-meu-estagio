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
    
    if (uploadError) {
      
      req.body.imagens = [];
      return next();
    }
    
    if (!files || files.length === 0) {
      req.body.imagens = [];
      return next();
    }
    
    
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');
    
    // Se estiver rodando do dist, vai para ../../public/uploads, senão ../public/uploads
    const uploadDir = __dirname.includes('dist') 
      ? path.join(__dirname, '../../public/uploads')
      : path.join(__dirname, '../public/uploads');
    
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const imagePaths: string[] = [];
    
    for (const file of files) {
      
      const randomName = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(file.originalname);
      const filename = `img_${Date.now()}_${randomName}${ext}`;
      const filePath = path.join(uploadDir, filename);
      
      
      fs.writeFileSync(filePath, file.buffer);
      
      
      imagePaths.push(`/uploads/${filename}`);
    }
    
    req.body.imagens = imagePaths;
    
    next();
  } catch (error: any) {
    console.error('❌ Erro no processamento de uploads:', error);
    req.body.uploadError = error.message;
    req.body.imagens = [];
    next(); 
  }
};
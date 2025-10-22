import { Request, Response, NextFunction } from 'express';


export function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/[<>]/g, '') 
    .replace(/javascript:/gi, '') 
    .replace(/on\w+=/gi, '') 
    .trim();
}


export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}


export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false; 
  

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}


export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 11;
}


export function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}


export function isValidTime(time: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}


export function sanitizeBody(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  next();
}


export function validateRequired(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];
    
    fields.forEach(field => {
      if (!req.body[field] || (typeof req.body[field] === 'string' && !req.body[field].trim())) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Campos obrigatórios ausentes',
        missingFields
      });
      return;
    }
    
    next();
  };
}


export function validateLength(field: string, min: number, max: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.body[field];
    
    if (typeof value === 'string') {
      if (value.length < min || value.length > max) {
        res.status(400).json({
          error: `Campo ${field} deve ter entre ${min} e ${max} caracteres`,
          field,
          currentLength: value.length
        });
        return;
      }
    }
    
    next();
  };
}


export function validateFileType(allowedTypes: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const files = req.files as Express.Multer.File[] | undefined;
    
    if (files && files.length > 0) {
      const invalidFiles = files.filter(file => {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        return !ext || !allowedTypes.includes(ext);
      });
      
      if (invalidFiles.length > 0) {
        res.status(400).json({
          error: 'Tipo de arquivo não permitido',
          allowedTypes,
          invalidFiles: invalidFiles.map(f => f.originalname)
        });
        return;
      }
    }
    
    next();
  };
}


export function validateFileSize(maxSizeInMB: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const files = req.files as Express.Multer.File[] | undefined;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    if (files && files.length > 0) {
      const oversizedFiles = files.filter(file => file.size > maxSizeInBytes);
      
      if (oversizedFiles.length > 0) {
        res.status(400).json({
          error: `Arquivo excede o tamanho máximo de ${maxSizeInMB}MB`,
          maxSize: maxSizeInMB,
          oversizedFiles: oversizedFiles.map(f => ({
            name: f.originalname,
            size: `${(f.size / 1024 / 1024).toFixed(2)}MB`
          }))
        });
        return;
      }
    }
    
    next();
  };
}


export function escapeSQL(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/['";\\]/g, '\\$&');
}


export function isValidId(id: string): boolean {

  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 100;
}

export function validateId(paramName: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    
    if (!id || !isValidId(id)) {
      res.status(400).json({
        error: 'ID inválido',
        param: paramName
      });
      return;
    }
    
    next();
  };
}

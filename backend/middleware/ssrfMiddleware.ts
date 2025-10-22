import { Request, Response, NextFunction } from 'express';
import { URL } from 'url';


const ALLOWED_DOMAINS = [
  'firebasestorage.googleapis.com',
  'googleapis.com',
  'api.exemplo.com' 
];


const PRIVATE_IP_RANGES = [
  /^10\./,                   
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, 
  /^192\.168\./,              
  /^127\./,                   
  /^169\.254\./,              
  /^::1$/,                    
  /^fe80:/,                   
  /^fc00:/,                   
  /^fd00:/                   
];


const ALLOWED_PROTOCOLS = ['http:', 'https:'];


interface URLValidationResult {
  valid: boolean;
  error?: string;
  url?: URL;
}


export function validateExternalURL(urlString: string): URLValidationResult {
  try {

    const url = new URL(urlString);


    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return {
        valid: false,
        error: `Protocolo não permitido: ${url.protocol}. Apenas HTTP e HTTPS são permitidos.`
      };
    }


    const hostname = url.hostname.toLowerCase();
    for (const range of PRIVATE_IP_RANGES) {
      if (range.test(hostname)) {
        return {
          valid: false,
          error: 'Requisições para endereços de rede privada não são permitidas.'
        };
      }
    }


    if (hostname === 'localhost' || hostname === '0.0.0.0') {
      return {
        valid: false,
        error: 'Requisições para localhost não são permitidas.'
      };
    }


    const isAllowed = ALLOWED_DOMAINS.some(domain => {
      return hostname === domain || hostname.endsWith('.' + domain);
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `Domínio não autorizado: ${hostname}. Apenas domínios pré-aprovados são permitidos.`
      };
    }


    if (urlString.includes('@') && !urlString.includes('mailto:')) {
      return {
        valid: false,
        error: 'URL contém caracteres suspeitos.'
      };
    }


    return {
      valid: true,
      url
    };
  } catch (error) {
    return {
      valid: false,
      error: 'URL inválida ou malformada.'
    };
  }
}


export function validateRequestURLs(fieldNames: string[] = ['url', 'link', 'href', 'image', 'avatar']) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToCheck = { ...req.body, ...req.query };

    for (const fieldName of fieldNames) {
      const urlValue = dataToCheck[fieldName];
      
      if (urlValue && typeof urlValue === 'string') {

        if (urlValue.startsWith('http://') || urlValue.startsWith('https://')) {
          const validation = validateExternalURL(urlValue);
          
          if (!validation.valid) {
            res.status(400).json({
              error: 'URL inválida',
              message: validation.error,
              field: fieldName
            });
            return;
          }
        }
      }
    }

    next();
  };
}


export function preventSSRF(req: Request, res: Response, next: NextFunction): void {

  const urlFields = ['url', 'link', 'href', 'image', 'avatar', 'callback', 'redirect', 'webhook'];
  const dataToCheck = { ...req.body, ...req.query, ...req.params };

  for (const field of urlFields) {
    const value = dataToCheck[field];
    
    if (value && typeof value === 'string') {

      const urlPattern = /^https?:\/\//i;
      const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
      
      if (urlPattern.test(value) || ipPattern.test(value)) {
        const validation = validateExternalURL(value);
        
        if (!validation.valid) {
          console.error(`[SSRF] Tentativa bloqueada: ${value} | IP: ${req.ip} | User: ${(req as any).user?.email || 'anonymous'}`);
          
          res.status(400).json({
            error: 'Requisição bloqueada',
            message: 'A URL fornecida não passou na validação de segurança.',
            details: validation.error
          });
          return;
        }
      }
    }
  }

  next();
}


export function validateBeforeFetch(url: string): void {
  const validation = validateExternalURL(url);
  
  if (!validation.valid) {
    throw new Error(`SSRF Protection: ${validation.error}`);
  }
}


export function addAllowedDomain(domain: string): void {
  if (!ALLOWED_DOMAINS.includes(domain)) {
    ALLOWED_DOMAINS.push(domain);
    console.error(`[SSRF] Novo domínio permitido adicionado: ${domain}`);
  }
}


export function removeAllowedDomain(domain: string): void {
  const index = ALLOWED_DOMAINS.indexOf(domain);
  if (index > -1) {
    ALLOWED_DOMAINS.splice(index, 1);
    console.error(`[SSRF] Domínio removido da lista de permitidos: ${domain}`);
  }
}


export function getAllowedDomains(): string[] {
  return [...ALLOWED_DOMAINS];
}

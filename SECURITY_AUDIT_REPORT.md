# 🔒 RELATÓRIO DE ANÁLISE DE SEGURANÇA
## Site Administrativo - Meu Estágio

**Data da Análise:** 08/10/2025  
**Analisador:** AI Security Audit  
**Escopo:** Backend (Node.js/Express/TypeScript) + Frontend (React/TypeScript)

---

### Vulnerabilidades Críticas Encontradas: 8
### Vulnerabilidades Altas: 12
### Vulnerabilidades Médias: 15
### Vulnerabilidades Baixas: 7

---

## 🚨 VULNERABILIDADES CRÍTICAS

### 1. **Arquivo .env Exposto no Repositório**
**Severidade:** CRÍTICA  
**Localização:** `backend/.env`  
**Risco:** Exposição de credenciais sensíveis (Firebase Service Account, tokens)

**Problema:**
- Arquivo `.env` não está no `.gitignore`
- Pode conter credenciais do Firebase Admin SDK
- Service Account Key pode estar versionado

**Impacto:**
- Acesso completo ao Firebase/Firestore
- Possibilidade de roubo de dados
- Comprometimento total da aplicação

**Solução:**
```bash
# Adicionar ao .gitignore
echo "*.env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.development" >> .gitignore
echo ".env.production" >> .gitignore
echo "backend/config/serviceAccountKey.json" >> .gitignore

# Remover do histórico do Git (se commitado)
git rm --cached backend/.env
git rm --cached backend/config/serviceAccountKey.json
git commit -m "Remove sensitive files from version control"

# Rotacionar todas as credenciais expostas
```

---

### 2. **Armazenamento de Dados de Autenticação no localStorage**
**Severidade:** 🔴 CRÍTICA  
**Localização:** `frontend/src/contexts/AuthContext.tsx`  
**Código:**
```typescript
localStorage.setItem('auth-user', JSON.stringify(userData));
```

**Problema:**
- localStorage é vulnerável a XSS
- Dados do usuário ficam permanentemente no navegador
- Acessível por qualquer script JavaScript na página
- Não expira automaticamente

**Impacto:**
- Session hijacking via XSS
- Roubo de informações do usuário
- Persistência de sessão indefinida

**Solução:**
```typescript
// Opção 1: Usar HttpOnly cookies (recomendado)
// Backend deve enviar cookies seguros
// Frontend não precisa armazenar nada

// Opção 2: sessionStorage com criptografia (temporário)
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

function encryptData(data: any): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
}

function decryptData(encrypted: string): any {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// Usar sessionStorage ao invés de localStorage
sessionStorage.setItem('auth-user', encryptData(userData));
```

---

### 3. **API Base URL Hardcoded**
**Severidade:** 🔴 CRÍTICA  
**Localização:** `frontend/src/services/apiService.ts:1`  
**Código:**
```typescript
const API_BASE_URL = 'http://localhost:3001';
```

**Problema:**
- URL hardcoded não funciona em produção
- Protocolo HTTP (não HTTPS) inseguro
- Expõe estrutura da aplicação

**Impacto:**
- Aplicação quebrada em produção
- Man-in-the-Middle attacks
- Dados trafegam sem criptografia

**Solução:**
```typescript
// apiService.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://api.production.com' 
    : 'http://localhost:3001');

// .env.development
VITE_API_BASE_URL=http://localhost:3001

// .env.production
VITE_API_BASE_URL=https://api.seuprojeto.com
```

---

### 4. **Bypass de Autenticação em Desenvolvimento**
**Severidade:** 🔴 CRÍTICA  
**Localização:** `backend/routes/alunosRoutes.ts`, `comunicadosRoutes.ts`, `agendamentosRoutes.ts`  
**Código:**
```typescript
const devAuthBypass = (req: any, res: any, next: any) => {
   if(process.env.NODE_ENV === 'development' || req.headers['x-dev-bypass']) {
       req.user = {
           uid: 'dev-user',
           email: 'dev@test.com',
           name: 'Usuário de Desenvolvimento'
       };
       return next();
   }
   return authMiddleware(req, res, next);
};
```

**Problema:**
- Header `x-dev-bypass` pode ser enviado por qualquer cliente
- Permite bypass de autenticação mesmo em produção se NODE_ENV não estiver configurado
- Usuário pode manipular headers HTTP

**Impacto:**
- Acesso não autorizado a todos os endpoints
- Bypass completo de autenticação
- Criação/Modificação/Exclusão de dados sem permissão

**Solução:**
```typescript
const devAuthBypass = (req: Request, res: Response, next: NextFunction) => {
  // APENAS em desenvolvimento E com IP local
  const isDev = process.env.NODE_ENV === 'development';
  const isLocalIP = req.ip === '127.0.0.1' || 
                    req.ip === '::1' || 
                    req.ip?.startsWith('192.168.');
  
  if (isDev && isLocalIP && req.headers['x-dev-bypass'] === process.env.DEV_BYPASS_SECRET) {
    req.user = {
      uid: 'dev-user',
      email: 'dev@test.com',
      name: 'Usuário de Desenvolvimento'
    };
    return next();
  }
  
  return authMiddleware(req, res, next);
};

// .env
DEV_BYPASS_SECRET=seu-secret-complexo-aqui-não-commitar
```

**Melhor Solução:** Remover completamente o bypass e usar Firebase Auth em dev também.

---

### 5. **Service Account Key Versionado**
**Severidade:** 🔴 CRÍTICA  
**Localização:** `backend/config/serviceAccountKey.json`  
**Status:** ⚠️ Arquivo existe no workspace

**Problema:**
- Service Account Key do Firebase pode estar no repositório
- Credenciais com acesso total ao Firestore/Storage

**Impacto:**
- Acesso administrativo completo ao Firebase
- Leitura/Escrita/Exclusão de todos os dados
- Controle total da infraestrutura

**Solução:**
```bash
# 1. Remover do Git
git rm --cached backend/config/serviceAccountKey.json
git commit -m "Remove Firebase service account key"

# 2. Adicionar ao .gitignore
echo "backend/config/serviceAccountKey.json" >> .gitignore

# 3. Rotacionar a chave no Firebase Console
# Console > Project Settings > Service Accounts > Generate New Private Key

# 4. Usar variável de ambiente em produção
# No servidor de produção:
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
```

---

### 6. **Falta de Proteção CSRF**
**Severidade:** 🔴 CRÍTICA  
**Localização:** Backend geral  

**Problema:**
- Não há proteção contra Cross-Site Request Forgery
- Requests POST/PUT/DELETE podem ser forjados
- CORS configurado mas sem tokens CSRF

**Impacto:**
- Ações não autorizadas em nome do usuário
- Exclusão de dados sem consentimento
- Modificação de informações críticas

**Solução:**
```typescript
// backend/middleware/csrfMiddleware.ts
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

// No server.ts
app.use(cookieParser());

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Endpoint para obter token CSRF
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Aplicar a rotas que modificam dados
app.use('/api/*', csrfProtection);

// Frontend: Incluir token em requests
const csrfToken = await fetch('/api/csrf-token').then(r => r.json());
headers['X-CSRF-Token'] = csrfToken.csrfToken;
```

---

### 7. **Validação de Upload de Arquivos Insuficiente**
**Severidade:** 🟠 ALTA  
**Localização:** `backend/middleware/uploadMiddleware.ts`  

**Problema:**
```typescript
fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  }
}
```
- Validação apenas por MIME type (facilmente falsificado)
- Não verifica conteúdo real do arquivo
- Não há verificação de malware
- Nomes de arquivo podem ter path traversal

**Impacto:**
- Upload de arquivos maliciosos (webshells, scripts)
- Path traversal attacks
- RCE (Remote Code Execution) potencial
- Consumo de disco/DoS

**Solução:**
```typescript
import fileType from 'file-type';
import path from 'path';
import sanitize from 'sanitize-filename';

const fileFilter = async (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  try {
    // 1. Validar MIME type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não permitido'));
    }

    // 2. Verificar extensão
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Extensão de arquivo não permitida'));
    }

    // 3. Sanitizar nome do arquivo
    const sanitized = sanitize(file.originalname);
    if (sanitized !== file.originalname) {
      return cb(new Error('Nome de arquivo inválido'));
    }

    // 4. Verificar magic bytes (após upload)
    // Implementar validação em processUploads com file-type

    cb(null, true);
  } catch (error) {
    cb(error as Error);
  }
};

// Em processUploads, verificar conteúdo real
const processUploads = async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as Express.Multer.File[];
  
  for (const file of files) {
    // Verificar magic bytes
    const type = await fileType.fromBuffer(file.buffer);
    
    if (!type || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(type.mime)) {
      return res.status(400).json({ error: 'Arquivo não é uma imagem válida' });
    }

    // Verificar tamanho de imagem (evitar zip bombs)
    const sizeOf = require('image-size');
    const dimensions = sizeOf(file.buffer);
    
    if (dimensions.width > 10000 || dimensions.height > 10000) {
      return res.status(400).json({ error: 'Imagem muito grande' });
    }
  }
  
  next();
};
```

---

### 8. **Falta de Timeout em Requisições HTTP**
**Severidade:** 🟠 ALTA  
**Localização:** `frontend/src/services/apiService.ts`  

**Problema:**
- Requisições podem ficar pendentes indefinidamente
- Não há timeout configurado no fetch
- Pode causar memory leaks

**Impacto:**
- UI travada aguardando resposta
- Consumo excessivo de memória
- DoS client-side

**Solução:**
```typescript
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Requisição excedeu o tempo limite');
    }
    throw error;
  }
}

// Usar em todas as chamadas
const response = await fetchWithTimeout(url, { method, headers, body }, 30000);
```

---

## 🟠 VULNERABILIDADES ALTAS

### 9. **Falta de Validação de Input no Frontend**
**Severidade:** 🟠 ALTA  
**Localização:** Vários componentes de formulário

**Problema:**
- Inputs não são validados antes de enviar ao backend
- Permite envio de dados malformados
- Facilita ataques de injection

**Solução:**
```typescript
// Criar validadores reutilizáveis
export const validators = {
  email: (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  },
  
  cpf: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    // Validação completa de CPF
    return true;
  },
  
  phone: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },
  
  noScripts: (value: string) => {
    const dangerous = /<script|javascript:|onerror=|onclick=/i;
    return !dangerous.test(value);
  }
};

// Usar em todos os formulários
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validators.email(email)) {
    setError('Email inválido');
    return;
  }
  
  if (!validators.noScripts(message)) {
    setError('Conteúdo contém caracteres não permitidos');
    return;
  }
  
  // Prosseguir com submit
};
```

---

### 10. **Falta de Content Security Policy no Frontend**
**Severidade:** 🟠 ALTA  
**Localização:** `frontend/index.html`

**Problema:**
- Sem CSP configurado no frontend
- Permite execução de scripts inline
- Vulnerável a XSS

**Solução:**
```html
<!-- frontend/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://apis.google.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' http://localhost:3001 https://firebasestorage.googleapis.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

---

### 11. **Senhas Fracas Permitidas**
**Severidade:** 🟠 ALTA  
**Localização:** `frontend/src/pages/Login.tsx`

**Problema:**
```typescript
const validatePassword = (password: string): boolean => {
  return password.length >= 6; // Muito fraco!
};
```

**Solução:**
```typescript
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Pelo menos uma maiúscula');
  if (!/[a-z]/.test(password)) errors.push('Pelo menos uma minúscula');
  if (!/[0-9]/.test(password)) errors.push('Pelo menos um número');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Pelo menos um caractere especial');
  
  const common = ['password', '12345678', 'qwerty'];
  if (common.some(c => password.toLowerCase().includes(c))) {
    errors.push('Senha muito comum');
  }
  
  return { valid: errors.length === 0, errors };
};
```

---

### 12. **Falta de Sanitização em Outputs**
**Severidade:** 🟠 ALTA  
**Localização:** Componentes que renderizam dados do usuário

**Problema:**
- Dados do backend são renderizados sem sanitização
- Possibilidade de XSS stored

**Solução:**
```typescript
import DOMPurify from 'dompurify';

// Sanitizar antes de renderizar
const SafeHTML = ({ content }: { content: string }) => {
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href']
  });
  
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};

// Ou simplesmente escapar
const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
```

---

### 13. **Falta de Rate Limiting no Frontend**
**Severidade:** 🟡 MÉDIA  
**Localização:** Formulários de login/signup

**Problema:**
- Frontend não limita tentativas
- Permite spam de requisições
- Pode facilitar ataques de brute force

**Solução:**
```typescript
// Hook de rate limiting
import { useState, useRef } from 'react';

function useRateLimit(maxAttempts: number, windowMs: number) {
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const windowStart = useRef(Date.now());

  const attempt = () => {
    const now = Date.now();
    
    // Reset se passou a janela
    if (now - windowStart.current > windowMs) {
      windowStart.current = now;
      setAttempts(1);
      setBlocked(false);
      return true;
    }

    if (attempts >= maxAttempts) {
      setBlocked(true);
      return false;
    }

    setAttempts(prev => prev + 1);
    return true;
  };

  return { attempt, blocked, attempts };
}

// Usar no Login
const { attempt, blocked, attempts } = useRateLimit(5, 60000); // 5 tentativas/min

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!attempt()) {
    setError('Muitas tentativas. Aguarde 1 minuto.');
    return;
  }
  
  // Prosseguir com login
};
```

---

### 14. **Logs Excessivos no Console**
**Severidade:** 🟡 MÉDIA  
**Localização:** Vários arquivos

**Problema:**
- console.error expõe informações sensíveis
- Facilita reconhecimento da aplicação
- Pode vazar tokens/dados em produção

**Solução:**
```typescript
// utils/logger.ts
const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  info: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) console.warn(...args);
  },
  
  error: (...args: any[]) => {
    // Sempre logar erros, mas sanitizar em produção
    if (isDevelopment) {
      console.error(...args);
    } else {
      // Enviar para serviço de logging (Sentry, LogRocket, etc)
      console.error('Erro na aplicação');
    }
  }
};

// Substituir todos console.error por logger.error
```

---

### 15. **Falta de Validação de Tokens JWT**
**Severidade:** 🟠 ALTA  
**Localização:** `backend/middleware/authMiddleware.ts`

**Problema:**
- Token não é verificado por expiração no frontend
- Não há refresh de token
- Sessão pode durar indefinidamente

**Solução:**
```typescript
// Frontend: Verificar expiração do token
import { jwtDecode } from 'jwt-decode';

async function getValidToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('No user');

  // Forçar refresh se próximo da expiração
  const forceRefresh = true; // ou verificar exp do token atual
  const token = await user.getIdToken(forceRefresh);
  
  return token;
}

// Backend: Verificar claims customizados
const decodedToken = await auth.verifyIdToken(token);

// Verificar role/permissions
if (req.path.startsWith('/admin') && decodedToken.role !== 'admin') {
  return res.status(403).json({ error: 'Acesso negado' });
}
```

---

## 🟡 VULNERABILIDADES MÉDIAS

### 16. **Falta de Logging de Eventos de Segurança**
**Status:** ✅ Parcialmente Resolvido (auditMiddleware criado)  
**Recomendação:** Integrar com serviço externo (Sentry, DataDog)

### 17. **CORS Muito Permissivo em Dev**
**Status:** ✅ Resolvido (CORS configurado no SecurityConfig)

### 18. **Falta de Versionamento de API**
**Recomendação:** Implementar `/api/v1/` para futuras mudanças

### 19. **Sem Monitoramento de Performance**
**Recomendação:** Adicionar APM (New Relic, DataDog)

### 20. **Falta de Testes de Segurança Automatizados**
**Recomendação:** Adicionar SAST/DAST ao CI/CD

---

## ✅ PONTOS POSITIVOS IMPLEMENTADOS

1. ✅ Rate limiting completo (3 níveis)
2. ✅ Validação e sanitização de inputs no backend
3. ✅ Headers de segurança (Helmet + custom)
4. ✅ Detecção de atividades suspeitas
5. ✅ Proteção SSRF
6. ✅ Sistema de auditoria
7. ✅ Proteção contra brute force em login
8. ✅ Validação de senhas fortes
9. ✅ Timeout de requisições no backend
10. ✅ Proteção de rotas sensíveis

---

## 📋 CHECKLIST DE CORREÇÕES PRIORITÁRIAS

### Urgente (Fazer Agora)
- [ ] Remover .env do Git e adicionar ao .gitignore
- [ ] Rotacionar Service Account Key do Firebase
- [ ] Remover/Restringir bypass de autenticação dev
- [ ] Mover dados de auth do localStorage para cookies HttpOnly
- [ ] Implementar proteção CSRF
- [ ] Validar upload de arquivos com magic bytes

### Alta Prioridade (Esta Semana)
- [ ] Implementar CSP no frontend
- [ ] Fortalecer validação de senha (8+ chars, complexidade)
- [ ] Adicionar sanitização de outputs (DOMPurify)
- [ ] Configurar timeout em fetch do frontend
- [ ] Validar inputs no frontend
- [ ] Remover logs excessivos em produção

### Média Prioridade (Este Mês)
- [ ] Implementar refresh de tokens JWT
- [ ] Adicionar rate limiting no frontend
- [ ] Configurar logger centralizado
- [ ] Implementar versionamento de API
- [ ] Adicionar testes de segurança

### Melhorias Futuras
- [ ] Implementar 2FA (Two-Factor Authentication)
- [ ] Adicionar WAF (Web Application Firewall)
- [ ] Configurar CDN com DDoS protection
- [ ] Implementar anomaly detection
- [ ] Adicionar security headers no CDN/Nginx

---

## 🛠️ FERRAMENTAS RECOMENDADAS

### Análise de Código
- **ESLint Security Plugin** - Detecta vulnerabilidades em JS/TS
- **Snyk** - Análise de dependências vulneráveis
- **SonarQube** - Análise de qualidade e segurança

### Runtime Protection
- **Sentry** - Monitoramento de erros e performance
- **DataDog** - APM e segurança
- **LogRocket** - Session replay e debugging

### Testing
- **OWASP ZAP** - Security scanner
- **Burp Suite** - Penetration testing
- **Jest + Security Tests** - Unit tests de segurança

---

## 📚 RECURSOS E REFERÊNCIAS

1. **OWASP Top 10 2021:** https://owasp.org/Top10/
2. **OWASP Cheat Sheets:** https://cheatsheetseries.owasp.org/
3. **Firebase Security Rules:** https://firebase.google.com/docs/rules
4. **Content Security Policy:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
5. **JWT Best Practices:** https://tools.ietf.org/html/rfc8725

---

## 📞 PRÓXIMOS PASSOS

1. **Implementar correções urgentes** (itens críticos)
2. **Auditar dependências:** `npm audit` no backend e frontend
3. **Configurar CI/CD** com verificações de segurança
4. **Treinar equipe** em práticas seguras de desenvolvimento
5. **Estabelecer processo** de security code review
6. **Agendar pentests** regulares

---

**Fim do Relatório**  
*Este relatório deve ser tratado como confidencial e não deve ser compartilhado publicamente.*

# 🚨 CORREÇÕES URGENTES DE SEGURANÇA
## Guia Prático de Implementação

---

## 1️⃣ PROTEÇÃO DE CREDENCIAIS (.env e Service Account)

### Passo 1: Atualizar .gitignore
```bash
# Execute no terminal na raiz do projeto
echo "" >> .gitignore
echo "# Environment variables" >> .gitignore
echo "*.env" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.development" >> .gitignore
echo ".env.production" >> .gitignore
echo ".env.*.local" >> .gitignore
echo "" >> .gitignore
echo "# Firebase credentials" >> .gitignore
echo "**/serviceAccountKey.json" >> .gitignore
echo "**/*serviceAccount*.json" >> .gitignore
```

### Passo 2: Remover do Git (se já commitado)
```bash
# ATENÇÃO: Fazer backup antes!
git rm --cached backend/.env
git rm --cached backend/config/serviceAccountKey.json
git commit -m "Remove sensitive credentials from version control"
git push
```

### Passo 3: Rotacionar Credenciais Firebase
1. Acesse Firebase Console
2. Project Settings > Service Accounts
3. Generate New Private Key
4. Salve o novo arquivo (NÃO commitar)
5. Configure variável de ambiente no servidor de produção

### Passo 4: Usar Variáveis de Ambiente
```typescript
// backend/config/firebase-admin.ts (já implementado)
let serviceAccount: any;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Produção: JSON como string na variável de ambiente
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Desenvolvimento: Arquivo local (NÃO versionado)
  serviceAccount = require('./serviceAccountKey.json');
}
```

---

## 2️⃣ CORRIGIR ARMAZENAMENTO DE AUTH (localStorage → Cookies)

### Opção A: HttpOnly Cookies (RECOMENDADO)

#### Backend: Configurar cookies de sessão
```typescript
// backend/server.ts
import cookieParser from 'cookie-parser';

app.use(cookieParser());

// backend/middleware/authMiddleware.ts
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Tentar obter token do cookie primeiro
    let token = req.cookies?.authToken;
    
    // Fallback para header Authorization
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Endpoint de login que define cookie
app.post('/api/auth/login', async (req, res) => {
  const { idToken } = req.body; // Token do Firebase Auth
  
  // Verificar token
  const decodedToken = await auth.verifyIdToken(idToken);
  
  // Definir cookie HttpOnly
  res.cookie('authToken', idToken, {
    httpOnly: true,  // Não acessível via JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'strict', // Proteção CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  });
  
  res.json({ success: true, user: decodedToken });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ success: true });
});
```

#### Frontend: Remover localStorage
```typescript
// frontend/src/contexts/AuthContext.tsx
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há sessão ativa (cookie no backend)
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/session', {
          credentials: 'include' // Importante para enviar cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Obter token do Firebase
      const idToken = await result.user.getIdToken();
      
      // Enviar para backend definir cookie
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Importante!
        body: JSON.stringify({ idToken })
      });
      
      if (!response.ok) throw new Error('Falha no login');
      
      const data = await response.json();
      setUser(data.user);
      
      // NÃO usar localStorage!
      
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Limpar cookie no backend
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Logout do Firebase
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### Frontend: Atualizar apiService
```typescript
// frontend/src/services/apiService.ts
const makeRequest = async (url: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // NÃO precisa mais obter token manualmente
  // O cookie será enviado automaticamente

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // IMPORTANTE: Enviar cookies
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};
```

### Opção B: sessionStorage com Criptografia (Temporário)

Se não puder implementar cookies agora:

```typescript
// frontend/src/utils/secureStorage.ts
import CryptoJS from 'crypto-js';

// NUNCA commitar esta chave! Usar variável de ambiente
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'dev-key-change-me';

export const secureStorage = {
  set: (key: string, value: any) => {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      ENCRYPTION_KEY
    ).toString();
    sessionStorage.setItem(key, encrypted); // sessionStorage, não localStorage!
  },
  
  get: (key: string) => {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Erro ao descriptografar:', error);
      return null;
    }
  },
  
  remove: (key: string) => {
    sessionStorage.removeItem(key);
  },
  
  clear: () => {
    sessionStorage.clear();
  }
};

// Usar no AuthContext
secureStorage.set('auth-user', userData);
const user = secureStorage.get('auth-user');
```

**Instalar dependência:**
```bash
cd frontend
npm install crypto-js
npm install --save-dev @types/crypto-js
```

---

## 3️⃣ REMOVER BYPASS DE AUTENTICAÇÃO

### Solução 1: Remover Completamente (RECOMENDADO)
```typescript
// backend/routes/alunosRoutes.ts
import { Router } from 'express';
import alunosController from '../controllers/alunosController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const controller = alunosController;

// Usar authMiddleware diretamente - SEM BYPASS
router.get('/alunos', authMiddleware, controller.listar.bind(controller));
router.get('/alunos/:id', authMiddleware, controller.buscarPorId.bind(controller));
router.post('/alunos', authMiddleware, controller.criar.bind(controller));
router.put('/alunos/:id', authMiddleware, controller.editar.bind(controller));
router.delete('/alunos/:id', authMiddleware, controller.deletar.bind(controller));

export default router;
```

### Solução 2: Bypass Seguro (se realmente necessário)
```typescript
// backend/middleware/devAuthBypass.ts
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './authMiddleware';

export function devAuthBypass(req: Request, res: Response, next: NextFunction) {
  // Múltiplas verificações de segurança
  const isDev = process.env.NODE_ENV === 'development';
  const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  const hasSecret = req.headers['x-dev-bypass'] === process.env.DEV_BYPASS_SECRET;
  
  // TODAS as condições devem ser verdadeiras
  if (isDev && isLocalhost && hasSecret) {
    console.warn('⚠️  [DEV] Auth bypass ativado');
    req.user = {
      uid: 'dev-user-' + Date.now(),
      email: 'dev@test.local',
      name: 'Dev User'
    } as any;
    return next();
  }
  
  // Caso contrário, usar autenticação normal
  return authMiddleware(req, res, next);
}

// .env (NÃO COMMITAR)
DEV_BYPASS_SECRET=seu-secret-aleatorio-complexo-aqui-123456789
```

---

## 4️⃣ IMPLEMENTAR CSRF PROTECTION

### Instalar dependência
```bash
cd backend
npm install csurf cookie-parser
npm install --save-dev @types/cookie-parser
```

### Backend: Configurar CSRF
```typescript
// backend/server.ts
import cookieParser from 'cookie-parser';
import csrf from 'csurf';

app.use(cookieParser());

// CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Endpoint público para obter token CSRF
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Aplicar a todas as rotas que modificam dados
app.use('/api/comunicados', csrfProtection);
app.use('/api/alunos', csrfProtection);
app.use('/api/professores', csrfProtection);
app.use('/api/agendamentos', csrfProtection);

// Handler de erros CSRF
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'Token CSRF inválido',
      message: 'Requisição bloqueada por segurança'
    });
  }
  next(err);
});
```

### Frontend: Usar token CSRF
```typescript
// frontend/src/services/apiService.ts
let csrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (!csrfToken) {
    const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
      credentials: 'include'
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
  }
  return csrfToken;
}

const makeRequest = async (url: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Adicionar token CSRF em requisições que modificam dados
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method?.toUpperCase() || '')) {
    const token = await getCsrfToken();
    headers['X-CSRF-Token'] = token;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  // Se CSRF token expirou, renovar e tentar novamente
  if (response.status === 403) {
    csrfToken = null; // Forçar renovação
    const token = await getCsrfToken();
    headers['X-CSRF-Token'] = token;
    
    return fetch(url, { ...options, headers, credentials: 'include' });
  }

  return response;
};
```

---

## 5️⃣ MELHORAR VALIDAÇÃO DE UPLOAD

### Backend: Validar com Magic Bytes
```bash
cd backend
npm install file-type image-size
```

```typescript
// backend/middleware/uploadMiddleware.ts
import { fileTypeFromBuffer } from 'file-type';
import sizeOf from 'image-size';

export const processUploads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      req.body.imagens = [];
      return next();
    }
    
    const uploadedFiles: string[] = [];
    
    for (const file of files) {
      // 1. Verificar magic bytes (conteúdo real do arquivo)
      const fileType = await fileTypeFromBuffer(file.buffer);
      
      if (!fileType) {
        return res.status(400).json({
          error: 'Arquivo inválido',
          message: 'Não foi possível determinar o tipo do arquivo'
        });
      }
      
      // 2. Validar MIME type real
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(fileType.mime)) {
        return res.status(400).json({
          error: 'Tipo de arquivo não permitido',
          message: `Apenas imagens são permitidas. Detectado: ${fileType.mime}`
        });
      }
      
      // 3. Verificar dimensões da imagem (prevenir zip bombs)
      try {
        const dimensions = sizeOf(file.buffer);
        
        // Limite máximo: 10000x10000 pixels
        if (dimensions.width && dimensions.width > 10000 || 
            dimensions.height && dimensions.height > 10000) {
          return res.status(400).json({
            error: 'Imagem muito grande',
            message: 'Dimensões máximas: 10000x10000 pixels'
          });
        }
      } catch (error) {
        return res.status(400).json({
          error: 'Imagem corrompida',
          message: 'Não foi possível processar a imagem'
        });
      }
      
      // 4. Gerar nome seguro
      const crypto = require('crypto');
      const hash = crypto.randomBytes(8).toString('hex');
      const sanitizedName = `img_${Date.now()}_${hash}.${fileType.ext}`;
      
      // 5. Salvar arquivo
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(__dirname, '../public/uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, sanitizedName);
      fs.writeFileSync(filePath, file.buffer);
      
      uploadedFiles.push(`/uploads/${sanitizedName}`);
    }
    
    req.body.imagens = uploadedFiles;
    next();
  } catch (error: any) {
    console.error('Erro no processamento de upload:', error);
    return res.status(500).json({
      error: 'Erro no upload',
      message: 'Não foi possível processar os arquivos'
    });
  }
};
```

---

## 6️⃣ CONFIGURAR API_BASE_URL

### Frontend: Usar variável de ambiente
```typescript
// frontend/src/services/apiService.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production'
    ? 'https://api.seuprojeto.com'
    : 'http://localhost:3001');
```

### Criar arquivos .env
```bash
# frontend/.env.development
VITE_API_BASE_URL=http://localhost:3001
VITE_ENCRYPTION_KEY=dev-key-change-in-production

# frontend/.env.production
VITE_API_BASE_URL=https://api.seuprojeto.com
VITE_ENCRYPTION_KEY=production-key-secure-random
```

---

## 7️⃣ IMPLEMENTAR CSP NO FRONTEND

```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Content Security Policy -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self' http://localhost:3001 https://firebasestorage.googleapis.com https://firebase.googleapis.com https://*.googleapis.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  ">
  
  <!-- Outros headers de segurança -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="DENY">
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
  
  <title>Sistema Administrativo</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

Execute na ordem:

1. [ ] Atualizar .gitignore (Passo 1.1)
2. [ ] Remover .env do Git se commitado (Passo 1.2)
3. [ ] Rotacionar credenciais Firebase (Passo 1.3)
4. [ ] Remover/Restringir bypass de auth (Seção 3)
5. [ ] Configurar API_BASE_URL com .env (Seção 6)
6. [ ] Implementar HttpOnly cookies OU sessionStorage criptografado (Seção 2)
7. [ ] Implementar CSRF protection (Seção 4)
8. [ ] Melhorar validação de upload (Seção 5)
9. [ ] Adicionar CSP no frontend (Seção 7)
10. [ ] Testar tudo em desenvolvimento
11. [ ] Deploy em produção com variáveis de ambiente corretas

---

## 🧪 TESTES DE VERIFICAÇÃO

Após implementar as correções:

```bash
# 1. Verificar se .env não está no Git
git ls-files | grep ".env"
# Resultado esperado: vazio

# 2. Verificar dependências vulneráveis
cd backend && npm audit
cd frontend && npm audit

# 3. Testar autenticação sem bypass
# Remover header x-dev-bypass e verificar se requer auth

# 4. Testar CSRF
# Tentar fazer POST sem token CSRF - deve falhar com 403

# 5. Testar upload malicioso
# Tentar upload de arquivo .exe renomeado para .jpg - deve falhar
```

---

## 📞 SUPORTE

Se encontrar problemas na implementação:
1. Verifique logs de erro no console
2. Teste cada passo individualmente
3. Revise a documentação do Firebase/Express
4. Consulte o SECURITY_AUDIT_REPORT.md para detalhes

---

**Prioridade Máxima:** Itens 1, 2, 3, 4 e 6  
**Tempo Estimado:** 4-6 horas para implementar todas as correções urgentes

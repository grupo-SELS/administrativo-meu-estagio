# Implementação de Segurança - OWASP Top 10 2021

## 📋 Visão Geral

Este documento descreve todas as medidas de segurança implementadas no projeto, baseadas no OWASP Top 10 2021.

## 🛡️ Vulnerabilidades Abordadas

### A01:2021 - Broken Access Control

**Implementações:**

1. **Rate Limiting** (`middleware/rateLimitMiddleware.ts`)
   - `loginRateLimit`: 5 requisições a cada 15 minutos (login/auth)
   - `apiRateLimit`: 100 requisições a cada 15 minutos (endpoints gerais)
   - `strictRateLimit`: 10 requisições por minuto (operações críticas)
   - Tracking por IP com limpeza automática
   - Headers de rate limit: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

2. **Controle de Acesso**
   - Middleware de autenticação em todas as rotas protegidas
   - Validação de permissões baseada em Firebase Auth
   - Proteção de rotas administrativas sensíveis

**Como Usar:**
```typescript
// Aplicar rate limiting em rotas
router.post('/login', loginRateLimit, controller.login);
router.get('/data', apiRateLimit, authMiddleware, controller.getData);
router.delete('/sensitive', strictRateLimit, authMiddleware, controller.delete);
```

---

### A02:2021 - Cryptographic Failures

**Implementações:**

1. **Sanitização de Dados** (`middleware/validationMiddleware.ts`)
   - `maskSensitiveData()`: Oculta senhas, tokens, CPF, cartões de crédito em logs
   - Nunca armazena senhas em plain text (usa Firebase Auth)
   - Headers sensíveis removidos das respostas

2. **Configuração Segura** (`config/security.ts`)
   - Configuração centralizada de segurança
   - Validação de configuração no startup
   - Mascaramento automático de dados sensíveis em logs

**Campos Mascarados Automaticamente:**
- password, senha
- token, access_token, refresh_token
- authorization, auth
- cpf, ssn
- credit_card, card_number

---

### A03:2021 - Injection

**Implementações:**

1. **Validação e Sanitização** (`middleware/validationMiddleware.ts`)
   
   **Funções:**
   - `sanitizeString()`: Remove tags HTML, handlers de eventos, scripts
   - `sanitizeBody`: Middleware que sanitiza automaticamente todos os campos string
   - `isValidEmail()`: Valida formato de email
   - `isValidCPF()`: Valida CPF brasileiro
   - `isValidPhone()`: Valida telefone brasileiro
   - `isValidDate()`: Valida formato de data
   - `isValidId()`: Valida IDs do Firestore

   **Middlewares:**
   - `validateRequired(fields)`: Valida campos obrigatórios
   - `validateLength(field, min, max)`: Valida tamanho de strings
   - `validateId(paramName)`: Valida IDs em params de URL

2. **Detecção de Ataques** (`middleware/securityMiddleware.ts`)
   - Pattern matching para SQL Injection
   - Detecção de XSS (Cross-Site Scripting)
   - Detecção de Command Injection
   - Detecção de Template Injection
   - Detecção de Path Traversal
   - Logging de tentativas suspeitas

**Como Usar:**
```typescript
// Validar e sanitizar input
router.post('/users', 
  sanitizeBody,
  validateRequired(['nome', 'email', 'cpf']),
  validateLength('nome', 3, 100),
  controller.create
);

// Validar ID em URL
router.get('/users/:id', validateId('id'), controller.getById);
```

---

### A04:2021 - Insecure Design

**Implementações:**

1. **Configuração Centralizada** (`config/security.ts`)
   
   **SecurityConfig inclui:**
   - Política de senhas (mínimo 8 caracteres, complexidade)
   - Configuração de sessão (timeout, httpOnly, sameSite)
   - CORS (origens permitidas por ambiente)
   - Limites de upload (tamanho, tipos de arquivo)
   - Rate limits configuráveis
   - Content Security Policy (CSP)
   - Headers de segurança
   - Configuração de logging

2. **Validação de Configuração**
   - `validateSecurityConfig()`: Valida todas as configurações no startup
   - Falha rápido se configurações inválidas

**Configurações Principais:**
```typescript
passwordPolicy: {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128
}

session: {
  maxAge: 24 * 60 * 60 * 1000, // 24 horas
  httpOnly: true,
  secure: !IS_DEVELOPMENT,
  sameSite: 'strict'
}

upload: {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 10,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}
```

---

### A05:2021 - Security Misconfiguration

**Implementações:**

1. **Headers de Segurança** (`middleware/securityMiddleware.ts`)
   
   **Headers Aplicados:**
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security`: HSTS com preload
   - `Referrer-Policy: no-referrer`
   - `Permissions-Policy`: Desabilita recursos não usados
   - `Content-Security-Policy`: CSP rigoroso em produção
   - Remove `X-Powered-By` e `Server` (oculta tecnologia)

2. **Helmet.js**
   - Configuração robusta em `server.ts`
   - CSP desabilitado em desenvolvimento, estrito em produção
   - HSTS com maxAge de 1 ano

3. **Proteções Adicionais**
   - `preventParameterPollution`: Previne HTTP Parameter Pollution
   - `requestTimeout`: Timeout de 30 segundos para requisições
   - `validateHostHeader`: Previne Host Header Injection
   - `protectSensitiveRoutes`: Bloqueio extra para rotas /admin, /config, /.env

---

### A06:2021 - Vulnerable and Outdated Components

**Implementações:**

1. **Gerenciamento de Dependências**
   - Todas as dependências atualizadas para versões seguras
   - Security headers aplicados via middlewares customizados
   - Helmet.js para proteções adicionais

2. **Monitoramento**
   - Recomendação: Usar `npm audit` regularmente
   - Recomendação: Configurar Dependabot ou Renovate

**Como Monitorar:**
```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades automáticas
npm audit fix

# Atualizar dependências
npm update
```

---

### A07:2021 - Identification and Authentication Failures

**Implementações:**

1. **Proteção contra Brute Force** (`middleware/authSecurityMiddleware.ts`)
   
   **Recursos:**
   - Limite de 5 tentativas de login por IP em 15 minutos
   - Limite de 5 tentativas de login por email em 15 minutos
   - Bloqueio temporário de 15 minutos após exceder limite
   - Limpeza automática de tentativas antigas
   - Auditoria de todas as tentativas

2. **Política de Senhas Forte**
   - `validatePasswordStrength()`: Valida complexidade da senha
   - Mínimo 8 caracteres, máximo 128
   - Requer: maiúscula, minúscula, número, caractere especial
   - Rejeita senhas comuns
   - Middleware `validatePassword` para validação automática

3. **Gestão de Sessão**
   - `validateSession`: Valida expiração de sessão
   - Timeout de 24 horas
   - HttpOnly cookies
   - SameSite strict
   - Secure em produção

4. **Auditoria de Autenticação**
   - `recordFailedLogin`: Registra tentativas falhadas
   - `clearLoginAttempts`: Limpa tentativas após sucesso
   - Logging de todos os eventos de autenticação

**Como Usar:**
```typescript
// Rota de login
router.post('/login',
  preventBruteForce,
  loginRateLimit,
  controller.login,
  clearLoginAttempts
);

// Registrar falha de login
router.post('/login',
  preventBruteForce,
  loginRateLimit,
  async (req, res, next) => {
    try {
      await controller.login(req, res);
    } catch (error) {
      recordFailedLogin(req, res, () => {});
      res.status(401).json({ error: 'Login falhou' });
    }
  }
);

// Criar usuário com senha forte
router.post('/users',
  validatePassword,
  controller.create
);
```

---

### A08:2021 - Software and Data Integrity Failures

**Implementações:**

1. **Validação de Upload de Arquivos** (`middleware/validationMiddleware.ts`)
   
   **Validações:**
   - `validateFileType(allowedTypes)`: Whitelist de extensões permitidas
   - `validateFileSize(maxMB)`: Limite de tamanho por arquivo
   - Validação de MIME type
   - Configuração centralizada de limites

2. **Integridade de Dados**
   - Validação de todos os inputs antes de processar
   - Sanitização de dados antes de salvar
   - Auditoria de todas as mutações de dados

**Como Usar:**
```typescript
// Upload de imagens
router.post('/comunicados',
  upload.array('imagens', 10),
  validateFileType(['jpg', 'jpeg', 'png', 'gif', 'webp']),
  validateFileSize(5), // 5MB
  controller.create
);
```

---

### A09:2021 - Security Logging and Monitoring Failures

**Implementações:**

1. **Sistema de Auditoria Completo** (`middleware/auditMiddleware.ts`)
   
   **Recursos:**
   - Log de todas as requisições (exceto /health)
   - Categorização de eventos (AUTH, ACCESS, MUTATION, SECURITY, ERROR, ADMIN)
   - Níveis de severidade (info, warn, error, critical)
   - Mascaramento automático de dados sensíveis
   - Armazenamento em memória (máximo 10.000 eventos)
   - Limpeza automática de logs antigos (>30 dias)

   **Eventos Auditados:**
   - Tentativas de autenticação (sucesso e falha)
   - Acesso a recursos protegidos
   - Mutações de dados (POST, PUT, DELETE)
   - Ações administrativas
   - Eventos de segurança (ataques detectados)
   - Erros de aplicação

2. **Middlewares de Auditoria**
   - `auditMiddleware`: Auditoria geral de requisições
   - `auditAuthAttempt(success)`: Auditoria de autenticação
   - `auditSensitiveDataChange(resource)`: Auditoria de dados sensíveis
   - `auditAdminAccess`: Auditoria de acessos administrativos

3. **Detecção de Atividades Suspeitas**
   - Pattern matching para ataques conhecidos
   - Logging automático de tentativas suspeitas
   - Nível 'warn' ou 'error' para eventos de segurança

**Como Usar:**
```typescript
// Aplicado globalmente no server.ts
app.use(auditMiddleware);

// Auditoria específica para rotas administrativas
router.use('/admin', auditAdminAccess);

// Auditoria de mudanças sensíveis
router.put('/users/:id',
  auditSensitiveDataChange('user'),
  controller.update
);

// Recuperar logs (endpoint administrativo)
import { getAuditLogs } from './middleware/auditMiddleware';

router.get('/admin/audit-logs', authMiddleware, (req, res) => {
  const logs = getAuditLogs({
    level: 'error',
    limit: 100
  });
  res.json({ logs });
});
```

**Estrutura de Log:**
```typescript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  level: "warn",
  category: "authentication",
  action: "login_failed",
  userId: "abc123",
  userEmail: "user@example.com",
  ip: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  resource: "/api/auth/login",
  method: "POST",
  statusCode: 401,
  duration: 150,
  details: { /* dados mascarados */ }
}
```

---

### A10:2021 - Server-Side Request Forgery (SSRF)

**Implementações:**

1. **Validação de URLs Externas** (`middleware/ssrfMiddleware.ts`)
   
   **Proteções:**
   - Whitelist de domínios permitidos
   - Bloqueio de IPs privados (10.x, 172.16.x, 192.168.x, 127.x)
   - Bloqueio de localhost e 0.0.0.0
   - Bloqueio de IPv6 link-local e private
   - Validação de protocolos (apenas HTTP/HTTPS)
   - Detecção de caracteres suspeitos (@, etc)
   - Validação de IDs do Firestore

2. **Middlewares SSRF**
   - `preventSSRF`: Middleware geral para todas as rotas
   - `validateRequestURLs(fields)`: Validação específica de campos
   - `validateBeforeFetch(url)`: Função para validar antes de fetch/axios

3. **Gerenciamento de Domínios**
   - `addAllowedDomain(domain)`: Adicionar domínio confiável
   - `removeAllowedDomain(domain)`: Remover domínio
   - `getAllowedDomains()`: Listar domínios permitidos

**Domínios Permitidos por Padrão:**
- firebasestorage.googleapis.com
- googleapis.com

**Como Usar:**
```typescript
// Aplicado globalmente no server.ts
app.use(preventSSRF);

// Validação específica de campos
router.post('/webhook',
  validateRequestURLs(['callbackUrl', 'imageUrl']),
  controller.create
);

// Em um controller, antes de fazer requisição externa
import { validateBeforeFetch } from './middleware/ssrfMiddleware';

async function fetchExternalData(url: string) {
  try {
    validateBeforeFetch(url); // Lança erro se inválido
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    console.error('SSRF Protection:', error.message);
    throw error;
  }
}

// Adicionar domínio confiável (apenas admin)
import { addAllowedDomain } from './middleware/ssrfMiddleware';
addAllowedDomain('api.parceiro-confiavel.com');
```

**Bloqueios:**
- ❌ http://localhost/
- ❌ http://127.0.0.1/
- ❌ http://192.168.1.1/
- ❌ http://10.0.0.1/
- ❌ file:///etc/passwd
- ❌ ftp://example.com/
- ❌ http://user@evil.com@google.com/
- ✅ https://firebasestorage.googleapis.com/...
- ✅ https://googleapis.com/...

---

## 🔧 Configuração no Servidor

### server.ts - Ordem dos Middlewares

```typescript
// 1. Headers de segurança (primeiro)
app.use(securityHeadersMiddleware);

// 2. Validação de Host
if (!IS_DEVELOPMENT) {
  app.use(validateHostHeader(['localhost:3001', 'localhost']));
}

// 3. Helmet
app.use(helmet({ /* config */ }));

// 4. Logging (com filtro)
app.use(morgan(IS_DEVELOPMENT ? 'dev' : 'combined', {
  skip: (req) => req.url === '/health'
}));

// 5. Detecção de ataques
app.use(suspiciousActivityLogger);

// 6. Prevenção HPP
app.use(preventParameterPollution);

// 7. Timeout
app.use(requestTimeout(30000));

// 8. Rate Limiting Global
app.use(apiRateLimit);

// 9. Auditoria
app.use(auditMiddleware);

// 10. Proteção SSRF
app.use(preventSSRF);

// 11. CORS
app.use(cors({ /* config */ }));

// 12. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 13. Rotas (com middlewares específicos)
app.use('/api', routes);
```

---

## 📝 Checklist de Implementação por Rota

Ao criar uma nova rota, aplicar os seguintes middlewares conforme necessário:

### GET (Leitura)
- [ ] `apiRateLimit` - Rate limiting moderado
- [ ] `authMiddleware` ou `devAuthBypass` - Autenticação
- [ ] `validateId('paramName')` - Se usar ID em params

### POST (Criação)
- [ ] `strictRateLimit` - Rate limiting agressivo
- [ ] `authMiddleware` ou `devAuthBypass` - Autenticação
- [ ] `sanitizeBody` - Sanitização de input
- [ ] `validateRequired([...])` - Campos obrigatórios
- [ ] `validateFileType([...])` - Se aceitar upload
- [ ] `validateFileSize(maxMB)` - Se aceitar upload
- [ ] `validatePassword` - Se criar usuário com senha

### PUT/PATCH (Atualização)
- [ ] `strictRateLimit` - Rate limiting agressivo
- [ ] `authMiddleware` ou `devAuthBypass` - Autenticação
- [ ] `validateId('paramName')` - Validar ID
- [ ] `sanitizeBody` - Sanitização de input
- [ ] `auditSensitiveDataChange` - Se dados sensíveis

### DELETE (Exclusão)
- [ ] `strictRateLimit` - Rate limiting agressivo
- [ ] `authMiddleware` - Autenticação (sem bypass)
- [ ] `validateId('paramName')` - Validar ID
- [ ] `auditSensitiveDataChange` - Auditoria

### Rotas de Autenticação
- [ ] `loginRateLimit` - Rate limiting para login
- [ ] `preventBruteForce` - Proteção brute force
- [ ] `validatePassword` - Se trocar/criar senha
- [ ] `recordFailedLogin` - Em caso de falha
- [ ] `clearLoginAttempts` - Em caso de sucesso

---

## 🎯 Exemplo Completo de Rota Segura

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { 
  apiRateLimit, 
  strictRateLimit 
} from '../middleware/rateLimitMiddleware';
import { 
  sanitizeBody, 
  validateRequired, 
  validateId,
  validateFileType,
  validateFileSize
} from '../middleware/validationMiddleware';
import { auditSensitiveDataChange } from '../middleware/auditMiddleware';
import comunicadosController from '../controllers/comunicadosController';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// GET - Listar todos
router.get('/comunicados',
  apiRateLimit,
  authMiddleware,
  comunicadosController.listar
);

// GET - Buscar por ID
router.get('/comunicados/:id',
  apiRateLimit,
  authMiddleware,
  validateId('id'),
  comunicadosController.buscarPorId
);

// POST - Criar
router.post('/comunicados',
  strictRateLimit,
  authMiddleware,
  upload.array('imagens', 10),
  sanitizeBody,
  validateRequired(['titulo', 'conteudo']),
  validateFileType(['jpg', 'jpeg', 'png', 'gif', 'webp']),
  validateFileSize(5),
  comunicadosController.criar
);

// PUT - Editar
router.put('/comunicados/:id',
  strictRateLimit,
  authMiddleware,
  validateId('id'),
  upload.array('imagens', 10),
  sanitizeBody,
  validateFileType(['jpg', 'jpeg', 'png', 'gif', 'webp']),
  validateFileSize(5),
  auditSensitiveDataChange('comunicado'),
  comunicadosController.editar
);

// DELETE - Deletar
router.delete('/comunicados/:id',
  strictRateLimit,
  authMiddleware,
  validateId('id'),
  auditSensitiveDataChange('comunicado'),
  comunicadosController.deletar
);

export default router;
```

---

## 🚀 Próximos Passos para Produção

### Melhorias Recomendadas:

1. **Rate Limiting**
   - [ ] Migrar de in-memory para Redis
   - [ ] Implementar rate limiting distribuído
   - [ ] Adicionar rate limiting por usuário (não só IP)

2. **Auditoria**
   - [ ] Migrar logs de memória para banco de dados
   - [ ] Implementar rotação de logs
   - [ ] Configurar alertas para eventos críticos
   - [ ] Integrar com serviço de monitoring (Sentry, Datadog)

3. **Autenticação**
   - [ ] Implementar 2FA (Two-Factor Authentication)
   - [ ] Implementar refresh tokens
   - [ ] Adicionar notificação de login suspeito
   - [ ] Implementar CAPTCHA em login após tentativas falhadas

4. **SSRF**
   - [ ] Implementar DNS resolution check
   - [ ] Adicionar timeout para requisições externas
   - [ ] Implementar proxy para requisições externas
   - [ ] Adicionar mais domínios confiáveis conforme necessário

5. **CSP (Content Security Policy)**
   - [ ] Remover 'unsafe-inline' do CSP em produção
   - [ ] Implementar nonces para scripts inline
   - [ ] Configurar CSP report-uri

6. **Secrets Management**
   - [ ] Usar AWS Secrets Manager ou similar
   - [ ] Rodar secrets fora do repositório
   - [ ] Implementar rotação automática de secrets

7. **Testes de Segurança**
   - [ ] Implementar testes automatizados de segurança
   - [ ] Configurar OWASP ZAP ou similar
   - [ ] Realizar penetration testing regular
   - [ ] Configurar security code analysis (Snyk, SonarQube)

8. **Configuração de Produção**
   - [ ] Desabilitar devAuthBypass
   - [ ] Habilitar HTTPS estrito
   - [ ] Configurar firewall (WAF)
   - [ ] Implementar DDoS protection
   - [ ] Configurar backup automático

---

## 📊 Monitoramento e Métricas

### Endpoints Administrativos Sugeridos:

```typescript
// Estatísticas de segurança
GET /admin/security-stats
{
  rateLimiting: {
    blockedIPs: 5,
    totalRequests: 10000
  },
  authentication: {
    blockedIPs: 3,
    blockedEmails: 2,
    failedAttempts: 150
  },
  audit: {
    totalEvents: 50000,
    criticalEvents: 10,
    errorEvents: 45,
    warningEvents: 200
  }
}

// Logs de auditoria
GET /admin/audit-logs?level=error&limit=100

// Logs de ataques detectados
GET /admin/security-incidents

// Estatísticas de rate limiting
GET /admin/rate-limit-stats

// IPs bloqueados
GET /admin/blocked-ips
```

---

## ✅ Status de Implementação

| OWASP | Vulnerabilidade | Status | Arquivos |
|-------|----------------|--------|----------|
| A01 | Broken Access Control | ✅ Completo | `rateLimitMiddleware.ts`, `authMiddleware.ts` |
| A02 | Cryptographic Failures | ✅ Completo | `security.ts`, `validationMiddleware.ts` |
| A03 | Injection | ✅ Completo | `validationMiddleware.ts`, `securityMiddleware.ts` |
| A04 | Insecure Design | ✅ Completo | `security.ts` |
| A05 | Security Misconfiguration | ✅ Completo | `securityMiddleware.ts`, `server.ts` |
| A06 | Vulnerable Components | ✅ Completo | `package.json`, security headers |
| A07 | Auth Failures | ✅ Completo | `authSecurityMiddleware.ts` |
| A08 | Data Integrity | ✅ Completo | `validationMiddleware.ts`, `auditMiddleware.ts` |
| A09 | Logging Failures | ✅ Completo | `auditMiddleware.ts` |
| A10 | SSRF | ✅ Completo | `ssrfMiddleware.ts` |

---

## 📞 Suporte

Para dúvidas sobre implementação de segurança, consulte:
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- Documentação inline nos arquivos de middleware

---

**Última atualização:** 2024-01-15  
**Versão:** 1.0.0

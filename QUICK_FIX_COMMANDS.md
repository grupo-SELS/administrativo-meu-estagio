# 🚀 COMANDOS DE CORREÇÃO RÁPIDA
## Execute na Ordem

---

## 📝 PREPARAÇÃO

### 1. Fazer Backup
```powershell
# Windows PowerShell
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item -Path "c:\Users\luiza\Desktop\site-adm-app" -Destination "c:\Users\luiza\Desktop\site-adm-app_backup_$timestamp" -Recurse
Write-Host "✅ Backup criado em: site-adm-app_backup_$timestamp"
```

---

## 🔴 CORREÇÕES URGENTES (30 minutos)

### 2. Atualizar .gitignore
```powershell
cd c:\Users\luiza\Desktop\site-adm-app

# Adicionar ao .gitignore
@"

# Environment variables
*.env
.env
.env.local
.env.development
.env.production
.env.*.local

# Firebase credentials
**/serviceAccountKey.json
**/*serviceAccount*.json
"@ | Out-File -FilePath .gitignore -Append -Encoding UTF8

Write-Host "✅ .gitignore atualizado"
```

### 3. Remover Arquivos Sensíveis do Git (SE JÁ COMMITADOS)
```powershell
# ⚠️ ATENÇÃO: Execute APENAS se os arquivos estiverem versionados
# Verifique primeiro:
git ls-files | Select-String ".env|serviceAccount"

# Se aparecer algo, remova:
git rm --cached backend\.env
git rm --cached backend\config\serviceAccountKey.json
git commit -m "Remove sensitive credentials from version control"

Write-Host "✅ Credenciais removidas do Git"
```

### 4. Rotacionar Credenciais Firebase
```powershell
Write-Host "⚠️  AÇÃO MANUAL NECESSÁRIA:"
Write-Host "1. Acesse: https://console.firebase.google.com"
Write-Host "2. Project Settings > Service Accounts"
Write-Host "3. Generate New Private Key"
Write-Host "4. Salve em: backend/config/serviceAccountKey.json"
Write-Host "5. NÃO commite este arquivo!"
Write-Host ""
Read-Host "Pressione Enter quando concluir"
```

### 5. Criar Arquivos .env
```powershell
# Backend .env
@"
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT=
FIREBASE_STORAGE_BUCKET=
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
DEV_BYPASS_SECRET=
"@ | Out-File -FilePath backend\.env -Encoding UTF8

# Frontend .env.development
@"
VITE_API_BASE_URL=http://localhost:3001
VITE_APIKEY=
VITE_AUTHDOMAIN=
VITE_PROJECTID=registro-itec-dcbc4
VITE_STORAGEBUCKET=
VITE_MESSAGINGSENDERID=
VITE_APPID=
VITE_ENCRYPTION_KEY=dev-key-change-in-production
"@ | Out-File -FilePath frontend\.env.development -Encoding UTF8

# Frontend .env.production
@"
VITE_API_BASE_URL=https://api.seuprojeto.com
VITE_APIKEY=
VITE_AUTHDOMAIN=
VITE_PROJECTID=registro-itec-dcbc4
VITE_STORAGEBUCKET=
VITE_MESSAGINGSENDERID=
VITE_APPID=
VITE_ENCRYPTION_KEY=production-key-secure-random-change-me
"@ | Out-File -FilePath frontend\.env.production -Encoding UTF8

Write-Host "✅ Arquivos .env criados"
Write-Host "⚠️  EDITE os arquivos e preencha as credenciais!"
```

---

## 🔧 CORREÇÕES DE CÓDIGO (1 hora)

### 6. Remover Bypass de Autenticação
```powershell
Write-Host "📝 Editando alunosRoutes.ts..."

# Criar versão corrigida
$content = @"
import { Router } from 'express';
import alunosController from '../controllers/alunosController';
import { authMiddleware } from '../middleware/authMiddleware';
import { apiRateLimit, strictRateLimit } from '../middleware/rateLimitMiddleware';
import { sanitizeBody, validateRequired, validateId } from '../middleware/validationMiddleware';

const router = Router();
const controller = alunosController;

// ✅ SEM BYPASS - Usar authMiddleware diretamente
router.get('/alunos', apiRateLimit, authMiddleware, controller.listar.bind(controller));
router.get('/alunos/:id', apiRateLimit, authMiddleware, validateId('id'), controller.buscarPorId.bind(controller));

router.post('/alunos', 
  strictRateLimit, 
  authMiddleware,
  sanitizeBody,
  validateRequired(['nome', 'cpf', 'email']),
  controller.criar.bind(controller)
);

router.put('/alunos/:id', 
  strictRateLimit, 
  authMiddleware,
  validateId('id'),
  sanitizeBody,
  controller.editar.bind(controller)
);

router.delete('/alunos/:id', 
  strictRateLimit, 
  authMiddleware,
  validateId('id'),
  controller.deletar.bind(controller)
);

export default router;
"@

$content | Out-File -FilePath backend\routes\alunosRoutes.ts -Encoding UTF8

Write-Host "✅ alunosRoutes.ts corrigido"
Write-Host "⚠️  Faça o mesmo para comunicadosRoutes.ts e agendamentosRoutes.ts"
```

### 7. Corrigir API_BASE_URL
```powershell
Write-Host "📝 Criando novo apiService.ts..."

# Backup do original
Copy-Item frontend\src\services\apiService.ts frontend\src\services\apiService.ts.backup

# Adicionar no início do arquivo
$apiServiceFix = @"
// ✅ Usar variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production'
    ? 'https://api.seuprojeto.com'
    : 'http://localhost:3001');

console.log('🔧 API_BASE_URL:', API_BASE_URL);

"@

Write-Host "⚠️  EDITE MANUALMENTE: frontend/src/services/apiService.ts"
Write-Host "   Substitua: const API_BASE_URL = 'http://localhost:3001';"
Write-Host "   Por: $apiServiceFix"
```

### 8. Fortalecer Validação de Senha
```powershell
Write-Host "📝 Função de validação de senha atualizada..."
Write-Host @"

Adicione em Login.tsx:

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Pelo menos uma maiúscula');
  if (!/[a-z]/.test(password)) errors.push('Pelo menos uma minúscula');
  if (!/[0-9]/.test(password)) errors.push('Pelo menos um número');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Pelo menos um caractere especial');
  
  const common = ['password', '12345678', 'qwerty', 'abc123'];
  if (common.some(c => password.toLowerCase().includes(c))) {
    errors.push('Senha muito comum');
  }
  
  return { valid: errors.length === 0, errors };
};

// No handleSubmit:
const passwordValidation = validatePassword(password);
if (!passwordValidation.valid) {
  setError(passwordValidation.errors.join(', '));
  return;
}

"@
```

---

## 🔐 INSTALAÇÃO DE DEPENDÊNCIAS

### 9. Instalar Dependências para CSRF e Cookies
```powershell
cd backend
npm install cookie-parser csurf
npm install --save-dev @types/cookie-parser

cd ..\frontend
npm install crypto-js
npm install --save-dev @types/crypto-js

cd ..
Write-Host "✅ Dependências instaladas"
```

### 10. Instalar Dependências para Validação de Upload
```powershell
cd backend
npm install file-type@16.5.4 image-size

cd ..
Write-Host "✅ Dependências de upload instaladas"
```

---

## 🧪 TESTES DE VERIFICAÇÃO

### 11. Verificar se .env está no Git
```powershell
Write-Host "🔍 Verificando arquivos sensíveis no Git..."

$sensitiveFiles = git ls-files | Select-String ".env|serviceAccount"

if ($sensitiveFiles) {
    Write-Host "⚠️  ATENÇÃO: Arquivos sensíveis encontrados no Git!" -ForegroundColor Red
    $sensitiveFiles
} else {
    Write-Host "✅ Nenhum arquivo sensível no Git" -ForegroundColor Green
}
```

### 12. Verificar Vulnerabilidades em Dependências
```powershell
Write-Host "🔍 Verificando vulnerabilidades no backend..."
cd backend
npm audit

Write-Host "`n🔍 Verificando vulnerabilidades no frontend..."
cd ..\frontend
npm audit

cd ..
```

### 13. Compilar e Testar
```powershell
Write-Host "🔨 Compilando backend..."
cd backend
npx tsc --noEmit

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend compila sem erros" -ForegroundColor Green
} else {
    Write-Host "❌ Erros de compilação no backend" -ForegroundColor Red
}

Write-Host "`n🔨 Verificando frontend..."
cd ..\frontend
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend compila sem erros" -ForegroundColor Green
} else {
    Write-Host "❌ Erros de compilação no frontend" -ForegroundColor Red
}

cd ..
```

---

## 📊 RELATÓRIO FINAL

### 14. Gerar Relatório de Status
```powershell
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   📊 RELATÓRIO DE CORREÇÕES DE SEGURANÇA" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar .gitignore
if (Select-String -Path .gitignore -Pattern "*.env" -Quiet) {
    Write-Host "✅ .gitignore atualizado" -ForegroundColor Green
} else {
    Write-Host "❌ .gitignore NÃO atualizado" -ForegroundColor Red
}

# Verificar arquivos .env criados
if (Test-Path "backend\.env") {
    Write-Host "✅ backend/.env criado" -ForegroundColor Green
} else {
    Write-Host "❌ backend/.env NÃO criado" -ForegroundColor Red
}

if (Test-Path "frontend\.env.development") {
    Write-Host "✅ frontend/.env.development criado" -ForegroundColor Green
} else {
    Write-Host "❌ frontend/.env.development NÃO criado" -ForegroundColor Red
}

# Verificar backup
$backupDir = Get-ChildItem "c:\Users\luiza\Desktop\" -Filter "site-adm-app_backup_*" | Select-Object -First 1
if ($backupDir) {
    Write-Host "✅ Backup criado: $($backupDir.Name)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backup NÃO encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ⚠️  Preencher credenciais nos arquivos .env"
Write-Host "2. ⚠️  Editar manualmente apiService.ts (API_BASE_URL)"
Write-Host "3. ⚠️  Corrigir comunicadosRoutes.ts e agendamentosRoutes.ts"
Write-Host "4. ⚠️  Implementar HttpOnly cookies (ver SECURITY_FIXES_URGENT.md)"
Write-Host "5. ⚠️  Implementar CSRF protection (ver SECURITY_FIXES_URGENT.md)"
Write-Host "6. 🧪 Testar em desenvolvimento"
Write-Host "7. 🚀 Deploy em produção"
Write-Host ""
Write-Host "📖 Documentação completa:" -ForegroundColor Yellow
Write-Host "   - SECURITY_AUDIT_REPORT.md" -ForegroundColor Yellow
Write-Host "   - SECURITY_FIXES_URGENT.md" -ForegroundColor Yellow
Write-Host "   - SECURITY_SUMMARY.md" -ForegroundColor Yellow
Write-Host ""
```

---

## ⚡ SCRIPT COMPLETO (Executar Tudo)

### 15. Executar Todas as Correções Automatizadas
```powershell
# Salvar este script como: fix-security-urgent.ps1
# Executar: .\fix-security-urgent.ps1

param(
    [switch]$SkipBackup
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 INICIANDO CORREÇÕES DE SEGURANÇA..." -ForegroundColor Cyan
Write-Host ""

# 1. Backup
if (-not $SkipBackup) {
    Write-Host "📦 Criando backup..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "c:\Users\luiza\Desktop\site-adm-app_backup_$timestamp"
    Copy-Item -Path "c:\Users\luiza\Desktop\site-adm-app" -Destination $backupPath -Recurse -ErrorAction SilentlyContinue
    
    if ($?) {
        Write-Host "✅ Backup criado: $backupPath" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Falha no backup, mas continuando..." -ForegroundColor Yellow
    }
    Write-Host ""
}

cd c:\Users\luiza\Desktop\site-adm-app

# 2. Atualizar .gitignore
Write-Host "📝 Atualizando .gitignore..." -ForegroundColor Yellow
@"

# Environment variables
*.env
.env
.env.local
.env.development
.env.production
.env.*.local

# Firebase credentials
**/serviceAccountKey.json
**/*serviceAccount*.json
"@ | Out-File -FilePath .gitignore -Append -Encoding UTF8
Write-Host "✅ .gitignore atualizado" -ForegroundColor Green
Write-Host ""

# 3. Criar arquivos .env
Write-Host "📝 Criando arquivos .env..." -ForegroundColor Yellow

@"
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
DEV_BYPASS_SECRET=change-me-$(Get-Random -Minimum 100000 -Maximum 999999)
"@ | Out-File -FilePath backend\.env -Encoding UTF8

@"
VITE_API_BASE_URL=http://localhost:3001
VITE_PROJECTID=registro-itec-dcbc4
VITE_ENCRYPTION_KEY=dev-key-$(Get-Random -Minimum 100000 -Maximum 999999)
"@ | Out-File -FilePath frontend\.env.development -Encoding UTF8

Write-Host "✅ Arquivos .env criados" -ForegroundColor Green
Write-Host ""

# 4. Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow

cd backend
npm install cookie-parser csurf file-type@16.5.4 image-size --silent 2>$null
npm install --save-dev @types/cookie-parser --silent 2>$null

cd ..\frontend
npm install crypto-js --silent 2>$null
npm install --save-dev @types/crypto-js --silent 2>$null

cd ..
Write-Host "✅ Dependências instaladas" -ForegroundColor Green
Write-Host ""

# 5. Verificar compilação
Write-Host "🔨 Verificando compilação..." -ForegroundColor Yellow
cd backend
$compileResult = npx tsc --noEmit 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend compila sem erros" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend tem alguns avisos (verificar manualmente)" -ForegroundColor Yellow
}

cd ..
Write-Host ""

# 6. Relatório Final
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ CORREÇÕES AUTOMATIZADAS CONCLUÍDAS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  AÇÕES MANUAIS NECESSÁRIAS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Preencher credenciais Firebase nos .env" -ForegroundColor White
Write-Host "2. Editar apiService.ts (API_BASE_URL)" -ForegroundColor White
Write-Host "3. Corrigir rotas (comunicados, agendamentos)" -ForegroundColor White
Write-Host "4. Implementar HttpOnly cookies" -ForegroundColor White
Write-Host "5. Implementar CSRF protection" -ForegroundColor White
Write-Host ""
Write-Host "📖 Ver documentação completa em:" -ForegroundColor Cyan
Write-Host "   SECURITY_FIXES_URGENT.md" -ForegroundColor White
Write-Host ""
```

---

## 📝 COMO USAR ESTE ARQUIVO

### Executar Todos os Comandos:
```powershell
# 1. Salvar como: fix-security-urgent.ps1
# 2. Abrir PowerShell como Administrador
# 3. Navegar até a pasta do projeto
cd c:\Users\luiza\Desktop\site-adm-app

# 4. Permitir execução de scripts (se necessário)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 5. Executar o script
.\fix-security-urgent.ps1

# Ou sem backup (mais rápido):
.\fix-security-urgent.ps1 -SkipBackup
```

### Executar Comandos Individuais:
- Copie e cole cada seção no PowerShell
- Execute na ordem apresentada
- Verifique o resultado de cada comando

---

## ⚠️ AVISOS IMPORTANTES

1. **Sempre faça backup antes de executar**
2. **Teste em desenvolvimento antes de produção**
3. **Não commite arquivos .env**
4. **Rotacione credenciais se expostas no Git**
5. **Revise manualmente cada mudança**

---

## 🆘 EM CASO DE PROBLEMAS

### Restaurar Backup:
```powershell
# Encontrar backup mais recente
$latestBackup = Get-ChildItem "c:\Users\luiza\Desktop\" -Filter "site-adm-app_backup_*" | 
                Sort-Object LastWriteTime -Descending | 
                Select-Object -First 1

# Restaurar
if ($latestBackup) {
    Remove-Item "c:\Users\luiza\Desktop\site-adm-app" -Recurse -Force
    Copy-Item $latestBackup.FullName "c:\Users\luiza\Desktop\site-adm-app" -Recurse
    Write-Host "✅ Backup restaurado"
}
```

### Reverter Git:
```powershell
# Ver últimos commits
git log --oneline -5

# Reverter para commit anterior
git reset --hard HEAD~1

# Ou reverter para commit específico
git reset --hard <commit-hash>
```

---

**Tempo Total Estimado:** 30-60 minutos  
**Nível de Risco:** Médio (backup recomendado)  
**Requer Intervenção Manual:** Sim (algumas etapas)

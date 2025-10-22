# ✅ CHECKLIST: ANTES DE FAZER DEPLOY

## 🎯 VERIFICAÇÃO RÁPIDA - WINDOWS → LINUX

Execute este checklist **ANTES** de enviar os arquivos para o servidor.

---

## 1️⃣ **CONFIGURAÇÃO (5 minutos)**

### ✅ Firebase Backend
```bash
# Arquivo: backend\.env.production
```
- [ ] `FIREBASE_SERVICE_ACCOUNT` configurado com JSON completo
- [ ] `FIREBASE_STORAGE_BUCKET` configurado
- [ ] `JWT_SECRET` gerado (use: `openssl rand -base64 32`)
- [ ] `CORS_ORIGINS` inclui seu domínio

### ✅ Firebase Frontend
```bash
# Arquivo: frontend\.env.production
```
- [ ] `VITE_API_URL` aponta para seu domínio
- [ ] Todas variáveis `VITE_FIREBASE_*` configuradas
- [ ] Credenciais são da Web App (não Service Account)

---

## 2️⃣ **LINE ENDINGS (2 minutos)**

### ✅ Converter scripts para LF

**No VSCode:**
1. Abra o arquivo `prepare-deploy.sh`
2. Olhe no canto inferior direito
3. Se estiver **CRLF**, clique e mude para **LF**
4. Salve o arquivo (Ctrl+S)

```
Antes:  CRLF ❌
Depois: LF   ✅
```

**OU use PowerShell:**
```powershell
# Verificar line endings
(Get-Content .\prepare-deploy.sh -Raw).Contains("`r`n")
# Se retornar True, tem CRLF

# Converter para LF
(Get-Content .\prepare-deploy.sh -Raw) -replace "`r`n","`n" | Set-Content .\prepare-deploy.sh -NoNewline
```

- [ ] `prepare-deploy.sh` está com LF
- [ ] Arquivo `.gitattributes` foi criado (já está!)

---

## 3️⃣ **CÓDIGO (1 minuto)**

### ✅ Verificar caminhos

```powershell
# Buscar por caminhos Windows hardcoded
Select-String -Pattern "C:\\\\" -Path .\backend\*.ts,.\frontend\src\**\*.tsx -Recurse
Select-String -Pattern "\\\\\\\\" -Path .\backend\*.ts,.\frontend\src\**\*.tsx -Recurse
```

Se encontrar algo, corrija para:
```javascript
// ❌ ERRADO
const path = 'C:\\Users\\file.txt';
const path2 = __dirname + '\\uploads\\file.jpg';

// ✅ CERTO
const path = process.env.FILE_PATH || './file.txt';
const path2 = path.join(__dirname, 'uploads', 'file.jpg');
```

- [ ] Nenhum caminho Windows hardcoded
- [ ] Código usa `path.join()` ou caminhos relativos

---

## 4️⃣ **BUILD LOCAL (10 minutos)**

### ✅ Testar build

```powershell
# Frontend
cd frontend
npm install
npm run build
# Deve criar pasta dist/ sem erros

# Backend
cd ..\backend
npm install
# Deve instalar sem erros
```

- [ ] Frontend faz build sem erros
- [ ] Backend instala dependências sem erros
- [ ] Pasta `frontend\dist` foi criada

---

## 5️⃣ **PREPARAÇÃO (10 minutos)**

### ✅ Executar script

```powershell
# Na pasta raiz do projeto
.\prepare-deploy.ps1
```

**Deve criar:**
- [ ] Pasta `deploy-ready\`
- [ ] Pasta `deploy-ready\backend\` com arquivos
- [ ] Pasta `deploy-ready\frontend-dist\` com build
- [ ] Arquivo `deploy-ready\backend\.env` (cópia do .env.production)

### ✅ Verificar conteúdo

```powershell
# Backend deve ter:
ls deploy-ready\backend\
# server.ts, package.json, routes/, config/, etc.

# Frontend deve ter:
ls deploy-ready\frontend-dist\
# index.html, assets/, etc.
```

---

## 6️⃣ **ACESSO (2 minutos)**

### ✅ Credenciais

- [ ] Tenho usuário e senha SSH para: `31.97.255.226`
- [ ] Tenho acesso ao painel HostGator
- [ ] Tenho credenciais Firebase prontas

### ✅ Ferramentas

- [ ] Cliente SSH instalado (PuTTY, Terminal, PowerShell)
- [ ] Cliente SCP instalado (WinSCP, FileZilla) OU comando `scp`

**Testar conexão SSH:**
```powershell
ssh root@31.97.255.226
# Deve pedir senha e conectar
```

---

## 7️⃣ **DOCUMENTAÇÃO (1 minuto)**

### ✅ Escolher guia

Qual é sua experiência com deploy?

- [ ] 🆕 **Iniciante:** Vou seguir `DEPLOY_VPS_COMPLETO.md`
- [ ] ⚡ **Intermediário:** Vou usar `DEPLOY_CHECKLIST.md`
- [ ] 🚀 **Avançado:** Vou consultar `COMANDOS_DEPLOY.md`

- [ ] Li o arquivo escolhido
- [ ] Tenho a documentação aberta para consulta

---

## 8️⃣ **BACKUP (2 minutos)**

### ✅ Segurança

```powershell
# Fazer backup do projeto
Compress-Archive -Path . -DestinationPath ..\backup-site-adm-$(Get-Date -Format 'yyyyMMdd').zip

# Verificar
ls ..\backup-site-adm-*.zip
```

- [ ] Backup criado
- [ ] Git commit de tudo (se usar Git)

---

## ✅ **CHECKLIST COMPLETO**

Marque todos antes de prosseguir:

### Configuração:
- [ ] `backend\.env.production` configurado
- [ ] `frontend\.env.production` configurado
- [ ] Firebase credenciais corretas

### Arquivos:
- [ ] Scripts `.sh` com LF (não CRLF)
- [ ] Sem caminhos Windows hardcoded
- [ ] `.gitattributes` criado

### Build:
- [ ] Frontend faz build sem erros
- [ ] Backend instala dependências
- [ ] Script `prepare-deploy.ps1` executado
- [ ] Pasta `deploy-ready\` pronta

### Acesso:
- [ ] Acesso SSH funcionando
- [ ] Cliente SCP/SFTP pronto
- [ ] Documentação escolhida

### Segurança:
- [ ] Backup criado
- [ ] Credenciais em `.env` (não no código)
- [ ] `.env` não será commitado no Git

---

## 🚀 **PRONTO PARA DEPLOY!**

Se todos os itens acima estão marcados:

### Próximo passo:
1. Abra: `DEPLOY_VPS_COMPLETO.md` (ou seu guia escolhido)
2. Siga os passos
3. Em 1-2 horas seu site estará no ar!

---

## 🆘 **PROBLEMAS COMUNS**

### ❌ Script prepare-deploy.ps1 dá erro
```powershell
# Permitir execução de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ Build do frontend falha
```powershell
# Limpar e reinstalar
cd frontend
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
npm run build
```

### ❌ SSH não conecta
```powershell
# Verificar se porta 22 está aberta
Test-NetConnection -ComputerName 31.97.255.226 -Port 22

# Testar com verbose
ssh -v root@31.97.255.226
```

---

## 📞 **PRECISA DE AJUDA?**

1. Consulte: `COMPATIBILIDADE_WINDOWS_LINUX.md`
2. Veja: `DEPLOY_VPS_COMPLETO.md#troubleshooting`
3. Verifique os logs de erro

---

**Tempo total desta verificação:** ~30 minutos

**Depois de concluir:** Vá para o deploy! 🚀

# 🏗️ BUILDAR NO SERVIDOR - GUIA COMPLETO

## 🎯 DUAS OPÇÕES DE DEPLOY

Você pode escolher entre buildar no Windows ou no servidor. Ambas funcionam!

---

## 📊 COMPARAÇÃO RÁPIDA

| Aspecto | Windows + SFTP | Servidor (Build lá) |
|---------|----------------|---------------------|
| **Velocidade** | ⚡ Rápido | 🐢 Mais lento |
| **Facilidade** | ✅ Automático (script) | 📚 Manual |
| **Recursos** | 💚 Poupa servidor | 🔥 Usa CPU/RAM servidor |
| **Quando usar** | Recomendado | Servidor potente |
| **Ideal para** | Deploy rápido | CI/CD automático |

---

## 🚀 OPÇÃO A: BUILDAR NO WINDOWS (Recomendado)

### ✅ Vantagens:
- Mais rápido
- Economiza recursos do servidor
- Script automatizado
- Menos chance de erro

### 📝 Como fazer:

```powershell
# 1. No Windows
.\prepare-deploy.ps1

# 2. Enviar arquivos
scp -r .\deploy-ready\backend\* root@31.97.255.226:/var/www/site-adm-app/backend/
scp -r .\deploy-ready\frontend-dist\* root@31.97.255.226:/var/www/site-adm-app/frontend-dist/

# 3. No servidor, apenas instalar backend
ssh root@31.97.255.226
cd /var/www/site-adm-app/backend
npm install --production
pm2 start ecosystem.config.js
```

**Tempo:** ~20 minutos

---

## 🏗️ OPÇÃO B: BUILDAR NO SERVIDOR

### ✅ Vantagens:
- Tudo no mesmo lugar
- Bom para CI/CD
- Garantia de ambiente igual

### ⚠️ Desvantagens:
- Mais lento
- Usa recursos do servidor
- Precisa de mais memória RAM

---

## 📝 PASSO A PASSO - BUILDAR NO SERVIDOR

### **1. Enviar código fonte (NÃO o build)**

#### Via SCP:
```powershell
# Do seu Windows PowerShell
scp -r .\backend root@31.97.255.226:/var/www/site-adm-app/
scp -r .\frontend root@31.97.255.226:/var/www/site-adm-app/
```

#### Via WinSCP/FileZilla:
1. Conecte em `31.97.255.226`
2. Navegue até `/var/www/site-adm-app/`
3. Envie as pastas:
   - `backend/` completa
   - `frontend/` completa

**Não envie:**
- ❌ `node_modules/`
- ❌ `frontend/dist/`
- ❌ `backend/.env` (criar no servidor)

---

### **2. Conectar no servidor**

```bash
ssh root@31.97.255.226
cd /var/www/site-adm-app
```

---

### **3. OPÇÃO 3A: Usar o script automático**

```bash
# O script faz tudo automaticamente
bash build-no-servidor.sh
```

**O script vai:**
- ✅ Instalar dependências do frontend
- ✅ Fazer build do frontend
- ✅ Copiar build para `frontend-dist/`
- ✅ Instalar dependências do backend
- ✅ Configurar PM2
- ✅ Verificar tudo

**Tempo:** ~10-15 minutos

---

### **3. OPÇÃO 3B: Fazer manualmente**

#### **3B.1 - Frontend:**

```bash
# Ir para pasta do frontend
cd /var/www/site-adm-app/frontend

# Verificar Node.js
node --version  # Deve ser v18+

# Instalar dependências
echo "Instalando dependências do frontend..."
npm install

# Verificar memória disponível (build precisa de RAM)
free -h

# Build de produção
echo "Fazendo build..."
npm run build

# Verificar se build foi criado
ls -lh dist/
# Deve ter: index.html, assets/, etc.

# Copiar build para pasta de produção
cd ..
mkdir -p frontend-dist
cp -r frontend/dist/* frontend-dist/

# Verificar
ls -lh frontend-dist/
```

#### **3B.2 - Backend:**

```bash
# Ir para pasta do backend
cd /var/www/site-adm-app/backend

# Instalar dependências de produção
npm install --production

# Criar pasta uploads
mkdir -p uploads
chmod 755 uploads

# Configurar .env
nano .env
# Cole as configurações (Firebase, etc.)
# Ctrl+X, Y, Enter para salvar

# Testar se inicia (opcional)
npm run dev
# Ctrl+C para parar

# Iniciar com PM2
pm2 start ecosystem.config.js

# Ou sem ecosystem:
pm2 start server.ts --name site-adm-estagio-backend --interpreter ts-node

# Salvar configuração
pm2 save
pm2 startup  # Execute o comando que aparecer
```

#### **3B.3 - Nginx:**

```bash
# Recarregar Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

### **4. Verificar**

```bash
# Status PM2
pm2 status

# Logs
pm2 logs site-adm-estagio-backend

# Testar backend
curl http://localhost:3001/health

# Testar frontend
curl http://localhost

# Ver arquivos frontend
ls -lh /var/www/site-adm-app/frontend-dist/
```

---

## 🔧 TROUBLESHOOTING

### ❌ "npm install" fica travado

**Problema:** Pouca memória RAM

**Solução:**
```bash
# Ver memória
free -h

# Aumentar swap (se preciso)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Tentar novamente
npm install
```

### ❌ "Build do frontend falha: JavaScript heap out of memory"

**Problema:** Build do React precisa de muita RAM

**Solução 1:** Aumentar limite de memória
```bash
# Temporariamente
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

**Solução 2:** Buildar no Windows
```powershell
# No seu PC
cd frontend
npm run build
scp -r .\dist\* root@31.97.255.226:/var/www/site-adm-app/frontend-dist/
```

### ❌ "Permission denied"

```bash
# Ajustar permissões
sudo chown -R $USER:$USER /var/www/site-adm-app
chmod -R 755 /var/www/site-adm-app
```

### ❌ "Module not found: ts-node"

```bash
# Instalar globalmente
sudo npm install -g ts-node typescript

# Ou localmente
npm install --save-dev ts-node typescript
```

---

## 📋 CHECKLIST - BUILD NO SERVIDOR

### Antes de começar:
- [ ] Servidor tem pelo menos 1GB RAM livre
- [ ] Node.js 18+ instalado
- [ ] npm instalado
- [ ] Espaço em disco suficiente (2GB+)

### Durante o build:
- [ ] Código fonte enviado (sem node_modules)
- [ ] .env.production configurado
- [ ] npm install frontend completou
- [ ] npm run build frontend completou
- [ ] Build copiado para frontend-dist/
- [ ] npm install backend completou
- [ ] PM2 iniciou backend
- [ ] Nginx recarregado

### Depois do build:
- [ ] pm2 status mostra app rodando
- [ ] curl http://localhost:3001/health retorna OK
- [ ] curl http://localhost retorna HTML
- [ ] Site abre no navegador

---

## 🎯 QUAL OPÇÃO ESCOLHER?

### Escolha **OPÇÃO A (Windows)** se:
- ✅ Quer deploy rápido
- ✅ Servidor tem pouca RAM (<2GB)
- ✅ Primeira vez fazendo deploy
- ✅ Conexão internet boa (para enviar build)

### Escolha **OPÇÃO B (Servidor)** se:
- ✅ Servidor tem RAM suficiente (2GB+)
- ✅ Quer automatizar com CI/CD
- ✅ Conexão lenta (melhor buildar lá)
- ✅ Deploy frequente

---

## 💡 DICAS

### Para deploy recorrente:

**Criar script de update:**
```bash
#!/bin/bash
# update-site.sh

cd /var/www/site-adm-app

# Pull do Git (se usar)
git pull origin main

# Rebuild frontend
cd frontend
npm install
npm run build
cp -r dist/* ../frontend-dist/

# Update backend
cd ../backend
npm install --production

# Restart
pm2 restart site-adm-estagio-backend
```

---

## 📚 ARQUIVOS ÚTEIS

| Arquivo | Descrição |
|---------|-----------|
| `build-no-servidor.sh` | Script automático para buildar no servidor |
| `prepare-deploy.ps1` | Script para buildar no Windows |
| `DEPLOY_VPS_COMPLETO.md` | Guia completo de deploy |
| `COMANDOS_DEPLOY.md` | Referência de comandos |

---

## 🚀 RESUMO

### Opção A: Windows (Recomendado)
```
Windows → Build → Enviar build → Servidor instala backend
⏱️ 20 min | 💚 Poupa servidor | ⚡ Rápido
```

### Opção B: Servidor
```
Windows → Enviar código → Servidor builda tudo → Instala tudo
⏱️ 30-40 min | 🔥 Usa servidor | 📚 Mais complexo
```

---

**Recomendação:** Use a **Opção A** (buildar no Windows) a menos que tenha um motivo específico para buildar no servidor (CI/CD, servidor potente, etc).

**Script criado:** `build-no-servidor.sh` - Use se quiser buildar no servidor automaticamente!

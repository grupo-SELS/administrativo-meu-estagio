# 🚀 GUIA DE DEPLOYMENT PASSO A PASSO

**Atualizado**: October 22, 2025  
**Status**: ✅ Pronto para Produção  
**Erros SonarQube**: 0

## 📋 Pré-Requisitos

- [ ] VPS com Linux (Ubuntu 20.04 LTS recomendado)
- [ ] Node.js 18+ instalado
- [ ] npm ou yarn
- [ ] Nginx instalado
- [ ] SSL Certificate (Let's Encrypt)
- [ ] Firebase service account key (nova e revogada a anterior)
- [ ] Git instalado

---

## 🔐 STEP 1: Preparar Firebase Service Account (LOCAL)

Antes de fazer deploy, gere uma NOVA chave Firebase:

```bash
# 1. Acesse Firebase Console
https://console.firebase.google.com/project/registro-itec-dcbc4/settings/serviceaccounts/adminsdk

# 2. Clique em "Generate new private key"
# 3. Baixe o arquivo JSON
# 4. ⚠️ NUNCA commite este arquivo!
# 5. Guarde em local seguro (fora do git)
```

**Importante**: A chave anterior foi revogada. Use apenas a nova chave.

---

## 🖥️ STEP 2: Configurar VPS

### 2.1 SSH para VPS

```bash
ssh seu-usuario@seu-servidor

# Se usar chave SSH:
ssh -i ~/.ssh/sua-chave.pem seu-usuario@seu-servidor
```

### 2.2 Atualizar Sistema

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 2.3 Instalar Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verificar >= 18.0.0
npm --version
```

### 2.4 Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.5 Instalar PM2 (para gerenciar processos)

```bash
sudo npm install -g pm2
pm2 startup
pm2 save
```

---

## 📦 STEP 3: Clonar Repositório

```bash
# Criar diretório
sudo mkdir -p /var/www/site-adm-app
sudo chown -R $USER:$USER /var/www/site-adm-app
cd /var/www/site-adm-app

# Clonar repositório
git clone https://github.com/grupo-SELS/administrativo-meu-estagio.git .

# Verificar main branch
git branch -a
```

---

## 🔧 STEP 4: Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Voltar para raiz
cd ..
```

---

## 🔐 STEP 5: Configurar Credenciais (SEM EXPOR CHAVE)

### 5.1 Copiar chave Firebase para VPS (SEGURO)

**LOCAL (seu computador):**

```bash
# Se sua chave está em Downloads:
scp ~/Downloads/registro-itec-dcbc4-firebase-adminsdk-fbsvc-*.json \
  seu-usuario@seu-servidor:/tmp/

# Ou com chave SSH:
scp -i ~/.ssh/sua-chave.pem ~/Downloads/registro-itec-dcbc4-firebase-adminsdk-fbsvc-*.json \
  seu-usuario@seu-servidor:/tmp/
```

### 5.2 Mover chave para local seguro (NO VPS)

```bash
# SSH no VPS
ssh seu-usuario@seu-servidor

# Mover arquivo para backend
mkdir -p /var/www/site-adm-app/backend/config
mv /tmp/registro-itec-dcbc4-firebase-adminsdk-fbsvc-*.json \
   /var/www/site-adm-app/backend/config/serviceAccountKey.json

# Proteger arquivo
chmod 600 /var/www/site-adm-app/backend/config/serviceAccountKey.json

# Verificar
ls -la /var/www/site-adm-app/backend/config/
```

### 5.3 Configurar .env para Produção (NO VPS)

```bash
cd /var/www/site-adm-app/backend

# Copiar arquivo de exemplo
cp .env.production.example .env

# Editar arquivo
nano .env
```

**Edite estas linhas:**

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://seu-dominio.com
FIREBASE_STORAGE_BUCKET=registro-itec-dcbc4.appspot.com
JWT_SECRET=use-um-valor-aleatorio-e-seguro-aqui
CORS_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
```

**Deixe comentada a linha:**
```bash
# FIREBASE_SERVICE_ACCOUNT=...
```

O código vai procurar automaticamente em `config/serviceAccountKey.json`

---

## 🔨 STEP 6: Build Frontend

```bash
cd /var/www/site-adm-app/frontend

# Gerar build
npm run build

# Verificar se dist/ foi criado
ls -la dist/
```

---

## 🚀 STEP 7: Iniciar Backend com PM2

```bash
cd /var/www/site-adm-app/backend

# Iniciar processo
pm2 start "npm run dev" --name "api-estagio" --env production

# Salvar configuração
pm2 save

# Verificar status
pm2 status
pm2 logs api-estagio
```

**Se der erro, verificar:**

```bash
pm2 logs api-estagio  # Ver logs completos
pm2 monit              # Ver uso de CPU/memória
```

---

## 🌐 STEP 8: Configurar Nginx

### 8.1 Criar arquivo de configuração

```bash
sudo nano /etc/nginx/sites-available/site-adm-app
```

**Colar este conteúdo:**

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # SSL - deixe em branco por enquanto, certbot vai preencher
    # ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Frontend (React)
    location / {
        root /var/www/site-adm-app/frontend/dist;
        try_files $uri /index.html;
        
        # Caching
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
```

### 8.2 Habilitar configuração

```bash
sudo ln -s /etc/nginx/sites-available/site-adm-app \
           /etc/nginx/sites-enabled/site-adm-app

# Teste sintaxe
sudo nginx -t

# Se OK, restart
sudo systemctl restart nginx
```

---

## 🔒 STEP 9: Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Seguir instruções interativas
```

**Certbot vai:**
- Validar domínio
- Gerar certificado
- Atualizar Nginx automaticamente
- Configurar renovação automática

---

## ✅ STEP 10: Testar Deployment

### 10.1 Verificar Backend

```bash
curl http://localhost:3001/api/alunos
# Deve retornar JSON com dados de alunos
```

### 10.2 Verificar Frontend

```bash
curl https://seu-dominio.com/
# Deve retornar HTML da aplicação React
```

### 10.3 Verificar API via domínio

```bash
curl https://seu-dominio.com/api/alunos
# Deve retornar JSON com dados
```

### 10.4 Verificar Nginx

```bash
sudo systemctl status nginx
ps aux | grep node
pm2 status
```

---

## 🐛 TROUBLESHOOTING

### Backend não inicia

```bash
# Ver logs
pm2 logs api-estagio

# Verificar porta
sudo lsof -i :3001

# Verificar .env
cat backend/.env

# Verificar chave Firebase
ls -la backend/config/serviceAccountKey.json
```

### Nginx retorna 502

```bash
# Verificar se backend está rodando
pm2 status

# Verificar log do nginx
sudo tail -50 /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

### Certificado SSL não funciona

```bash
# Renovar certificado
sudo certbot renew --dry-run

# Ver certificados
sudo certbot certificates

# Renew manual
sudo certbot renew
```

### Credenciais Firebase não funcionam

```bash
# Verificar arquivo
file backend/config/serviceAccountKey.json

# Verificar permissões
chmod 600 backend/config/serviceAccountKey.json

# Verificar conteúdo (primeiras linhas)
head -5 backend/config/serviceAccountKey.json

# Deve ter: "type": "service_account"
```

---

## 📊 Monitoramento Contínuo

```bash
# Ver status dos processos
pm2 status

# Ver logs em tempo real
pm2 logs api-estagio

# Ver uso de recursos
pm2 monit

# Salvar configuração (backup)
pm2 save

# Listar processos salvos
pm2 list
```

---

## 🔄 Atualizações Futuras

Quando precisar fazer deploy de atualizações:

```bash
cd /var/www/site-adm-app

# Trazer atualizações
git pull origin main

# Backend
cd backend && npm install && npm run build && cd ..

# Frontend
cd frontend && npm install && npm run build && cd ..

# Restart backend
pm2 restart api-estagio

# Reload Nginx
sudo systemctl reload nginx
```

---

## ✨ Bom Luck! 🚀

Se tiver dúvidas, consulte:
- 📋 `DEPLOY_CHECKLIST_RAPIDO.md` - Checklist rápido
- 🔐 `SECURITY_PRE_DEPLOY.md` - Segurança
- 📚 `README.md` - Documentação geral


## ✅ PRÉ-REQUISITOS
- [ ] Servidor VPS com SSH acesso
- [ ] Node.js 18+ instalado no servidor
- [ ] Domínio apontando para o servidor
- [ ] Firebase projeto configurado
- [ ] serviceAccountKey.json salvo localmente

---

## 📋 PARTE 1: PREPARAÇÃO LOCAL (Seu Computador)

### 1.1 Build Frontend
```bash
cd frontend
npm install
npm run build
```
✅ Isso cria a pasta `frontend/dist/` com os arquivos prontos

### 1.2 Verificar Backend
```bash
cd backend
npm install
```
✅ Garante que todas as dependências estão instaladas

### 1.3 Preparar Arquivos
```bash
# Copiar o build do frontend
scp -r frontend/dist/* seu-usuario@seu-servidor:/var/www/seu-dominio/

# Copiar o backend
scp -r backend/* seu-usuario@seu-servidor:/home/seu-usuario/site-adm-app/backend/
```

---

## 📋 PARTE 2: CONFIGURAÇÃO NO SERVIDOR (SSH)

### 2.1 Conectar ao Servidor
```bash
ssh seu-usuario@seu-servidor.com
```

### 2.2 Ir para a Pasta do Backend
```bash
cd /home/seu-usuario/site-adm-app/backend
```

### 2.3 Instalar Dependências de Produção
```bash
npm install --production
npm prune
```

### 2.4 Copiar Service Account Key
```bash
# Criar pasta config se não existir
mkdir -p config

# Copiar o arquivo serviceAccountKey.json
# (De seu computador para o servidor)
scp config/serviceAccountKey.json seu-usuario@seu-servidor:/home/seu-usuario/site-adm-app/backend/config/
```

### 2.5 Configurar Variáveis de Ambiente
```bash
nano .env
```

Adicionar:
```env
NODE_ENV=production
PORT=3001
FIREBASE_PROJECT_ID=seu-projeto-firebase
```

Salvar com `Ctrl+O`, Enter, `Ctrl+X`

### 2.6 Instalar PM2 (Gerenciador de Processos)
```bash
sudo npm install -g pm2
```

### 2.7 Iniciar Backend com PM2
```bash
pm2 start server.ts --name "api-estagio" --interpreter ts-node
pm2 save
pm2 startup
```

✅ Backend está rodando!

---

## 📋 PARTE 3: CONFIGURAÇÃO DO SERVIDOR WEB (NGINX)

### 3.1 Instalar Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 3.2 Criar Arquivo de Configuração
```bash
sudo nano /etc/nginx/sites-available/seu-dominio.com
```

Adicionar:
```nginx
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS - Frontend
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    root /var/www/seu-dominio;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salvar com `Ctrl+O`, Enter, `Ctrl+X`

### 3.3 Habilitar Configuração
```bash
sudo ln -s /etc/nginx/sites-available/seu-dominio.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3.4 Instalar SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

✅ SSL configurado automaticamente!

---

## 📋 PARTE 4: ATUALIZAR CÓDIGO (Local)

### 4.1 Atualizar ALLOWED_ORIGINS no Backend
```bash
# Em seu computador
nano backend/server.ts
```

Procurar por `ALLOWED_ORIGINS` (linha ~23) e atualizar:
```typescript
const ALLOWED_ORIGINS = [
  'https://seu-dominio.com',
  'https://www.seu-dominio.com'
];
```

### 4.2 Fazer Commit
```bash
git add -A
git commit -m "Deploy: Atualizar configurações para produção"
git push
```

### 4.3 Atualizar no Servidor
```bash
# SSH no servidor
ssh seu-usuario@seu-servidor.com

# Atualizar código
cd /home/seu-usuario/site-adm-app/backend
git pull

# Reiniciar backend
pm2 restart api-estagio
```

---

## 🧪 PARTE 5: TESTES PÓS-DEPLOY

### 5.1 Verificar Backend
```bash
curl https://seu-dominio.com/api/health
# Deve retornar status 200
```

### 5.2 Verificar Frontend
```bash
# Abrir navegador: https://seu-dominio.com
# Deve carregar a página normalmente
```

### 5.3 Testar Login
- [ ] Acesse https://seu-dominio.com
- [ ] Faça login com sua conta
- [ ] Verifique se consegue acessar as funcionalidades

### 5.4 Verificar Console
- [ ] Abrir DevTools (F12)
- [ ] Verificar se há erros de CORS
- [ ] Verificar se as requisições para `/api/` estão funcionando

---

## 📊 MONITORAMENTO (Servidor)

### Ver Status da Aplicação
```bash
pm2 list
pm2 monit
pm2 logs api-estagio
```

### Ver Logs do Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Automático
```bash
# Se a aplicação cair, PM2 reinicia automaticamente
pm2 restart api-estagio
```

---

## 🔄 ATUALIZAÇÕES FUTURAS

Quando precisar atualizar o código:

### Backend
```bash
# No servidor
cd /home/seu-usuario/site-adm-app/backend
git pull
npm install --production
pm2 restart api-estagio
```

### Frontend
```bash
# No seu computador
cd frontend
git pull
npm run build

# Copiar para servidor
scp -r dist/* seu-usuario@seu-servidor:/var/www/seu-dominio/
```

---

## 🆘 TROUBLESHOOTING

### Backend não conecta
```bash
# Verificar se está rodando
pm2 list

# Ver logs
pm2 logs api-estagio

# Reiniciar
pm2 restart api-estagio
```

### Erro de CORS
- Verificar se `ALLOWED_ORIGINS` está correto no server.ts
- Verificar protocolo (http vs https)
- Reiniciar backend com `pm2 restart api-estagio`

### Nginx erro
```bash
sudo nginx -t  # Verificar configuração
sudo systemctl restart nginx
```

### Certificado SSL expirado
```bash
sudo certbot renew --dry-run  # Testar renovação
sudo certbot renew  # Renovar certificado
```

---

## ✅ CHECKLIST FINAL

- [ ] Backend rodando (`pm2 list` mostra "online")
- [ ] Frontend carregando (`https://seu-dominio.com`)
- [ ] SSL funcionando (cadeado verde no navegador)
- [ ] API respondendo (`curl https://seu-dominio.com/api/health`)
- [ ] Login funcionando
- [ ] Sem erros de CORS no console (F12)
- [ ] Sem erros no `pm2 logs`

---

## 🎉 PRONTO PARA PRODUÇÃO!

Seu aplicativo está rodando em produção! 🚀

**Para suporte adicional, consulte:**
- `GUIA_DEPLOY.md` - Guia completo
- `PRODUCAO_CHECKLIST.md` - Checklist de segurança
- `TROUBLESHOOTING.md` - Troubleshooting

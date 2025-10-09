# 🚀 Guia de Deploy para Produção

## 📋 Pré-requisitos

- [x] Node.js 18+ instalado
- [x] Firebase Project configurado
- [x] Servidor com HTTPS configurado
- [x] Domínio configurado
- [x] Acesso SSH ao servidor

## 🔧 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

#### Backend (.env)
```env
NODE_ENV=production
PORT=3001
FIREBASE_PROJECT_ID=seu-projeto-id
ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.seu-dominio.com
VITE_ENV=production
VITE_FIREBASE_API_KEY=sua-chave
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
VITE_FIREBASE_APP_ID=seu-app-id
```

### 2. Atualizar Código

#### Backend - server.ts
```typescript
// Linha ~23
const ALLOWED_ORIGINS = [
  'https://seu-dominio.com',
  'https://www.seu-dominio.com'
];
```

#### Frontend - apiService.ts
```typescript
// Linha 1
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.seu-dominio.com';
```

## 📦 Build

### Backend
```bash
cd backend
npm install --production
npm prune
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

O build será gerado em `frontend/dist/`

## 🚀 Deploy

### Opção 1: VPS/Servidor Dedicado

#### Backend
```bash
# SSH no servidor
ssh usuario@seu-servidor.com

# Clonar repositório
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo/backend

# Instalar dependências
npm install --production

# Configurar variáveis de ambiente
nano .env

# Copiar serviceAccountKey.json
nano config/serviceAccountKey.json

# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start server.ts --name "api-estagio" --interpreter ts-node
pm2 save
pm2 startup
```

#### Frontend
```bash
# Servidor web (Nginx)
sudo apt install nginx

# Copiar build
scp -r dist/* usuario@servidor:/var/www/seu-dominio/

# Configurar Nginx
sudo nano /etc/nginx/sites-available/seu-dominio
```

Configuração Nginx:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    root /var/www/seu-dominio;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

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

### Opção 2: Vercel (Frontend) + Heroku/Railway (Backend)

#### Frontend (Vercel)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Backend (Heroku)
```bash
# Instalar Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Criar app
heroku create seu-app-api

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set FIREBASE_PROJECT_ID=seu-projeto

# Deploy
git subtree push --prefix backend heroku main
```

### Opção 3: Firebase Hosting + Cloud Run

#### Frontend (Firebase Hosting)
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Deploy
firebase deploy --only hosting
```

#### Backend (Cloud Run)
```bash
# Criar Dockerfile no backend
nano backend/Dockerfile
```

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "--require", "ts-node/register", "server.ts"]
```

```bash
# Build e deploy
gcloud builds submit --tag gcr.io/seu-projeto/api-estagio
gcloud run deploy api-estagio --image gcr.io/seu-projeto/api-estagio --platform managed
```

## 🔒 SSL/HTTPS

### Let's Encrypt (Grátis)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## 📊 Monitoramento

### PM2 Monitor
```bash
pm2 monit
pm2 logs
pm2 list
```

### Logs
```bash
# Backend logs
pm2 logs api-estagio

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🧪 Testes Pós-Deploy

### Testes Automáticos
```bash
# Health check
curl https://api.seu-dominio.com/health

# Teste de API
curl -X GET https://api.seu-dominio.com/api/alunos
```

### Testes Manuais
- [ ] Acesse https://seu-dominio.com
- [ ] Faça login
- [ ] Teste todas as funcionalidades principais
- [ ] Verifique console do navegador (não deve ter erros)
- [ ] Teste em mobile
- [ ] Teste em diferentes navegadores

## 🔄 Atualizações

### Atualizar Backend
```bash
cd backend
git pull
npm install
pm2 restart api-estagio
```

### Atualizar Frontend
```bash
cd frontend
git pull
npm install
npm run build
# Copiar dist/ para servidor
```

## 🆘 Troubleshooting

### Backend não inicia
```bash
# Ver logs
pm2 logs api-estagio

# Verificar porta
sudo netstat -tulpn | grep :3001

# Verificar variáveis de ambiente
pm2 env 0
```

### Erros de CORS
- Verificar ALLOWED_ORIGINS no server.ts
- Verificar protocolo (http vs https)
- Verificar domínio correto

### Firebase não conecta
- Verificar serviceAccountKey.json
- Verificar FIREBASE_PROJECT_ID
- Verificar regras do Firestore

## 📝 Manutenção

### Backup Diário
```bash
# Configurar cron job
crontab -e

# Adicionar linha:
0 2 * * * /home/usuario/backup-script.sh
```

### Atualizar Dependências
```bash
# Backend
npm update
npm audit fix

# Frontend  
npm update
npm audit fix
```

## 🔐 Segurança Contínua

### Checklist Mensal
- [ ] Atualizar dependências
- [ ] Revisar logs de acesso
- [ ] Verificar certificado SSL
- [ ] Testar backup/restore
- [ ] Revisar regras do Firestore
- [ ] Verificar uso de recursos

---

## ✅ Deploy Checklist Final

- [ ] Variáveis de ambiente configuradas
- [ ] ALLOWED_ORIGINS atualizado
- [ ] API_BASE_URL atualizado
- [ ] serviceAccountKey.json no servidor
- [ ] SSL configurado
- [ ] DNS configurado
- [ ] Build testado localmente
- [ ] Deploy realizado
- [ ] Testes pós-deploy executados
- [ ] Monitoramento configurado
- [ ] Backup configurado
- [ ] Documentação atualizada

**Boa sorte com o deploy! 🚀**

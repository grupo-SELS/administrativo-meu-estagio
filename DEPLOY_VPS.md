# Guia de Deploy na VPS

## Checklist de Configuracao

### 1. Backend - Configuracao e Deploy

#### 1.1 Configurar Variaveis de Ambiente
Crie o arquivo `backend/.env` na VPS:

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://31.97.255.226

# Firebase Admin SDK
# Adicione suas credenciais do Firebase aqui
```

#### 1.2 Verificar serviceAccountKey.json
Certifique-se de que o arquivo `backend/config/serviceAccountKey.json` existe na VPS com as credenciais corretas do Firebase Admin SDK.

#### 1.3 Instalar Dependencias
```bash
cd backend
npm install
```

#### 1.4 Compilar TypeScript
```bash
npm run build
```

#### 1.5 Iniciar Backend
```bash
# Producao
npm run start

# Ou com PM2 (recomendado)
pm2 start dist/server.js --name "site-adm-backend"
pm2 save
pm2 startup
```

#### 1.6 Testar Backend
```bash
# Teste health check
curl http://31.97.255.226:3001/health

# Teste API alunos
curl http://31.97.255.226:3001/api/alunos

# Teste API professores
curl http://31.97.255.226:3001/api/professores
```

### 2. Frontend - Configuracao e Deploy

#### 2.1 Variaveis de Ambiente
O arquivo `.env.production` ja foi criado com:
```
VITE_API_URL=http://31.97.255.226:3001/api
VITE_ENV=production
```

#### 2.2 Instalar Dependencias
```bash
cd frontend
npm install
```

#### 2.3 Build de Producao
```bash
npm run build
```

Isso criara a pasta `frontend/dist/` com os arquivos estaticos otimizados.

#### 2.4 Servir Frontend

**Opcao A: Nginx (Recomendado)**
```nginx
server {
    listen 80;
    server_name 31.97.255.226;

    root /caminho/para/site-adm-app/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API se necessario
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

**Opcao B: Serve (Simples)**
```bash
npm install -g serve
serve -s dist -l 80
```

**Opcao C: PM2 com Serve**
```bash
pm2 serve dist 80 --name "site-adm-frontend" --spa
pm2 save
```

### 3. Firewall e Portas

Certifique-se de que as portas estao abertas:
```bash
# Ubuntu/Debian com UFW
sudo ufw allow 80/tcp
sudo ufw allow 3001/tcp
sudo ufw enable

# CentOS/RHEL com firewalld
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 4. Verificacao de Deploy

#### 4.1 Backend
- [ ] Backend rodando: `curl http://31.97.255.226:3001/health`
- [ ] CORS configurado com origem `http://31.97.255.226`
- [ ] Firebase Admin SDK configurado
- [ ] Variavel NODE_ENV=production

#### 4.2 Frontend
- [ ] Build gerado em `dist/`
- [ ] Servidor web servindo arquivos estaticos
- [ ] Acessivel em `http://31.97.255.226`
- [ ] API_BASE_URL apontando para backend

#### 4.3 Testes Funcionais
Teste no navegador em `http://31.97.255.226`:
- [ ] Login funciona
- [ ] Listar alunos
- [ ] Criar aluno
- [ ] Listar professores
- [ ] Criar professor
- [ ] Pagina de agendamento carrega
- [ ] Criar agendamento
- [ ] Listar comunicados
- [ ] Criar comunicado

### 5. Solucao de Problemas

#### Erro: "failed to fetch"
**Causa**: Frontend nao consegue conectar ao backend

**Solucao**:
1. Verifique se backend esta rodando: `pm2 status` ou `netstat -tlnp | grep 3001`
2. Teste API diretamente: `curl http://31.97.255.226:3001/health`
3. Verifique CORS no `backend/server.ts` - deve incluir `http://31.97.255.226`
4. Verifique firewall: porta 3001 deve estar aberta

#### Erro: CORS policy
**Causa**: Backend nao permite requisicoes da origem do frontend

**Solucao**:
1. Verifique `ALLOWED_ORIGINS` em `backend/server.ts`
2. Adicione a origem correta (com http:// e sem barra final)
3. Reconstrua backend: `npm run build`
4. Reinicie backend: `pm2 restart site-adm-backend`

#### Erro: 404 Not Found nas rotas
**Causa**: Servidor web nao configurado para SPA

**Solucao**:
- Nginx: use `try_files $uri $uri/ /index.html;`
- Serve: use flag `--spa` ou `-s`
- PM2: use `pm2 serve dist 80 --spa`

#### Erro: Firebase Auth
**Causa**: Credenciais Firebase incorretas ou nao configuradas

**Solucao**:
1. Backend: Verifique `backend/config/serviceAccountKey.json`
2. Frontend: Configure Firebase no `.env.production` (se necessario)
3. Verifique se dominio VPS esta autorizado no Firebase Console

### 6. Manutencao

#### Atualizar Backend
```bash
cd backend
git pull  # ou copie arquivos atualizados
npm install
npm run build
pm2 restart site-adm-backend
```

#### Atualizar Frontend
```bash
cd frontend
git pull  # ou copie arquivos atualizados
npm install
npm run build
# Nao precisa reiniciar - arquivos estaticos ja foram atualizados
```

#### Ver Logs
```bash
# Logs do PM2
pm2 logs site-adm-backend
pm2 logs site-adm-frontend

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 7. Seguranca em Producao

- [ ] Desabilitar x-dev-bypass (automatico quando NODE_ENV=production)
- [ ] Firebase Auth obrigatorio para todas operacoes de escrita
- [ ] Rate limiting ativo (configurado em server.ts)
- [ ] serviceAccountKey.json nao esta no git (.gitignore)
- [ ] Firestore Security Rules revisadas
- [ ] HTTPS configurado (Let's Encrypt recomendado)
- [ ] Backup automatico do Firestore

### 8. Configuracao HTTPS (Opcional mas Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado (requer dominio)
sudo certbot --nginx -d seudominio.com

# Auto-renovacao
sudo certbot renew --dry-run
```

Atualize `.env.production`:
```
VITE_API_URL=https://seudominio.com/api
```

E ALLOWED_ORIGINS em `server.ts`:
```typescript
const ALLOWED_ORIGINS = [
  'https://seudominio.com',
  // ...
];
```

## Resumo dos Comandos

```bash
# === BACKEND ===
cd backend
npm install
npm run build
pm2 start dist/server.js --name "site-adm-backend"
pm2 save

# === FRONTEND ===
cd frontend
npm install
npm run build
pm2 serve dist 80 --name "site-adm-frontend" --spa
pm2 save

# === VERIFICACAO ===
pm2 status
curl http://31.97.255.226:3001/health
curl http://31.97.255.226:3001/api/alunos

# Acesse no navegador: http://31.97.255.226
```

---

**Ultima atualizacao**: Janeiro 2025

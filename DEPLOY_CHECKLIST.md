# 🚀 DEPLOY RÁPIDO - CHECKLIST

## ⚡ PASSOS ESSENCIAIS

### 1️⃣ PREPARAÇÃO LOCAL (15 minutos)

- [ ] **Configure Firebase no backend**
  - Edite: `backend\.env.production`
  - Adicione o Service Account Key (JSON completo)
  - Gere JWT_SECRET: `openssl rand -base64 32`

- [ ] **Configure Firebase no frontend**
  - Edite: `frontend\.env.production`
  - Adicione as credenciais do Firebase Web App

- [ ] **Execute o script de preparação**
  ```powershell
  .\prepare-deploy.ps1
  ```

- [ ] **Verifique a pasta `deploy-ready/`**
  - Deve conter: `backend/` e `frontend-dist/`

---

### 2️⃣ CONFIGURAÇÃO DO SERVIDOR (30 minutos)

Conecte via SSH: `ssh root@31.97.255.226`

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2 ts-node typescript

# Instalar Nginx
sudo apt install -y nginx

# Configurar Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Criar pastas
sudo mkdir -p /var/www/site-adm-app/{backend,frontend-dist,logs}
sudo chown -R $USER:$USER /var/www/site-adm-app
```

---

### 3️⃣ ENVIAR ARQUIVOS (10 minutos)

**Do seu computador (PowerShell):**

```powershell
# Backend
scp -r .\deploy-ready\backend\* root@31.97.255.226:/var/www/site-adm-app/backend/

# Frontend
scp -r .\deploy-ready\frontend-dist\* root@31.97.255.226:/var/www/site-adm-app/frontend-dist/

# Configurações
scp .\nginx-meuestagio.conf root@31.97.255.226:/tmp/
scp .\backend\ecosystem.config.js root@31.97.255.226:/var/www/site-adm-app/backend/
```

---

### 4️⃣ INICIAR BACKEND (5 minutos)

**No servidor (SSH):**

```bash
cd /var/www/site-adm-app/backend

# Instalar dependências
npm install --production

# Criar pasta uploads
mkdir -p uploads

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Execute o comando que aparecer
```

---

### 5️⃣ CONFIGURAR NGINX (10 minutos)

```bash
# Copiar configuração
sudo cp /tmp/nginx-meuestagio.conf /etc/nginx/sites-available/meuestagio.chattec.com.br

# Ativar site
sudo ln -s /etc/nginx/sites-available/meuestagio.chattec.com.br /etc/nginx/sites-enabled/

# Remover default (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx
```

---

### 6️⃣ CONFIGURAR DNS (5 minutos)

**No painel HostGator:**

1. Acesse: Domínios → Zona de DNS
2. Selecione: `meuestagio.chattec.com.br`
3. Adicione/Edite:

   **Registro A:**
   ```
   Nome: @
   Valor: 31.97.255.226
   TTL: 14400
   ```

   **Registro A (www):**
   ```
   Nome: www
   Valor: 31.97.255.226
   TTL: 14400
   ```

4. Salvar e aguardar propagação (15min - 2h)

---

### 7️⃣ TESTAR (5 minutos)

```bash
# Testar backend
curl http://localhost:3001/health

# Testar DNS (do seu PC)
nslookup meuestagio.chattec.com.br

# Abrir no navegador
http://31.97.255.226
http://meuestagio.chattec.com.br
```

---

### 8️⃣ CONFIGURAR SSL (10 minutos)

**No servidor:**

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d meuestagio.chattec.com.br -d www.meuestagio.chattec.com.br

# Seguir instruções na tela
# Escolher: Redirect HTTP to HTTPS (opção 2)
```

---

### ✅ VERIFICAÇÃO FINAL

- [ ] Backend rodando: `pm2 status`
- [ ] Nginx rodando: `sudo systemctl status nginx`
- [ ] Site abre por IP: http://31.97.255.226
- [ ] Site abre por domínio: http://meuestagio.chattec.com.br
- [ ] HTTPS funcionando: https://meuestagio.chattec.com.br
- [ ] Login funciona
- [ ] CRUD funciona
- [ ] Upload de imagens funciona

---

## 🆘 PROBLEMAS COMUNS

### Site não abre
```bash
# Verificar serviços
pm2 status
sudo systemctl status nginx

# Ver logs
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

### Erro 502 Bad Gateway
```bash
# Backend não está rodando
pm2 restart site-adm-estagio-backend
```

### CORS Error
```bash
# Verificar .env do backend
cd /var/www/site-adm-app/backend
nano .env
# Adicionar domínio em CORS_ORIGINS
pm2 restart site-adm-estagio-backend
```

---

## 📚 COMANDOS ÚTEIS

```bash
# PM2
pm2 status                  # Ver status
pm2 logs                    # Ver logs
pm2 restart [nome]          # Reiniciar app
pm2 monit                   # Monitoramento

# Nginx
sudo systemctl status nginx # Status
sudo systemctl reload nginx # Recarregar config
sudo nginx -t              # Testar config

# Ver logs
pm2 logs --lines 100
sudo tail -f /var/log/nginx/meuestagio_error.log
```

---

## 📖 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, consulte: **DEPLOY_VPS_COMPLETO.md**

---

**Tempo total estimado:** 1h30min

**Suporte:** Verifique os logs primeiro, depois consulte o guia completo.

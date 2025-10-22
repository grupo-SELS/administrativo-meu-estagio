# 🚀 COMANDOS PARA DEPLOY - COPIAR E COLAR

## 📋 ÍNDICE
- [Preparação Local](#preparação-local)
- [Configuração Servidor](#configuração-servidor)
- [Enviar Arquivos](#enviar-arquivos)
- [Iniciar Aplicação](#iniciar-aplicação)
- [Configurar Nginx](#configurar-nginx)
- [Configurar SSL](#configurar-ssl)
- [Comandos Úteis](#comandos-úteis)

---

## 💻 PREPARAÇÃO LOCAL

### Windows PowerShell
```powershell
# Executar script de preparação
.\prepare-deploy.ps1

# OU manualmente:
cd frontend
npm install
npm run build
cd ..
```

### Linux/Mac
```bash
# Executar script de preparação
bash prepare-deploy.sh

# OU manualmente:
cd frontend
npm install
npm run build
cd ..
```

---

## 🖥️ CONFIGURAÇÃO SERVIDOR

### Conectar SSH
```bash
ssh root@31.97.255.226
```

### Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw
```

### Instalar Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### Instalar PM2
```bash
sudo npm install -g pm2 ts-node typescript
pm2 --version
```

### Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

### Configurar Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001/tcp
sudo ufw enable
sudo ufw status
```

### Criar Estrutura de Pastas
```bash
sudo mkdir -p /var/www/site-adm-app/backend
sudo mkdir -p /var/www/site-adm-app/frontend-dist
sudo mkdir -p /var/www/site-adm-app/logs
sudo mkdir -p /var/www/certbot
sudo chown -R $USER:$USER /var/www/site-adm-app
sudo chmod -R 755 /var/www/site-adm-app
```

---

## 📤 ENVIAR ARQUIVOS

### Windows PowerShell
```powershell
# Backend
scp -r .\deploy-ready\backend\* root@31.97.255.226:/var/www/site-adm-app/backend/

# Frontend
scp -r .\deploy-ready\frontend-dist\* root@31.97.255.226:/var/www/site-adm-app/frontend-dist/

# Configurações
scp .\nginx-meuestagio.conf root@31.97.255.226:/tmp/
scp .\backend\ecosystem.config.js root@31.97.255.226:/var/www/site-adm-app/backend/
```

### Linux/Mac
```bash
# Backend
scp -r ./deploy-ready/backend/* root@31.97.255.226:/var/www/site-adm-app/backend/

# Frontend
scp -r ./deploy-ready/frontend-dist/* root@31.97.255.226:/var/www/site-adm-app/frontend-dist/

# Configurações
scp ./nginx-meuestagio.conf root@31.97.255.226:/tmp/
scp ./backend/ecosystem.config.js root@31.97.255.226:/var/www/site-adm-app/backend/
```

---

## 🚀 INICIAR APLICAÇÃO

### Configurar Backend
```bash
cd /var/www/site-adm-app/backend
npm install --production
mkdir -p uploads
ls -la
```

### Testar Backend Manualmente (Opcional)
```bash
npm run dev
# Pressione Ctrl+C para parar
```

### Iniciar com PM2
```bash
pm2 start ecosystem.config.js
pm2 status
pm2 logs site-adm-estagio-backend
```

### Configurar PM2 para Auto-start
```bash
pm2 save
pm2 startup
# COPIE E EXECUTE O COMANDO QUE APARECER
```

### Testar Backend
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/comunicados
```

---

## 🌐 CONFIGURAR NGINX

### Copiar Configuração
```bash
sudo cp /tmp/nginx-meuestagio.conf /etc/nginx/sites-available/meuestagio.chattec.com.br
```

### OU Criar Manualmente
```bash
sudo nano /etc/nginx/sites-available/meuestagio.chattec.com.br
```

Cole o conteúdo de `nginx-meuestagio.conf` e salve (Ctrl+X, Y, Enter).

### Ativar Site
```bash
sudo ln -s /etc/nginx/sites-available/meuestagio.chattec.com.br /etc/nginx/sites-enabled/
```

### Remover Default (Opcional)
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Testar e Recarregar
```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx
```

### Ver Logs Nginx
```bash
sudo tail -f /var/log/nginx/meuestagio_error.log
sudo tail -f /var/log/nginx/meuestagio_access.log
```

---

## 🔒 CONFIGURAR SSL

### Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obter Certificado SSL
```bash
sudo certbot --nginx -d meuestagio.chattec.com.br -d www.meuestagio.chattec.com.br
```

**Durante o processo:**
1. Digite seu email
2. Aceite os termos (Y)
3. Compartilhar email com EFF? (N ou Y - opcional)
4. Redirecionar HTTP para HTTPS? **Sim (2)**

### Verificar Certificado
```bash
sudo certbot certificates
```

### Testar Renovação
```bash
sudo certbot renew --dry-run
```

### Verificar Timer de Renovação
```bash
sudo systemctl status certbot.timer
```

---

## 🛠️ COMANDOS ÚTEIS

### PM2

#### Status e Informações
```bash
pm2 status
pm2 show site-adm-estagio-backend
pm2 monit
```

#### Logs
```bash
pm2 logs
pm2 logs site-adm-estagio-backend
pm2 logs --lines 100
pm2 logs --err
```

#### Controle
```bash
pm2 restart site-adm-estagio-backend
pm2 stop site-adm-estagio-backend
pm2 start site-adm-estagio-backend
pm2 delete site-adm-estagio-backend
pm2 reload site-adm-estagio-backend
```

#### Salvar e Restaurar
```bash
pm2 save
pm2 resurrect
pm2 startup
```

### Nginx

#### Status e Controle
```bash
sudo systemctl status nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
```

#### Testar Configuração
```bash
sudo nginx -t
```

#### Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/meuestagio_error.log
sudo tail -f /var/log/nginx/meuestagio_access.log
sudo tail -100 /var/log/nginx/meuestagio_error.log
```

#### Editar Configuração
```bash
sudo nano /etc/nginx/sites-available/meuestagio.chattec.com.br
sudo nginx -t
sudo systemctl reload nginx
```

### Sistema

#### Monitoramento
```bash
htop              # Monitorar CPU/RAM (instalar: sudo apt install htop)
top               # Monitorar processos
df -h             # Espaço em disco
free -h           # Memória RAM
uptime            # Uptime do servidor
```

#### Portas
```bash
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep LISTEN
sudo ss -tulpn
```

#### Firewall
```bash
sudo ufw status
sudo ufw status numbered
sudo ufw enable
sudo ufw disable
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw delete [número]
```

#### Processos
```bash
ps aux | grep node
ps aux | grep nginx
kill [PID]
killall node
```

### Arquivos e Permissões

#### Navegar
```bash
cd /var/www/site-adm-app/backend
cd /var/www/site-adm-app/frontend-dist
cd /var/log/nginx
pwd
ls -la
```

#### Editar
```bash
nano /var/www/site-adm-app/backend/.env
nano /etc/nginx/sites-available/meuestagio.chattec.com.br
```

#### Permissões
```bash
sudo chown -R $USER:$USER /var/www/site-adm-app
sudo chmod -R 755 /var/www/site-adm-app
```

#### Espaço
```bash
du -sh /var/www/site-adm-app/*
df -h
```

### Git (se usar)

```bash
cd /var/www/site-adm-app
git pull origin main
cd backend
npm install --production
pm2 restart site-adm-estagio-backend
cd ../frontend
npm install
npm run build
cp -r dist/* ../frontend-dist/
```

---

## 🧪 TESTES

### Testar Backend Local
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/comunicados
curl http://localhost:3001/api/alunos
```

### Testar Frontend Local
```bash
curl http://localhost
curl http://localhost:80
```

### Testar do Computador Externo

#### Windows PowerShell
```powershell
# Testar por IP
curl http://31.97.255.226

# Testar domínio
curl http://meuestagio.chattec.com.br
curl https://meuestagio.chattec.com.br

# Verificar DNS
nslookup meuestagio.chattec.com.br
```

#### Linux/Mac
```bash
# Testar por IP
curl http://31.97.255.226

# Testar domínio
curl http://meuestagio.chattec.com.br
curl https://meuestagio.chattec.com.br

# Verificar DNS
dig meuestagio.chattec.com.br
nslookup meuestagio.chattec.com.br
```

---

## 🆘 TROUBLESHOOTING

### Backend não inicia
```bash
cd /var/www/site-adm-app/backend
pm2 logs site-adm-estagio-backend --err
cat .env
npm run dev  # Testar manualmente
```

### Nginx não serve o site
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -100 /var/log/nginx/error.log
ls -la /var/www/site-adm-app/frontend-dist/
```

### Erro 502 Bad Gateway
```bash
pm2 status
pm2 restart site-adm-estagio-backend
curl http://localhost:3001/health
sudo tail -f /var/log/nginx/meuestagio_error.log
```

### CORS Error
```bash
cd /var/www/site-adm-app/backend
nano .env
# Adicionar domínio em CORS_ORIGINS
pm2 restart site-adm-estagio-backend
```

### SSL não funciona
```bash
sudo certbot certificates
sudo certbot renew --dry-run
sudo nginx -t
sudo systemctl reload nginx
```

### DNS não propaga
```bash
# Do servidor
dig meuestagio.chattec.com.br

# Do seu PC
nslookup meuestagio.chattec.com.br

# Online
# https://dnschecker.org
```

---

## 🔄 ATUALIZAR APLICAÇÃO

### Deploy de Nova Versão

#### 1. No seu PC - Preparar
```powershell
# Fazer alterações no código
git pull
.\prepare-deploy.ps1
```

#### 2. Enviar para servidor
```powershell
scp -r .\deploy-ready\backend\* root@31.97.255.226:/var/www/site-adm-app/backend/
scp -r .\deploy-ready\frontend-dist\* root@31.97.255.226:/var/www/site-adm-app/frontend-dist/
```

#### 3. No servidor - Reiniciar
```bash
cd /var/www/site-adm-app/backend
npm install --production
pm2 restart site-adm-estagio-backend
```

---

## 📊 MONITORAMENTO

### Ver Status Geral
```bash
echo "=== PM2 STATUS ==="
pm2 status

echo -e "\n=== NGINX STATUS ==="
sudo systemctl status nginx --no-pager

echo -e "\n=== DISK SPACE ==="
df -h

echo -e "\n=== MEMORY ==="
free -h

echo -e "\n=== UPTIME ==="
uptime
```

### Criar Script de Monitoramento
```bash
nano ~/check-status.sh
```

Cole:
```bash
#!/bin/bash
clear
echo "=================================="
echo "  STATUS DO SERVIDOR"
echo "=================================="
echo ""
echo "PM2:"
pm2 status
echo ""
echo "Nginx:"
sudo systemctl status nginx --no-pager | grep Active
echo ""
echo "Disco:"
df -h | grep -E 'Filesystem|/dev/sda|/dev/vda'
echo ""
echo "Memória:"
free -h | grep -E 'Mem|Swap'
echo ""
```

Tornar executável:
```bash
chmod +x ~/check-status.sh
~/check-status.sh
```

---

## 📝 BACKUP

### Backup Manual
```bash
# Criar pasta de backup
mkdir -p ~/backups

# Backup backend
tar -czf ~/backups/backend-$(date +%Y%m%d).tar.gz /var/www/site-adm-app/backend

# Backup frontend
tar -czf ~/backups/frontend-$(date +%Y%m%d).tar.gz /var/www/site-adm-app/frontend-dist

# Listar backups
ls -lh ~/backups/
```

### Restaurar Backup
```bash
# Extrair backup
tar -xzf ~/backups/backend-20251013.tar.gz -C /
pm2 restart site-adm-estagio-backend
```

---

## 🎓 DICAS

### Atalhos Úteis

```bash
# Alias úteis (adicionar no ~/.bashrc)
alias pm2s='pm2 status'
alias pm2l='pm2 logs'
alias pm2r='pm2 restart site-adm-estagio-backend'
alias nginxr='sudo systemctl reload nginx'
alias nginxt='sudo nginx -t'
alias cdback='cd /var/www/site-adm-app/backend'
alias cdfront='cd /var/www/site-adm-app/frontend-dist'
```

Recarregar:
```bash
source ~/.bashrc
```

---

**Pronto! Todos os comandos que você precisa para fazer o deploy! 🚀**

*Salve este arquivo para referência rápida.*

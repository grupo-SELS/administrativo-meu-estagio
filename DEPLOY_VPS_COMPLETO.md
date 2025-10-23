# 🚀 GUIA COMPLETO DE DEPLOY - VPS
# Site Administrativo Meu Estágio
# Domínio: meuestagio.chattec.com.br
# IP: 31.97.255.226

---

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Preparação Local](#preparação-local)
3. [Configuração do Servidor VPS](#configuração-do-servidor-vps)
4. [Deploy da Aplicação](#deploy-da-aplicação)
5. [Configuração do Nginx](#configuração-do-nginx)
6. [Configuração de SSL (HTTPS)](#configuração-de-ssl-https)
7. [Configuração do Domínio (HostGator)](#configuração-do-domínio-hostgator)
8. [Testes e Verificação](#testes-e-verificação)
9. [Manutenção e Monitoramento](#manutenção-e-monitoramento)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 PRÉ-REQUISITOS

### No seu computador local:
- ✅ Node.js 18+ instalado
- ✅ Git instalado
- ✅ Cliente SSH (PuTTY, Terminal, PowerShell)
- ✅ Cliente SCP/SFTP (WinSCP, FileZilla) ou comando scp

### Credenciais necessárias:
- ✅ Acesso SSH à VPS (31.97.255.226)
- ✅ Credenciais Firebase (Service Account Key)
- ✅ Acesso ao painel HostGator para configurar DNS

### No servidor VPS (será instalado):
- Node.js 18+
- Nginx
- PM2 (gerenciador de processos)
- Certbot (para SSL)

---

## 💻 PREPARAÇÃO LOCAL

### PASSO 1: Configurar Variáveis de Ambiente

#### 1.1 Backend (.env.production)
Edite o arquivo: `backend\.env.production`

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://meuestagio.chattec.com.br

# IMPORTANTE: Substitua com suas credenciais reais do Firebase
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}
FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com

# Gere uma senha segura com: openssl rand -base64 32
JWT_SECRET=sua-senha-super-segura-aqui

CORS_ORIGINS=https://meuestagio.chattec.com.br,http://meuestagio.chattec.com.br,http://31.97.255.226
```

**COMO OBTER AS CREDENCIAIS DO FIREBASE:**
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em: **Project Settings** (⚙️) > **Service Accounts**
4. Clique em: **Generate new private key**
5. Copie TODO o conteúdo JSON e cole em uma linha no FIREBASE_SERVICE_ACCOUNT

#### 1.2 Frontend (.env.production)
Edite o arquivo: `frontend\.env.production`

```bash
VITE_API_URL=https://meuestagio.chattec.com.br/api
VITE_ENV=production

# Credenciais do Firebase (obtenha no Firebase Console)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**COMO OBTER AS CREDENCIAIS DO FIREBASE (Web App):**
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em: **Project Settings** (⚙️) > **General**
4. Na seção **Your apps**, clique no app web (</>) ou crie um novo
5. Copie os valores da configuração

### PASSO 2: Preparar Build

Execute o script de preparação:

```powershell
.\prepare-deploy.ps1
```

Este script irá:
- ✅ Criar pasta `deploy-ready/`
- ✅ Copiar arquivos do backend
- ✅ Fazer build do frontend
- ✅ Copiar configurações necessárias

**OU faça manualmente:**

```powershell
# Frontend - Build
cd frontend
npm install
npm run build
cd ..

# Será criada a pasta frontend/dist/
```

---

## 🖥️ CONFIGURAÇÃO DO SERVIDOR VPS

### PASSO 3: Conectar via SSH

```bash
ssh root@31.97.255.226
# ou
ssh seu-usuario@31.97.255.226
```

### PASSO 4: Atualizar Sistema

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar utilitários essenciais
sudo apt install -y curl wget git ufw
```

### PASSO 5: Instalar Node.js

```bash
# Instalar Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x
```

### PASSO 6: Instalar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que aparecer na tela

# Instalar suporte TypeScript
sudo npm install -g ts-node typescript
```

### PASSO 7: Instalar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

### PASSO 8: Configurar Firewall

```bash
# Permitir SSH, HTTP e HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001/tcp  # Backend (temporário, remover depois)

# Ativar firewall
sudo ufw enable
sudo ufw status
```

### PASSO 9: Criar Estrutura de Pastas

```bash
# Criar diretórios
sudo mkdir -p /var/www/site-adm-app/backend
sudo mkdir -p /var/www/site-adm-app/frontend-dist
sudo mkdir -p /var/www/site-adm-app/logs
sudo mkdir -p /var/www/certbot

# Ajustar permissões (substitua 'seu-usuario' pelo seu usuário)
sudo chown -R $USER:$USER /var/www/site-adm-app
sudo chmod -R 755 /var/www/site-adm-app
```

---

## 📤 DEPLOY DA APLICAÇÃO

### PASSO 10: Enviar Arquivos para o Servidor

**Opção A: Usando SCP (do seu computador local)**

```powershell
# Backend
scp -r .\deploy-ready\backend\* root@31.97.255.226:/var/www/site-adm-app/backend/

# Frontend (build)
scp -r .\deploy-ready\frontend-dist\* root@31.97.255.226:/var/www/site-adm-app/frontend-dist/

# Arquivos de configuração
scp .\nginx-meuestagio.conf root@31.97.255.226:/tmp/
scp .\backend\ecosystem.config.js root@31.97.255.226:/var/www/site-adm-app/backend/
```

**Opção B: Usando WinSCP ou FileZilla**
1. Conecte-se ao servidor: `31.97.255.226`
2. Navegue até: `/var/www/site-adm-app/`
3. Arraste as pastas:
   - `deploy-ready/backend/` → `/var/www/site-adm-app/backend/`
   - `deploy-ready/frontend-dist/` → `/var/www/site-adm-app/frontend-dist/`

**Opção C: Usando Git (se tiver repositório)**

```bash
# No servidor
cd /var/www/site-adm-app
git clone https://github.com/seu-usuario/seu-repo.git .

# Build frontend
cd frontend
npm install
npm run build
cp -r dist/* ../frontend-dist/

# Backend
cd ../backend
npm install --production
```

### PASSO 11: Configurar Backend

```bash
# No servidor SSH
cd /var/www/site-adm-app/backend

# Instalar dependências de produção
npm install --production

# Verificar se o .env está configurado
nano .env
# Cole o conteúdo do seu backend/.env.production
# Salve com: Ctrl+X, Y, Enter

# Criar pasta uploads
mkdir -p uploads

# Testar se o backend inicia
npm run dev
# Deve mostrar: "🚀 Backend rodando na porta 3001"
# Pressione Ctrl+C para parar
```

### PASSO 12: Iniciar Backend com PM2

```bash
# Verificar se ecosystem.config.js está presente
ls -la ecosystem.config.js

# Iniciar aplicação com PM2
pm2 start ecosystem.config.js

# Verificar status
pm2 status

# Ver logs em tempo real
pm2 logs site-adm-estagio-backend

# Salvar configuração PM2
pm2 save

# Backend agora está rodando na porta 3001
```

---

## 🌐 CONFIGURAÇÃO DO NGINX

### PASSO 13: Configurar Nginx

```bash
# Copiar arquivo de configuração
sudo cp /tmp/nginx-meuestagio.conf /etc/nginx/sites-available/meuestagio.chattec.com.br

# OU criar manualmente
sudo nano /etc/nginx/sites-available/meuestagio.chattec.com.br
# Cole o conteúdo do arquivo nginx-meuestagio.conf
# Salve com: Ctrl+X, Y, Enter

# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/meuestagio.chattec.com.br /etc/nginx/sites-enabled/

# Remover configuração padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Se OK, recarregar Nginx
sudo systemctl reload nginx
```

### PASSO 14: Verificar Nginx

```bash
# Ver status
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/meuestagio_error.log
sudo tail -f /var/log/nginx/meuestagio_access.log
```

---

## 🔒 CONFIGURAÇÃO DE SSL (HTTPS)

### PASSO 15: Instalar Certbot

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d meuestagio.chattec.com.br -d www.meuestagio.chattec.com.br

# Durante o processo:
# 1. Digite seu email
# 2. Aceite os termos
# 3. Escolha se quer receber emails da EFF (opcional)
# 4. Escolha redirecionar HTTP para HTTPS: Sim (2)
```

### PASSO 16: Configurar Renovação Automática

```bash
# Testar renovação
sudo certbot renew --dry-run

# Certbot já configura renovação automática
# Verificar se o timer está ativo
sudo systemctl status certbot.timer
```

### PASSO 17: Atualizar Nginx para HTTPS

```bash
# Editar configuração do Nginx
sudo nano /etc/nginx/sites-available/meuestagio.chattec.com.br

# Descomentar a seção HTTPS (server block na porta 443)
# Comentar ou remover a seção HTTP inicial (SEM SSL)

# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🌍 CONFIGURAÇÃO DO DOMÍNIO (HOSTGATOR)

### PASSO 18: Configurar DNS na HostGator

1. **Login no cPanel da HostGator**
   - Acesse: https://hostgator.com.br
   - Faça login na sua conta

2. **Acessar Gerenciador de DNS**
   - Vá em: **Domínios** → **Zona de DNS**
   - Selecione: `meuestagio.chattec.com.br`

3. **Adicionar/Editar Registros DNS**

   **Registro A (Principal):**
   ```
   Tipo: A
   Nome: @
   Valor: 31.97.255.226
   TTL: 14400 (4 horas)
   ```

   **Registro A (www):**
   ```
   Tipo: A
   Nome: www
   Valor: 31.97.255.226
   TTL: 14400
   ```

   **Opcional - Registro AAAA (se tiver IPv6):**
   ```
   Tipo: AAAA
   Nome: @
   Valor: [seu IPv6]
   TTL: 14400
   ```

4. **Remover/Desabilitar Registros Antigos**
   - Remova qualquer registro A antigo apontando para outros IPs
   - Remova registros CNAME conflitantes

5. **Salvar e Aguardar Propagação**
   - Salve as alterações
   - Propagação DNS: 15 minutos a 48 horas (geralmente 1-2 horas)

### PASSO 19: Verificar DNS

**No seu computador local:**

```powershell
# Windows PowerShell
nslookup meuestagio.chattec.com.br
nslookup www.meuestagio.chattec.com.br

# Deve retornar: 31.97.255.226
```

**Ferramentas online:**
- https://dnschecker.org
- https://www.whatsmydns.net

---

## ✅ TESTES E VERIFICAÇÃO

### PASSO 20: Testar Aplicação

#### 20.1 Testar Backend
```bash
# No servidor
curl http://localhost:3001/health
# Deve retornar: {"status":"ok","timestamp":"..."}

# Testar API
curl http://localhost:3001/api/comunicados
```

#### 20.2 Testar Frontend pelo IP
```bash
# Do seu computador
curl http://31.97.255.226
# Deve retornar HTML do frontend
```

#### 20.3 Testar Domínio (HTTP)
Abra no navegador:
- http://meuestagio.chattec.com.br
- http://www.meuestagio.chattec.com.br

#### 20.4 Testar HTTPS (após configurar SSL)
Abra no navegador:
- https://meuestagio.chattec.com.br
- https://www.meuestagio.chattec.com.br

#### 20.5 Verificar SSL
- https://www.ssllabs.com/ssltest/
- Digite: `meuestagio.chattec.com.br`
- Deve obter nota A ou A+

### PASSO 21: Testar Funcionalidades

1. **Login/Autenticação**
   - Tente fazer login
   - Verifique se o Firebase está funcionando

2. **CRUD de Comunicados**
   - Criar novo comunicado
   - Editar comunicado
   - Deletar comunicado

3. **Upload de Imagens**
   - Fazer upload de imagem
   - Verificar se salva no Firebase Storage

4. **Navegação**
   - Testar todas as páginas
   - Verificar menu e rotas

---

## 🔧 MANUTENÇÃO E MONITORAMENTO

### Comandos PM2 Úteis

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs site-adm-estagio-backend

# Ver logs com filtro
pm2 logs --lines 100

# Reiniciar aplicação
pm2 restart site-adm-estagio-backend

# Parar aplicação
pm2 stop site-adm-estagio-backend

# Informações detalhadas
pm2 show site-adm-estagio-backend

# Monitoramento
pm2 monit
```

### Comandos Nginx Úteis

```bash
# Status
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx

# Recarregar configuração (sem downtime)
sudo systemctl reload nginx

# Testar configuração
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/meuestagio_error.log
sudo tail -f /var/log/nginx/meuestagio_access.log
```

### Monitoramento de Recursos

```bash
# CPU e Memória
htop
# ou
top

# Espaço em disco
df -h

# Uso de porta
sudo netstat -tulpn | grep 3001
sudo netstat -tulpn | grep 80
```

### Backup Automático

```bash
# Criar script de backup
sudo nano /root/backup-site.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR

# Backup backend
tar -czf $BACKUP_DIR/backend_$DATE.tar.gz /var/www/site-adm-app/backend

# Backup frontend
tar -czf $BACKUP_DIR/frontend_$DATE.tar.gz /var/www/site-adm-app/frontend-dist

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Dar permissão
sudo chmod +x /root/backup-site.sh

# Configurar cron (diário às 3h)
sudo crontab -e
# Adicionar:
0 3 * * * /root/backup-site.sh
```

---

## 🚨 TROUBLESHOOTING

### Problema: Site não abre

**Verificar:**
```bash
# 1. Nginx está rodando?
sudo systemctl status nginx

# 2. PM2 está rodando?
pm2 status

# 3. Firewall permite?
sudo ufw status

# 4. DNS está correto?
nslookup meuestagio.chattec.com.br

# 5. Porta 80/443 está aberta?
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### Problema: Erro 502 Bad Gateway

**Causa:** Backend não está rodando ou não responde

**Solução:**
```bash
# Ver logs do PM2
pm2 logs site-adm-estagio-backend

# Reiniciar backend
pm2 restart site-adm-estagio-backend

# Verificar se porta 3001 está em uso
sudo netstat -tulpn | grep 3001
```

### Problema: Erro 404 em rotas do frontend

**Causa:** Nginx não está configurado para SPA

**Solução:**
```bash
# Verificar configuração do Nginx
sudo nano /etc/nginx/sites-available/meuestagio.chattec.com.br

# Deve ter:
location / {
    try_files $uri $uri/ /index.html;
}
```

### Problema: CORS Error

**Causa:** Backend não permite o domínio

**Solução:**
```bash
# Verificar .env do backend
cd /var/www/site-adm-app/backend
nano .env

# Adicionar domínio em CORS_ORIGINS
CORS_ORIGINS=https://meuestagio.chattec.com.br,...

# Reiniciar
pm2 restart site-adm-estagio-backend
```

### Problema: Firebase não conecta

**Causa:** Credenciais incorretas ou faltando

**Solução:**
```bash
# Verificar .env
cd /var/www/site-adm-app/backend
nano .env

# Verificar se FIREBASE_SERVICE_ACCOUNT está correto
# Deve ser um JSON válido em uma linha

# Ver logs de erro
pm2 logs site-adm-estagio-backend --err
```

### Problema: SSL não funciona

**Verificar:**
```bash
# 1. Certbot executou com sucesso?
sudo certbot certificates

# 2. Nginx tem os caminhos corretos?
sudo nano /etc/nginx/sites-available/meuestagio.chattec.com.br

# 3. Portas 80 e 443 abertas?
sudo ufw status

# 4. Testar renovação
sudo certbot renew --dry-run
```

### Logs Importantes

```bash
# Backend (PM2)
pm2 logs site-adm-estagio-backend
pm2 logs site-adm-estagio-backend --lines 200

# Nginx
sudo tail -f /var/log/nginx/meuestagio_error.log
sudo tail -f /var/log/nginx/meuestagio_access.log

# Sistema
sudo journalctl -xe
sudo dmesg | tail
```

---

## 📝 CHECKLIST FINAL

Antes de considerar o deploy completo, verifique:

### Servidor
- [ ] Node.js instalado e funcionando
- [ ] PM2 instalado e backend rodando
- [ ] Nginx instalado e configurado
- [ ] Firewall configurado (UFW)
- [ ] SSL/HTTPS funcionando
- [ ] Certificado configurado para renovação automática

### Aplicação
- [ ] Backend rodando na porta 3001
- [ ] Frontend servido pelo Nginx
- [ ] API respondendo corretamente
- [ ] Firebase conectado (backend e frontend)
- [ ] Upload de imagens funcionando
- [ ] CORS configurado corretamente

### DNS e Domínio
- [ ] Registro A apontando para 31.97.255.226
- [ ] www.meuestagio.chattec.com.br funcionando
- [ ] meuestagio.chattec.com.br funcionando
- [ ] DNS propagado globalmente

### Segurança
- [ ] HTTPS obrigatório (redirect HTTP → HTTPS)
- [ ] Headers de segurança configurados
- [ ] Firewall bloqueando portas desnecessárias
- [ ] Credenciais sensíveis em .env (não no código)
- [ ] .env não versionado no Git

### Testes
- [ ] Login/autenticação funciona
- [ ] CRUD de comunicados funciona
- [ ] CRUD de alunos funciona
- [ ] CRUD de professores funciona
- [ ] Agendamentos funcionam
- [ ] Upload de imagens funciona
- [ ] Todas as rotas acessíveis

---

## 🎉 CONCLUSÃO

Se todos os passos foram seguidos corretamente, sua aplicação deve estar:

✅ Rodando em: **https://meuestagio.chattec.com.br**  
✅ Backend rodando via PM2 (sempre ativo)  
✅ Frontend servido pelo Nginx  
✅ SSL/HTTPS ativo e seguro  
✅ Domínio configurado corretamente  
✅ Pronto para uso em produção!  

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique a seção [Troubleshooting](#troubleshooting)
2. Analise os logs (PM2 e Nginx)
3. Verifique as configurações (DNS, Firewall, etc)

---

## 📚 RECURSOS ÚTEIS

- [Documentação PM2](https://pm2.keymetrics.io/)
- [Documentação Nginx](https://nginx.org/en/docs/)
- [Documentação Let's Encrypt](https://letsencrypt.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [HostGator Suporte](https://suporte.hostgator.com.br/)

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0  
**Autor:** Deploy Guide para meuestagio.chattec.com.br

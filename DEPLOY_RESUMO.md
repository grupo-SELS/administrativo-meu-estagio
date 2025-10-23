# 🚀 DEPLOY VPS - RESUMO EXECUTIVO

## 📊 INFORMAÇÕES DO PROJETO

- **Projeto:** Site Administrativo Meu Estágio
- **Domínio:** meuestagio.chattec.com.br
- **IP Servidor:** 31.97.255.226
- **Hospedagem DNS:** HostGator
- **Tecnologia:** React (Frontend) + Node.js/Express (Backend) + Firebase

---

## 📁 ARQUIVOS CRIADOS PARA DEPLOY

### Configuração
| Arquivo | Localização | Descrição |
|---------|-------------|-----------|
| `.env.production` | `backend/` | Variáveis de ambiente para produção (backend) |
| `.env.production` | `frontend/` | Variáveis de ambiente para produção (frontend) |
| `ecosystem.config.js` | `backend/` | Configuração PM2 (gerenciador de processos) |
| `nginx-meuestagio.conf` | Raiz | Configuração Nginx (proxy reverso) |

### Scripts
| Arquivo | Descrição |
|---------|-----------|
| `prepare-deploy.ps1` | Script PowerShell para preparar deploy (Windows) |
| `prepare-deploy.sh` | Script Bash para preparar deploy (Linux/Mac) |

### Documentação
| Arquivo | Descrição |
|---------|-----------|
| `DEPLOY_VPS_COMPLETO.md` | Guia completo passo a passo (detalhado) |
| `DEPLOY_CHECKLIST.md` | Checklist rápido para deploy |
| `DEPLOY_RESUMO.md` | Este arquivo - resumo executivo |

---

## ⚡ FLUXO DE DEPLOY

```
┌─────────────────┐
│  1. PREPARAÇÃO  │  ← Configure .env e execute prepare-deploy.ps1
│     LOCAL       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. SERVIDOR    │  ← Instale Node, PM2, Nginx no servidor VPS
│     VPS SETUP   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. ENVIAR      │  ← Use SCP para enviar arquivos
│     ARQUIVOS    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. INICIAR     │  ← pm2 start ecosystem.config.js
│     BACKEND     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. CONFIGURAR  │  ← Configure Nginx como proxy reverso
│     NGINX       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  6. DNS         │  ← Aponte domínio para 31.97.255.226 na HostGator
│     HOSTGATOR   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  7. SSL/HTTPS   │  ← Certbot para certificado Let's Encrypt
│     (CERTBOT)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  8. TESTE       │  ← Testar todas as funcionalidades
│     VALIDAÇÃO   │
└─────────────────┘
```

---

## 🔑 REQUISITOS CRÍTICOS

### Antes de começar:

✅ **Credenciais Firebase**
- Service Account Key (JSON) - para backend
- Web App Config - para frontend
- Obtenha em: https://console.firebase.google.com

✅ **Acesso ao Servidor**
- SSH: `root@31.97.255.226` ou usuário com sudo
- Porta 22 aberta

✅ **Acesso HostGator**
- Login no cPanel para configurar DNS
- Domínio: meuestagio.chattec.com.br

---

## ⏱️ TEMPO ESTIMADO

| Etapa | Tempo |
|-------|-------|
| Configurar variáveis de ambiente | 10 min |
| Preparar build local | 15 min |
| Configurar servidor VPS | 30 min |
| Enviar arquivos | 10 min |
| Iniciar aplicação | 10 min |
| Configurar Nginx | 10 min |
| Configurar DNS | 5 min |
| Configurar SSL | 10 min |
| Testes | 10 min |
| **TOTAL** | **~2 horas** |

*Tempo pode variar dependendo da velocidade de internet e familiaridade com o processo.*

---

## 🎯 PASSO A PASSO SIMPLIFICADO

### 1. NO SEU COMPUTADOR

```powershell
# 1.1 Configure o Firebase
# Edite: backend\.env.production
# Edite: frontend\.env.production

# 1.2 Prepare o deploy
.\prepare-deploy.ps1
```

### 2. NO SERVIDOR VPS (SSH)

```bash
# 2.1 Conectar
ssh root@31.97.255.226

# 2.2 Instalar dependências
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2 ts-node typescript

# 2.3 Criar estrutura
sudo mkdir -p /var/www/site-adm-app/{backend,frontend-dist,logs}
sudo chown -R $USER:$USER /var/www/site-adm-app

# 2.4 Configurar firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 3. ENVIAR ARQUIVOS (do seu PC)

```powershell
scp -r .\deploy-ready\backend\* root@31.97.255.226:/var/www/site-adm-app/backend/
scp -r .\deploy-ready\frontend-dist\* root@31.97.255.226:/var/www/site-adm-app/frontend-dist/
scp .\nginx-meuestagio.conf root@31.97.255.226:/tmp/
scp .\backend\ecosystem.config.js root@31.97.255.226:/var/www/site-adm-app/backend/
```

### 4. NO SERVIDOR - INICIAR APPS

```bash
# Backend
cd /var/www/site-adm-app/backend
npm install --production
mkdir -p uploads
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Execute o comando que aparecer

# Nginx
sudo cp /tmp/nginx-meuestagio.conf /etc/nginx/sites-available/meuestagio.chattec.com.br
sudo ln -s /etc/nginx/sites-available/meuestagio.chattec.com.br /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. HOSTGATOR - CONFIGURAR DNS

1. Login no cPanel
2. Domínios → Zona de DNS
3. Adicionar Registros A:
   - `@` → `31.97.255.226`
   - `www` → `31.97.255.226`
4. Salvar e aguardar propagação (15min-2h)

### 6. SERVIDOR - CONFIGURAR SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d meuestagio.chattec.com.br -d www.meuestagio.chattec.com.br
```

### 7. TESTAR

- ✅ http://31.97.255.226
- ✅ http://meuestagio.chattec.com.br
- ✅ https://meuestagio.chattec.com.br
- ✅ Login e funcionalidades

---

## 🛠️ ARQUITETURA FINAL

```
Internet
   │
   ▼
[HostGator DNS] → meuestagio.chattec.com.br → 31.97.255.226
   │
   ▼
[VPS: 31.97.255.226]
   │
   ├─ [Nginx :80/:443]
   │    │
   │    ├─ Serve → /var/www/site-adm-app/frontend-dist/ (React App)
   │    │
   │    └─ Proxy → http://localhost:3001/api/ (Backend)
   │
   └─ [PM2] → Node.js Backend :3001
        │
        └─ [Firebase] → Firestore + Storage
```

---

## 📊 PORTAS UTILIZADAS

| Porta | Serviço | Acesso |
|-------|---------|--------|
| 22 | SSH | Interno (firewall) |
| 80 | HTTP → HTTPS redirect | Externo |
| 443 | HTTPS (Nginx) | Externo |
| 3001 | Backend (Node.js) | Interno (localhost) |

---

## 🔒 SEGURANÇA

### Implementado:
✅ HTTPS obrigatório (Let's Encrypt)  
✅ Firewall UFW configurado  
✅ Backend não exposto (apenas via Nginx)  
✅ CORS configurado  
✅ Headers de segurança (Helmet)  
✅ Credenciais em .env (não versionado)  

### Recomendações adicionais:
- [ ] Configurar fail2ban (proteção contra bruteforce SSH)
- [ ] Monitoramento com Uptime Robot ou similar
- [ ] Backup automático diário
- [ ] Rate limiting no Nginx (proteção DDoS)

---

## 🆘 SUPORTE RÁPIDO

### Backend não funciona
```bash
pm2 logs site-adm-estagio-backend
pm2 restart site-adm-estagio-backend
```

### Frontend não carrega
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/meuestagio_error.log
```

### DNS não propaga
```bash
# Verificar (do seu PC)
nslookup meuestagio.chattec.com.br
# Deve retornar: 31.97.255.226
```

### CORS Error
```bash
# Adicionar domínio no backend/.env
cd /var/www/site-adm-app/backend
nano .env
# CORS_ORIGINS=https://meuestagio.chattec.com.br,...
pm2 restart site-adm-estagio-backend
```

---

## 📞 COMANDOS ÚTEIS

```bash
# Status geral
pm2 status
sudo systemctl status nginx

# Logs
pm2 logs
pm2 logs --lines 200
sudo tail -f /var/log/nginx/meuestagio_error.log

# Reiniciar
pm2 restart site-adm-estagio-backend
sudo systemctl reload nginx

# Monitoramento
pm2 monit
htop
df -h
```

---

## ✅ CHECKLIST FINAL

Antes de considerar o deploy completo:

- [ ] Backend rodando (pm2 status)
- [ ] Nginx rodando (systemctl status nginx)
- [ ] Site abre por IP
- [ ] Site abre por domínio
- [ ] HTTPS funcionando
- [ ] Login funciona
- [ ] CRUD de comunicados funciona
- [ ] CRUD de alunos funciona
- [ ] CRUD de professores funciona
- [ ] Agendamentos funcionam
- [ ] Upload de imagens funciona
- [ ] Certificado SSL renovação automática configurada

---

## 📚 DOCUMENTAÇÃO

- **Guia Completo:** `DEPLOY_VPS_COMPLETO.md` (40+ páginas)
- **Checklist Rápido:** `DEPLOY_CHECKLIST.md` (resumo de 1 página)
- **Este Resumo:** `DEPLOY_RESUMO.md`

---

## 🎉 CONCLUSÃO

Seguindo os passos acima, seu projeto estará:

✅ **Live em:** https://meuestagio.chattec.com.br  
✅ **Seguro:** HTTPS + Firewall + Headers de segurança  
✅ **Estável:** PM2 com auto-restart  
✅ **Performático:** Nginx como proxy reverso  
✅ **Pronto para produção!**  

---

**Boa sorte com o deploy! 🚀**

*Última atualização: Outubro 2025*

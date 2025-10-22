# 🚀 DEPLOY RÁPIDO - CHECKLIST

## ⚡ ANTES DE COMEÇAR

Você vai precisar:
- [ ] IP/Domínio do servidor VPS
- [ ] Usuário e senha SSH (ou chave SSH)
- [ ] Arquivo `config/serviceAccountKey.json` (Firebase)
- [ ] Seu domínio apontando para o servidor

---

## 📋 FASE 1: LOCAL (Seu PC) - 5 minutos

```bash
# 1. Build do frontend
cd frontend
npm run build

# 2. Adicionar mudanças
cd ..
git add -A
git commit -m "Deploy: Pronto para produção"
git push

# 3. Pronto!
echo "✅ Local pronto"
```

---

## 📋 FASE 2: SERVIDOR - 15 minutos

```bash
# 1. Conectar
ssh seu-usuario@seu-servidor.com

# 2. Criar diretórios
mkdir -p /home/seu-usuario/site-adm-app
mkdir -p /var/www/seu-dominio

# 3. Clonar repositório
cd /home/seu-usuario/site-adm-app
git clone https://github.com/grupo-SELS/administrativo-meu-estagio.git .

# 4. Copiar arquivo de credenciais (DO SEU PC!)
# Em outra aba do terminal no seu PC:
scp config/serviceAccountKey.json seu-usuario@seu-servidor:/home/seu-usuario/site-adm-app/backend/config/

# 5. Continuar no servidor...
cd backend
npm install --production

# 6. Configurar ambiente
nano .env
# Adicionar:
# NODE_ENV=production
# PORT=3001
# FIREBASE_PROJECT_ID=seu-projeto

# 7. Instalar PM2
sudo npm install -g pm2

# 8. Iniciar aplicação
pm2 start server.ts --name "api-estagio" --interpreter ts-node
pm2 save
pm2 startup

# 9. Copiar frontend (DO SEU PC - outra aba!)
scp -r frontend/dist/* seu-usuario@seu-servidor:/var/www/seu-dominio/

# 10. Volta ao servidor
sudo apt update
sudo apt install nginx -y
sudo apt install certbot python3-certbot-nginx -y

# 11. Configurar Nginx
sudo nano /etc/nginx/sites-available/seu-dominio.com
# Cole a configuração abaixo

# 12. Habilitar
sudo ln -s /etc/nginx/sites-available/seu-dominio.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 13. SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# ✅ Pronto!
echo "✅ Deploy completo!"
```

---

## 🔧 CONFIGURAÇÃO NGINX (Cole no servidor)

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

---

## 📋 FASE 3: VALIDAÇÃO - 5 minutos

No seu navegador, acesse:

```
✅ https://seu-dominio.com
✅ https://seu-dominio.com/api/health
✅ Teste login
✅ Pressione F12 - sem erros vermelhos?
```

Se tudo OK:
```bash
# No servidor
pm2 list        # Deve mostrar "online"
pm2 logs        # Sem erros vermelhos?
```

---

## 🎯 COMMANDOS ÚTEIS (Servidor)

```bash
# Status
pm2 list
pm2 monit

# Logs
pm2 logs api-estagio
sudo tail -f /var/log/nginx/access.log

# Restart
pm2 restart api-estagio
sudo systemctl restart nginx

# Parar
pm2 stop api-estagio
pm2 delete api-estagio
```

---

## 🆘 ERROS COMUNS

| Erro | Solução |
|------|---------|
| Backend não inicia | `pm2 logs api-estagio` - verificar serviceAccountKey.json |
| CORS Error | Verificar ALLOWED_ORIGINS em server.ts |
| 502 Bad Gateway | Backend caiu - `pm2 restart api-estagio` |
| SSL expirado | `sudo certbot renew` |
| Nginx não responde | `sudo nginx -t` depois `sudo systemctl restart nginx` |

---

## 📞 PRÓXIMOS PASSOS

1. ✅ Deploy realizado
2. [ ] Configurar monitoramento (PM2 Plus)
3. [ ] Configurar backup automático
4. [ ] Configurar alertas
5. [ ] Atualizar DNS em produção (se necessário)

---

**🚀 Sucesso no deploy!**

Dúvidas? Consulte `GUIA_DEPLOY.md`

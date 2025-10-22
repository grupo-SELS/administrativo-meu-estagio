# 🚀 DEPLOY PARA VPS - DOCUMENTAÇÃO COMPLETA

## 📌 INÍCIO RÁPIDO

**Seu projeto está pronto para deploy!** 

- **Domínio:** meuestagio.chattec.com.br
- **IP Servidor:** 31.97.255.226
- **Tempo estimado:** 1h30min - 2h

### 🎯 Escolha seu caminho:

| Documento | Para quem? | Tempo |
|-----------|------------|-------|
| [**DEPLOY_CHECKLIST.md**](DEPLOY_CHECKLIST.md) | Quem já sabe o que fazer | 5 min |
| [**DEPLOY_RESUMO.md**](DEPLOY_RESUMO.md) | Visão geral executiva | 10 min |
| [**DEPLOY_VPS_COMPLETO.md**](DEPLOY_VPS_COMPLETO.md) | Guia passo a passo detalhado | 30 min |
| [**COMANDOS_DEPLOY.md**](COMANDOS_DEPLOY.md) | Copiar e colar comandos | Referência |

---

## 📚 DOCUMENTAÇÃO

### 📖 Guias de Deploy

| Arquivo | Descrição | Páginas |
|---------|-----------|---------|
| `DEPLOY_CHECKLIST.md` | ⚡ Checklist rápido - passos essenciais | 1 |
| `DEPLOY_RESUMO.md` | 📊 Resumo executivo - visão geral | 2 |
| `DEPLOY_VPS_COMPLETO.md` | 📕 Guia completo - todos os detalhes | 40+ |
| `COMANDOS_DEPLOY.md` | 💻 Comandos prontos - copiar e colar | 10 |

### 🔧 Arquivos de Configuração

| Arquivo | Localização | Descrição |
|---------|-------------|-----------|
| `.env.production` | `backend/` | ⚙️ Variáveis de ambiente (backend) |
| `.env.production` | `frontend/` | ⚙️ Variáveis de ambiente (frontend) |
| `ecosystem.config.js` | `backend/` | 🔄 Configuração PM2 |
| `nginx-meuestagio.conf` | Raiz | 🌐 Configuração Nginx |

### 🤖 Scripts Automatizados

| Arquivo | Plataforma | Comando |
|---------|------------|---------|
| `prepare-deploy.ps1` | Windows | `.\prepare-deploy.ps1` |
| `prepare-deploy.sh` | Linux/Mac | `bash prepare-deploy.sh` |

---

## 🎯 FLUXO DE TRABALHO

```
1. CONFIGURAR          2. PREPARAR            3. SERVIDOR
   .env files     →      Build local     →      Instalar deps
   (5 min)               (10 min)               (30 min)
                                                      ↓
6. TESTAR          ←   5. DNS/SSL         ←   4. DEPLOY
   Funcionalidades       HostGator              Enviar arquivos
   (10 min)             Certbot                 PM2 + Nginx
                        (15 min)                (20 min)
```

---

## ⚡ INÍCIO RÁPIDO - 3 PASSOS

### 1️⃣ Configure (5 minutos)

**Edite os arquivos `.env.production`:**

```powershell
# Backend: backend\.env.production
# Adicione suas credenciais do Firebase

# Frontend: frontend\.env.production  
# Adicione suas credenciais do Firebase
```

### 2️⃣ Prepare (10 minutos)

```powershell
# Execute o script
.\prepare-deploy.ps1

# Será criada a pasta: deploy-ready/
```

### 3️⃣ Deploy (1 hora)

Siga o: **[DEPLOY_VPS_COMPLETO.md](DEPLOY_VPS_COMPLETO.md)**

Ou use o: **[DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)** se tiver experiência.

---

## 📋 PRÉ-REQUISITOS

### ✅ Você precisa ter:

- [ ] Credenciais do Firebase (Service Account + Web Config)
- [ ] Acesso SSH ao servidor (31.97.255.226)
- [ ] Acesso ao painel HostGator (configurar DNS)
- [ ] Node.js instalado localmente
- [ ] Git (opcional, mas recomendado)

### 🔑 Credenciais Firebase

**Obtenha em:** https://console.firebase.google.com

1. **Service Account Key** (para backend):
   - Project Settings → Service Accounts
   - Generate new private key
   - Salve o JSON

2. **Web App Config** (para frontend):
   - Project Settings → General
   - Your apps → Web app
   - Copie as credenciais

---

## 🏗️ ARQUITETURA

```
                    INTERNET
                       │
                       ▼
        ┌──────────────────────────┐
        │   HostGator DNS          │
        │   meuestagio.chattec.    │
        │   com.br                 │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │   VPS: 31.97.255.226     │
        │                          │
        │  ┌────────────────────┐  │
        │  │  Nginx :80/:443    │  │
        │  │  (Proxy Reverso)   │  │
        │  └─────┬──────────┬───┘  │
        │        │          │       │
        │        ▼          ▼       │
        │   Frontend    Backend     │
        │   (Static)    PM2 :3001   │
        │                  │        │
        │                  ▼        │
        │            ┌──────────┐   │
        │            │ Firebase │   │
        └────────────┴──────────┴───┘
```

---

## 📊 ESTRUTURA DO PROJETO

```
site-adm-app/
├── backend/
│   ├── .env.production          ← Configure Firebase aqui
│   ├── ecosystem.config.js      ← Config PM2
│   ├── server.ts
│   ├── routes/
│   ├── config/
│   └── package.json
│
├── frontend/
│   ├── .env.production          ← Configure Firebase aqui
│   ├── src/
│   ├── dist/                    ← Build vai aqui
│   └── package.json
│
├── deploy-ready/                ← Criado pelo script
│   ├── backend/
│   └── frontend-dist/
│
├── DEPLOY_VPS_COMPLETO.md       ← 📕 Guia completo
├── DEPLOY_CHECKLIST.md          ← ⚡ Checklist rápido
├── DEPLOY_RESUMO.md             ← 📊 Resumo executivo
├── COMANDOS_DEPLOY.md           ← 💻 Comandos prontos
├── DEPLOY_README.md             ← 📌 Este arquivo
│
├── nginx-meuestagio.conf        ← Config Nginx
├── prepare-deploy.ps1           ← Script Windows
└── prepare-deploy.sh            ← Script Linux/Mac
```

---

## 🎓 NÍVEIS DE EXPERIÊNCIA

### 🌟 Iniciante (Primeira vez fazendo deploy)
**Siga:** [DEPLOY_VPS_COMPLETO.md](DEPLOY_VPS_COMPLETO.md)
- Guia passo a passo detalhado
- Explicações sobre cada comando
- Troubleshooting completo

### ⚡ Intermediário (Já fez deploy antes)
**Siga:** [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md)
- Checklist simplificado
- Comandos diretos
- Links para documentação

### 🚀 Avançado (Expert em deploy)
**Use:** [COMANDOS_DEPLOY.md](COMANDOS_DEPLOY.md)
- Apenas comandos
- Copiar e colar
- Referência rápida

---

## 🔧 O QUE SERÁ INSTALADO NO SERVIDOR

| Software | Versão | Finalidade |
|----------|--------|------------|
| Node.js | 20.x LTS | Runtime JavaScript |
| NPM | 10.x | Gerenciador de pacotes |
| PM2 | Latest | Gerenciador de processos |
| Nginx | Latest | Servidor web + proxy |
| Certbot | Latest | Certificados SSL (Let's Encrypt) |
| UFW | Nativo | Firewall |

---

## 🌐 PORTAS UTILIZADAS

| Porta | Serviço | Acesso | Firewall |
|-------|---------|--------|----------|
| 22 | SSH | Admin | ✅ Permitir |
| 80 | HTTP | Público → HTTPS | ✅ Permitir |
| 443 | HTTPS | Público | ✅ Permitir |
| 3001 | Backend | Interno (localhost) | ❌ Bloquear |

---

## 🔒 SEGURANÇA

### ✅ Implementado:

- [x] **HTTPS obrigatório** (Let's Encrypt SSL)
- [x] **Firewall UFW** configurado
- [x] **Backend protegido** (não exposto, apenas via Nginx)
- [x] **CORS** configurado
- [x] **Helmet** (headers de segurança)
- [x] **Credenciais** em .env (não versionado)
- [x] **Auto-renovação SSL** (Certbot)

### 📝 Recomendações Adicionais:

- [ ] Fail2ban (proteção bruteforce SSH)
- [ ] Rate limiting no Nginx (anti-DDoS)
- [ ] Monitoramento (Uptime Robot)
- [ ] Backup automático diário
- [ ] Logs centralizados

---

## ⏱️ TEMPO ESTIMADO POR ETAPA

| Etapa | Primeira vez | Próximas vezes |
|-------|--------------|----------------|
| Configurar .env | 10 min | 2 min |
| Preparar build | 15 min | 5 min |
| Configurar servidor | 30 min | - (só uma vez) |
| Enviar arquivos | 10 min | 5 min |
| Iniciar aplicação | 10 min | 2 min |
| Configurar Nginx | 10 min | - (só uma vez) |
| Configurar DNS | 5 min | - (só uma vez) |
| Configurar SSL | 10 min | - (auto-renovável) |
| Testes | 10 min | 5 min |
| **TOTAL** | **~2 horas** | **~20 min** |

---

## 🆘 PRECISA DE AJUDA?

### 1. Consulte a documentação:

- **Erro específico?** → [DEPLOY_VPS_COMPLETO.md#troubleshooting](DEPLOY_VPS_COMPLETO.md#troubleshooting)
- **Comando não funciona?** → [COMANDOS_DEPLOY.md](COMANDOS_DEPLOY.md)
- **Visão geral?** → [DEPLOY_RESUMO.md](DEPLOY_RESUMO.md)

### 2. Verifique os logs:

```bash
# Backend
pm2 logs site-adm-estagio-backend

# Nginx
sudo tail -f /var/log/nginx/meuestagio_error.log

# Sistema
sudo journalctl -xe
```

### 3. Problemas comuns:

| Sintoma | Solução Rápida |
|---------|----------------|
| Site não abre | `pm2 status` e `sudo systemctl status nginx` |
| Erro 502 | `pm2 restart site-adm-estagio-backend` |
| CORS error | Adicionar domínio no `backend/.env` |
| SSL não funciona | `sudo certbot certificates` |

---

## ✅ CHECKLIST FINAL

Antes de considerar o deploy completo:

### Servidor:
- [ ] Node.js instalado e funcionando
- [ ] PM2 rodando o backend
- [ ] Nginx configurado e rodando
- [ ] Firewall (UFW) ativo
- [ ] SSL/HTTPS funcionando
- [ ] Certificado com renovação automática

### Aplicação:
- [ ] Backend respondendo em localhost:3001
- [ ] Frontend servido pelo Nginx
- [ ] API funcionando (CORS OK)
- [ ] Firebase conectado (backend + frontend)
- [ ] Upload de imagens OK

### DNS e Domínio:
- [ ] Registro A apontando para 31.97.255.226
- [ ] www.meuestagio.chattec.com.br funcionando
- [ ] meuestagio.chattec.com.br funcionando
- [ ] DNS propagado

### Testes Funcionais:
- [ ] Login/autenticação funciona
- [ ] CRUD Comunicados funciona
- [ ] CRUD Alunos funciona
- [ ] CRUD Professores funciona
- [ ] Agendamentos funcionam
- [ ] Upload de imagens funciona
- [ ] Todas as rotas acessíveis

---

## 🎉 RESULTADO FINAL

Após concluir o deploy:

✅ **Site ao vivo:** https://meuestagio.chattec.com.br  
✅ **Backend estável:** PM2 com auto-restart  
✅ **Frontend otimizado:** Servido pelo Nginx  
✅ **Seguro:** HTTPS obrigatório + Firewall  
✅ **Escalável:** Pronto para crescer  
✅ **Monitorável:** Logs e status em tempo real  

---

## 📞 CONTATOS E RECURSOS

### Documentação Oficial:
- [Node.js](https://nodejs.org/docs)
- [PM2](https://pm2.keymetrics.io/docs)
- [Nginx](https://nginx.org/en/docs)
- [Let's Encrypt](https://letsencrypt.org/docs)
- [Firebase](https://firebase.google.com/docs)

### Ferramentas Úteis:
- [DNS Checker](https://dnschecker.org)
- [SSL Labs](https://www.ssllabs.com/ssltest)
- [HostGator Suporte](https://suporte.hostgator.com.br)

---

## 📝 NOTAS IMPORTANTES

⚠️ **Antes de começar:**
1. ✅ Tenha as credenciais do Firebase prontas
2. ✅ Certifique-se de ter acesso SSH ao servidor
3. ✅ Faça backup do projeto localmente
4. ✅ Teste tudo localmente antes de fazer deploy

⚠️ **Durante o deploy:**
1. ❌ NÃO compartilhe arquivos .env publicamente
2. ❌ NÃO exponha credenciais no código
3. ✅ Teste cada etapa antes de prosseguir
4. ✅ Salve os logs se algo der errado

⚠️ **Após o deploy:**
1. ✅ Configure backup automático
2. ✅ Configure monitoramento (Uptime Robot)
3. ✅ Documente qualquer customização
4. ✅ Mantenha o sistema atualizado

---

## 🚀 COMECE AGORA!

### Opção 1: Guia Completo (Recomendado para iniciantes)
```
1. Abra: DEPLOY_VPS_COMPLETO.md
2. Siga cada passo
3. Em 2 horas seu site estará no ar!
```

### Opção 2: Checklist Rápido (Para quem tem experiência)
```
1. Abra: DEPLOY_CHECKLIST.md
2. Execute os comandos
3. Deploy em 1 hora!
```

### Opção 3: Comandos Diretos (Para experts)
```
1. Abra: COMANDOS_DEPLOY.md
2. Copie e cole
3. Deploy em 30 minutos!
```

---

**Boa sorte com o deploy! 🚀**

*Se tiver dúvidas, consulte a documentação ou os logs.*

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0.0  
**Projeto:** Site Administrativo Meu Estágio

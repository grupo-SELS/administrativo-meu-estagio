# 🔴 AÇÃO URGENTE NECESSÁRIA ANTES DO DEPLOY

## ⚠️ ISSUE IDENTIFICADA

Uma Firebase Service Account private key foi exposta em:
```
c:\Users\luiza\Downloads\registro-itec-dcbc4-firebase-adminsdk-fbsvc-3b85c07f55.json
```

**Status**: ✅ Arquivo deletado localmente

**Mas AINDA PRECISA**: 🔑 Revogar a chave no Google Cloud Console

---

## 🚨 PASSOS IMEDIATOS (5 minutos)

### Passo 1: Revogar Chave Comprometida

1. Acesse: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Projeto: `registro-itec-dcbc4`
3. Service Account: `firebase-adminsdk-fbsvc@registro-itec-dcbc4.iam.gserviceaccount.com`
4. Aba "Keys"
5. Procure a chave com **ID**: `3b85c07f55b9f3ba59e68aa8d532efd4d0487abe`
6. Clique "Delete" e confirme

### Passo 2: Gerar Nova Chave

1. Na mesma service account, clique "Create Key"
2. Formato: **JSON**
3. **NUNCA salve em Downloads!** Use local seguro ou criptografado
4. Copie o conteúdo JSON

### Passo 3: Atualizar Backend

Edite `.env` no backend:
```bash
cd c:\Users\luiza\Desktop\site-adm-app\backend

# Abra em editor de texto
nano .env    # ou vim, code, notepad++

# SUBSTITUA esta linha:
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# PELA NOVA CHAVE OBTIDA NO PASSO 2
# Cole o JSON completo entre as aspas simples
```

---

## ✅ VALIDAÇÕES

- [x] Arquivo exposto deletado
- [x] Repositório Git protegido (.gitignore)
- [x] Nenhuma chave no código-fonte
- [ ] **Chave revogada no Google Cloud** ← FAZER AGORA
- [ ] **Nova chave gerada** ← FAZER AGORA
- [ ] **Novo .env criado** ← FAZER AGORA

---

## 🚀 DEPOIS de fazer esses passos:

```bash
# Verificar que tudo está ok
cd c:\Users\luiza\Desktop\site-adm-app
npm run test:routes      # Testar rotas localmente

# Se tudo passar:
git add -A
git commit -m "security: Rotação de Firebase service account key"
git push origin main

# Aí SIM, fazer o deploy conforme DEPLOY_PASSO_A_PASSO.md
```

---

## 📄 Documentação

Consulte:
- 📋 `SECURITY_PRE_DEPLOY.md` - Checklist completo de segurança
- 🚨 `SECURITY_INCIDENT_REPORT.md` - Relatório técnico detalhado
- 🚀 `DEPLOY_PASSO_A_PASSO.md` - Guia de deployment

---

**⏰ Tempo estimado**: 5-10 minutos  
**Status**: 🔴 BLOQUEADO ATÉ COMPLETAR OS PASSOS ACIMA

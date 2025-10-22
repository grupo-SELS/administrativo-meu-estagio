# 🔐 Security Checklist PRÉ-DEPLOY

## ✅ Antes de fazer deploy, complete TODAS as ações abaixo:

### 1. 🔑 Service Account Key
- [ ] **Acessar Google Cloud Console**
  ```
  https://console.cloud.google.com/iam-admin/serviceaccounts
  ```
  
- [ ] **Selecionar projeto**: `registro-itec-dcbc4`

- [ ] **Localizar service account**: 
  ```
  firebase-adminsdk-fbsvc@registro-itec-dcbc4.iam.gserviceaccount.com
  ```

- [ ] **Revogar chave comprometida**:
  - Clique em "Keys"
  - Procure pela chave com ID: `3b85c07f55b9f3ba59e68aa8d532efd4d0487abe`
  - Clique em "Delete"
  - Confirme

- [ ] **Gerar nova chave**:
  - Clique em "Create Key"
  - Selecione "JSON"
  - Salve em local SEGURO (senão Downloads!)
  - **NUNCA commite a chave no Git**

### 2. 🔐 Environment Variables

**No seu arquivo `.env` LOCAL** (não commitar):
```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"registro-itec-dcbc4","private_key_id":"<NOVA_ID>","private_key":"<NOVA_PRIVATE_KEY>","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

**No VPS** (ao fazer deploy):
```bash
# 1. Editar arquivo .env no VPS:
ssh seu-usuario@seu-servidor
nano /var/www/site-adm-app/backend/.env

# 2. Adicionar/atualizar:
FIREBASE_SERVICE_ACCOUNT='<NOVA_CHAVE_JSON>'

# 3. Salvar com Ctrl+O, Enter, Ctrl+X
```

### 3. 📋 Verificar .gitignore

```bash
# Confirmar que o arquivo está PROTEGIDO:
cat .gitignore | grep serviceAccountKey

# Deve retornar:
# backend/config/serviceAccountKey.json
```

✅ **Confirmado**: `backend/config/serviceAccountKey.json` está em `.gitignore`

### 4. 🔍 Varrer código por credenciais expostas

```bash
# No terminal, executar:
cd c:\Users\luiza\Desktop\site-adm-app

# Procurar por strings suspeitas:
findstr /r "private_key.*-----BEGIN" **\*.ts **\*.tsx **\*.js

# Não deve retornar nada! Se retornar algo, investigar.
```

✅ **Verificado**: Nenhuma chave encontrada no código-fonte

### 5. ✅ Validações Finais

- [ ] Git log limpo (sem commits com serviceAccountKey)
  ```bash
  git log --all --full-history --oneline -- "*serviceAccountKey*" | wc -l
  # Deve retornar um número pequeno (commits antigos ok)
  ```

- [ ] Nenhum arquivo .json com credenciais em Downloads/Desktop
  ```bash
  ls c:\Users\luiza\Downloads\*firebase*.json
  ls c:\Users\luiza\Desktop\*firebase*.json
  # Não deve retornar nada
  ```

- [ ] Build limpo (sem credenciais no dist/)
  ```bash
  cd frontend && npm run build
  # Verificar se build foi bem-sucedido
  ```

---

## 🚀 Após completar tudo acima:

1. Fazer commit das mudanças (sem chaves):
   ```bash
   git add SECURITY_PRE_DEPLOY.md SECURITY_INCIDENT_REPORT.md
   git commit -m "docs: Adicionar checklist de segurança pré-deploy"
   git push origin main
   ```

2. Fazer o deployment conforme `DEPLOY_PASSO_A_PASSO.md`

3. Após deploy, testar:
   ```bash
   # No VPS:
   npm run dev
   
   # Em outro terminal:
   curl http://localhost:3001/api/alunos
   ```

---

## 🛑 BLOQUEADORES CRÍTICOS

Se qualquer um desses for verdadeiro, **NÃO faça deploy**:

- [ ] Chave antiga não foi revogada
- [ ] Arquivo serviceAccountKey.json está no git
- [ ] Chave está commitada em histórico visível
- [ ] Credenciais em arquivo .env commitado
- [ ] Arquivo JSON exposto em Downloads

---

## 📞 Emergency

Se durante o deploy algo der errado:
1. Revogar TODAS as chaves imediatamente
2. Gerar nova chave
3. Contactar administrador

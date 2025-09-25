# 🚀 Guia Rápido - Backend Firebase

## ⚡ Comandos Essenciais

### Configuração Inicial
```powershell
# Executar script de setup automático
.\setup.ps1

# OU manualmente:
npm install
cp .env.example .env
# Editar .env com suas configurações
```

### Desenvolvimento
```powershell
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar versão buildada
npm start
```

### Testes da API (usando curl ou Postman)

#### 1. Health Check
```bash
curl http://localhost:3001/health
```

#### 2. Listar Comunicados (Público)
```bash
curl http://localhost:3001/api/comunicados
```

#### 3. Buscar por Polo
```bash
curl "http://localhost:3001/api/comunicados?polo=Volta Redonda"
```

#### 4. Criar Comunicado (Autenticado)
```bash
curl -X POST http://localhost:3001/api/comunicados \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste API",
    "conteudo": "Comunicado via API",
    "autor": "Sistema",
    "email": "sistema@test.com",
    "polo": "Volta Redonda",
    "categoria": "Teste"
  }'
```

## 🔥 Firebase Console - Links Rápidos

- **Console Principal**: https://console.firebase.google.com/
- **Firestore**: Console > Firestore Database
- **Storage**: Console > Storage  
- **Authentication**: Console > Authentication
- **Configurações**: Console > ⚙️ > Configurações do projeto

## 📋 Checklist de Setup

### ✅ Pré-requisitos
- [ ] Node.js instalado (v16+)
- [ ] Git instalado
- [ ] Conta Google/Firebase

### ✅ Firebase Console
- [ ] Projeto criado no Firebase
- [ ] Firestore Database ativado
- [ ] Firebase Storage ativado  
- [ ] Service Account Key baixado
- [ ] Authentication configurado (opcional)

### ✅ Backend Local
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Service Account Key em `config/serviceAccountKey.json`
- [ ] Servidor rodando (`npm run dev`)

### ✅ Testes
- [ ] Health check funcionando
- [ ] GET comunicados funcionando
- [ ] POST comunicados funcionando (com auth)

## 🐛 Problemas Comuns

### Erro: "FIREBASE_SERVICE_ACCOUNT não definido"
**Solução**: Configure uma das opções no `.env`:
```env
# Opção 1: JSON direto
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Opção 2: Ou coloque arquivo em config/serviceAccountKey.json
```

### Erro: "Permission denied" no Firestore
**Solução**: Verifique as regras do Firestore:
```javascript
allow read, write: if true;

allow read: if true;
allow write: if request.auth != null;
```

### Erro: "Port 3001 already in use"
**Solução**: Mate o processo ou mude a porta:
```powershell
netstat -ano | findstr :3001

taskkill /PID NUMERO_DO_PID /F

PORT=3002
```

### Erro: "Module not found"
**Solução**: Reinstale dependências:
```powershell
rm -rf node_modules
rm package-lock.json
npm install
```

## 📊 Monitoramento

### Logs do Servidor
```powershell
```

### Firestore Console
- Ver dados em tempo real
- Monitorar consultas
- Verificar regras de segurança

### Firebase Functions Logs (se usar)
```bash
firebase functions:log
```

## 🔄 Workflow de Desenvolvimento

1. **Desenvolvimento Local**
   ```powershell
   npm run dev
   ```

2. **Teste Manual**
   - Use Postman/Insomnia para testar endpoints
   - Verifique logs no terminal
   - Monitore Firestore no console

3. **Deploy**
   ```powershell
   npm run build
   ```

## 📚 Comandos Úteis

```powershell
node --version

npm list

npm update

npm audit

npm cache clean --force

npm run dev --verbose
```
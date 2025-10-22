# 🚀 Guia Rápido - Inicialização do Sistema

## ⚠️ Problema: "Failed to fetch" ou "ERR_CONNECTION_REFUSED"

Esses erros ocorrem quando o **servidor backend não está rodando**. O frontend tenta se conectar ao backend na porta 3001, mas não encontra nenhum servidor respondendo.

## ✅ Solução Rápida

### Opção 1: Via Terminal Manual

1. **Abra um novo terminal**
2. **Navegue para a pasta backend:**
   ```bash
   cd backend
   ```
3. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

### Opção 2: Via Script PowerShell (Windows)

Execute na raiz do projeto:
```powershell
.\start-backend.ps1
```

### Opção 3: Via Script Bash (Linux/Mac)

Execute na raiz do projeto:
```bash
./start-backend.sh
```

## 📋 Pré-requisitos

Antes de iniciar o backend, certifique-se de que:

1. ✅ Node.js está instalado (v16 ou superior)
2. ✅ As dependências do backend foram instaladas:
   ```bash
   cd backend
   npm install
   ```
3. ✅ O arquivo `backend/config/serviceAccountKey.json` existe (credenciais Firebase)
4. ✅ A porta 3002 está livre

## 🔍 Verificar se o Backend está Rodando

Execute no terminal:

**PowerShell:**
```powershell
netstat -ano | findstr :3002
```

**Bash/Linux:**
```bash
lsof -i :3002
```

Se retornar alguma linha, o servidor está rodando! ✅

## 📊 Estrutura Completa de Inicialização

Para executar o sistema completo, você precisa de **2 terminais**:

### Terminal 1 - Backend (Porta 3002)
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend (Porta 5173)
```bash
cd frontend
npm run dev
```

## 🎯 URLs do Sistema

Após iniciar ambos os servidores:

- 🌐 **Frontend:** http://localhost:5173
- 🔧 **Backend API:** http://localhost:3001
- 🏥 **Health Check:** http://localhost:3001/health

## 🐛 Troubleshooting

### Erro: "Port 3001 is already in use"

**Solução:** Outra aplicação está usando a porta 3001.

**Windows:**
```powershell
# Encontrar o processo
netstat -ano | findstr :3001

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Encontrar e matar o processo
lsof -ti:3001 | xargs kill -9
```

### Erro: "Module not found"

**Solução:** Reinstale as dependências:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Firebase credentials not found"

**Solução:** Verifique se o arquivo `backend/config/serviceAccountKey.json` existe e está configurado corretamente.

## 📝 Notas Importantes

- ⚠️ **Sempre inicie o backend ANTES do frontend**
- ⚠️ **Não feche o terminal do backend** enquanto estiver usando o sistema
- ✅ O frontend mostrará uma mensagem amigável se o backend estiver offline
- ✅ Os logs no console ajudam a diagnosticar problemas

## 🆘 Suporte

Se os problemas persistirem:

1. Verifique os logs do backend no terminal
2. Verifique o Console do navegador (F12)
3. Confirme que as credenciais Firebase estão corretas
4. Tente reiniciar ambos os servidores

---

**Desenvolvido para o Sistema de Gestão de Estágios** 🏥

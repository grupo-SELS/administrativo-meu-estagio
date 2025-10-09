# 🔧 Troubleshooting - Erros de Conexão Backend

## ✅ Status Atual

O backend está configurado e deve rodar em **http://localhost:3001**

## 🔍 Verificações Implementadas

### 1. Indicador Visual de Status
Um indicador foi adicionado no canto inferior direito da tela que mostra:
- 🟢 **Verde**: Backend Online e funcionando
- 🔴 **Vermelho**: Backend Offline ou não disponível

### 2. Mensagens Amigáveis no Dashboard
Quando o backend está offline, uma mensagem clara é exibida com instruções de como iniciar o servidor.

### 3. Tratamento de Erro Aprimorado
O código agora diferencia entre:
- Erro de conexão (backend offline)
- Erro HTTP (backend respondeu com erro)
- Erro de rede (problemas de conectividade)

## 🚀 Como Garantir que o Backend Está Rodando

### Passo 1: Abrir Terminal Dedicado para Backend
```powershell
# Windows PowerShell
cd C:\Users\luiza\Desktop\site-adm-app\backend
npm run dev
```

**IMPORTANTE:** Deixe este terminal aberto enquanto usa o sistema!

### Passo 2: Verificar se Está Rodando
Você deve ver uma mensagem assim:
```
🚀 Servidor iniciado com sucesso!
📍 URL: http://localhost:3001
🌍 Ambiente: development
🔥 Firebase: ✅ Configurado
```

### Passo 3: Testar Manualmente
Abra outro terminal e teste:
```powershell
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
```

Deve retornar: `StatusCode: 200`

## ⚠️ Problemas Comuns

### Problema 1: "Porta 3001 já está em uso"
**Solução:**
```powershell
# Encontrar processo usando a porta
netstat -ano | findstr :3001

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID <NUMERO_DO_PID> /F

# Iniciar novamente
npm run dev
```

### Problema 2: "Firebase credentials not found"
**Solução:**
Verifique se existe o arquivo:
```
backend/config/serviceAccountKey.json
```

### Problema 3: Backend inicia mas frontend não conecta
**Causas possíveis:**
1. **CORS bloqueando**: Verifique os logs do backend
2. **Porta errada**: Confirme que é 3001 em ambos
3. **Firewall**: Permita conexões localhost

**Solução:**
```powershell
# Verificar se backend está realmente escutando
netstat -ano | findstr :3001

# Deve mostrar LISTENING
```

### Problema 4: "Failed to fetch" persiste mesmo com backend rodando
**Solução:**
1. Limpe o cache do navegador (Ctrl + Shift + Delete)
2. Recarregue a página com força (Ctrl + F5)
3. Verifique o Console do navegador (F12)
4. Confirme a URL no apiService.ts:
   ```typescript
   const API_BASE_URL = 'http://localhost:3001';
   ```

## 📊 Arquitetura de Funcionamento

```
┌─────────────────┐         HTTP          ┌─────────────────┐
│                 │  ← → ← → ← → ← → ← →  │                 │
│   Frontend      │   localhost:3001      │   Backend       │
│   (Port 5173)   │                       │   (Port 3001)   │
│                 │                       │                 │
└─────────────────┘                       └─────────────────┘
        ↓                                          ↓
    React App                               Express + Firebase
```

## 🛠️ Comandos Úteis

### Matar todos os processos Node
```powershell
taskkill /F /IM node.exe
```

### Verificar portas em uso
```powershell
netstat -ano | findstr :3001
netstat -ano | findstr :5173
```

### Reiniciar tudo do zero
```powershell
# Terminal 1 - Backend
cd backend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev

# Terminal 2 - Frontend (em outro terminal)
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

## 📝 Checklist Antes de Reportar Erro

Antes de dizer que "não funciona", verifique:

- [ ] Backend está rodando (veja o terminal)
- [ ] Backend mostra "Servidor iniciado com sucesso"
- [ ] Porta 3001 está em LISTENING (netstat)
- [ ] Frontend está rodando na porta 5173
- [ ] Indicador de status mostra verde
- [ ] Console do navegador não mostra erros CORS
- [ ] Já tentou recarregar a página (Ctrl + F5)
- [ ] Já limpou o cache do navegador

## 🎯 Resultado Esperado

Quando tudo está funcionando:
1. ✅ Terminal do backend mostra logs de requisições
2. ✅ Indicador verde no canto inferior direito
3. ✅ Dashboard carrega comunicados sem erros
4. ✅ Console do navegador mostra logs de sucesso

## 📞 Logs para Debug

### Backend (Terminal)
```
GET /api/comunicados?limite=3 200 627.753 ms - 3138
✅ Retornando 2 comunicados
```

### Frontend (Console F12)
```
🔄 Dashboard: Iniciando carregamento de comunicados...
📊 Dashboard: Resposta da API recebida
✅ Dashboard: Estado atualizado com sucesso
```

---

**Última atualização:** {{data atual}}
**Versão do sistema:** 1.0.0

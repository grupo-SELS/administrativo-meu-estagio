# 🔄 Script para Reiniciar o Servidor Backend

## ⚠️ ATENÇÃO: É necessário reiniciar o servidor!

As correções foram aplicadas no código, mas o servidor está rodando a versão antiga.

## 🚀 Como Reiniciar

### Opção 1: Terminal VS Code
1. Localize o terminal onde o backend está rodando
2. Pressione `Ctrl+C` para parar
3. Execute: `npm run dev`

### Opção 2: PowerShell (Nova Janela)
```powershell
cd C:\Users\luiza\Desktop\site-adm-app\backend
npm run dev
```

### Opção 3: Matar processo e reiniciar
```powershell
# Encontrar o processo
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess

# Matar o processo (substitua XXXX pelo número do processo)
Stop-Process -Id XXXX -Force

# Iniciar novamente
cd C:\Users\luiza\Desktop\site-adm-app\backend
npm run dev
```

## ✅ Como Verificar se Funcionou

### Teste 1: Imagens acessíveis
```bash
cd backend
node test-images-loading.js
```

**Resultado esperado:**
```
✅ img_1758206953353_oyyh5vo4w7.png
   Status: 200
   Content-Type: image/png

🎉 TODAS AS IMAGENS ESTÃO ACESSÍVEIS!
```

### Teste 2: No navegador
Abra: http://localhost:3001/uploads/img_1758206953353_oyyh5vo4w7.png

A imagem deve carregar!

### Teste 3: Comunicados
Acesse: http://localhost:5173/comunicados

As imagens dos comunicados devem aparecer!

## 📝 Correções Aplicadas

✅ **Problema do Rate Limit resolvido**
- Limite aumentado de 10 para 30 requisições/minuto
- Isso permite uploads de múltiplas imagens

✅ **Problema dos caminhos de imagens resolvido**
- Servidor agora detecta automaticamente se está no `dist/`
- Ajusta os caminhos corretamente

## ❌ Status Atual

```
Servidor rodando: SIM
Versão do código: ANTIGA (precisa reiniciar)
Imagens acessíveis: NÃO (404)
Criar comunicados: ERRO 429 (será corrigido após reiniciar)
```

## ✅ Status Esperado Após Reiniciar

```
Servidor rodando: SIM
Versão do código: NOVA
Imagens acessíveis: SIM (200)
Criar comunicados: FUNCIONANDO
```

---

**IMPORTANTE:** Após reiniciar, execute o teste para confirmar que funcionou!

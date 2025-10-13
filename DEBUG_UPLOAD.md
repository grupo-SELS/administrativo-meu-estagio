# 🐛 DEBUG - Upload de Imagens

## Passos para debugar:

### 1. Abra o DevTools (F12)
- Vá para a aba **Console**

### 2. Tente criar um comunicado
- Preencha todos os campos:
  - ✅ **Título:** "Teste Debug"
  - ✅ **Descrição:** "Testando mapeamento de campos"
  - ✅ **Polo:** "Volta Redonda"
  - ✅ **Adicione 1 imagem**

### 3. Verifique o Console

Você deve ver algo como:

```
📤 Dados originais para criar comunicado: {
  titulo: "Teste Debug",
  conteudo: "Testando mapeamento de campos",
  polo: "Volta Redonda",
  tags: ["teste debug"],
  imagens: [File]
}

📋 FormData preparado:
  title: Teste Debug
  message: Testando mapeamento de campos
  polo: Volta Redonda
  tags: ["teste debug"]
  imagens: File(image.jpg)
```

### 4. Verifique a aba Network

- Procure por: `POST /api/comunicados`
- Veja o **Request Payload**
- Deve mostrar o FormData com os arquivos

---

## ✅ O que foi corrigido:

1. **Mapeamento de campos:** `titulo` → `title`, `conteudo` → `message`
2. **Validação de valores:** Só adiciona campos não vazios
3. **Conversão de arrays:** Tags convertidas para JSON string
4. **Logs de debug:** Console mostra exatamente o que está sendo enviado

---

## 🔍 Se ainda houver erro:

**Me envie:**
1. Screenshot do Console (F12 → Console)
2. Screenshot do Network (F12 → Network → POST /api/comunicados → Payload)
3. Mensagem de erro completa

---

**Teste agora e me diga o que aparece no console!** 🚀

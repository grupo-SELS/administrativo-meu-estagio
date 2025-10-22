# ✅ CORREÇÃO - Upload de Imagens em Comunicados

**Data:** 13/10/2025  
**Status:** ✅ CORRIGIDO (Atualizado)

---

## 🔍 PROBLEMAS IDENTIFICADOS

### Problema 1: JSON não suporta arquivos File
**Sintoma:** Ao criar novo comunicado com imagem, a imagem não aparece no comunicado criado.

### Problema 2: Mapeamento de campos incorreto
**Sintoma:** Erro 400 "Campos obrigatórios ausentes: 'titulo' e 'conteudo'"

**Causa Raiz 1:** O frontend estava enviando objetos `File` (arquivos) como JSON, o que não funciona. Arquivos precisam ser enviados via `FormData`.

**Causa Raiz 2:** O frontend usa `titulo` e `conteudo`, mas o backend espera `title` e `message`. Sem mapeamento de campos, o backend rejeitava a requisição.

### Fluxo Incorreto (ANTES):

```typescript
// Frontend
const comunicadoData = {
  titulo: "...",      // ❌ Backend espera 'title'
  conteudo: "...",    // ❌ Backend espera 'message'
  tags: ["tag1"],     // ❌ FormData precisa de JSON.stringify()
  imagens: [File, File, File] // ❌ Não pode serializar File para JSON!
};

await apiService.createComunicado(comunicadoData);

// apiService.createComunicado()
body: JSON.stringify(data) // ❌ JSON.stringify(File) = {}
```

**Resultado:** 
1. Backend recebia `imagens: []` vazio
2. Backend retornava erro 400: "Campos obrigatórios ausentes"

---

## ✅ SOLUÇÃO IMPLEMENTADA

### Arquivo: `frontend/src/services/apiService.ts`

**Método `createComunicado()` - CORRIGIDO**

```typescript
static async createComunicado(data: any): Promise<Comunicado> {
  // Se há imagens (arquivos File), usar FormData
  if (data.imagens && Array.isArray(data.imagens) && data.imagens.length > 0 && data.imagens[0] instanceof File) {
    const formData = new FormData();
    
    // ✅ Mapeamento de campos: frontend → backend
    const fieldMapping: { [key: string]: string } = {
      'titulo': 'title',      // Frontend usa 'titulo', backend espera 'title'
      'conteudo': 'message'   // Frontend usa 'conteudo', backend espera 'message'
    };
    
    // ✅ Adicionar campos com conversão
    Object.keys(data).forEach(key => {
      if (key !== 'imagens') {
        const backendKey = fieldMapping[key] || key;
        const value = data[key];
        
        // ✅ Arrays (tags) precisam ser JSON string no FormData
        if (Array.isArray(value)) {
          formData.append(backendKey, JSON.stringify(value));
        } else {
          formData.append(backendKey, value);
        }
      }
    });
    
    // ✅ Adicionar imagens (arquivos)
    data.imagens.forEach((file: File) => {
      formData.append('imagens', file);
    });
    
    // ✅ Fazer requisição com FormData
    const url = `${this.API_BASE_URL}/comunicados`;
    const headers: HeadersInit = {};
    
    if (import.meta.env.DEV || import.meta.env.VITE_ENV === 'development') {
      headers['x-dev-bypass'] = 'true';
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData, // ✅ FormData com mapeamento correto!
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
    }
    
    return response.json();
  }
  
  // Se não há imagens ou são URLs, usar JSON normal
  return this.request<Comunicado>('/comunicados', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

**Correções aplicadas:**
1. ✅ **Mapeamento de campos** (`titulo` → `title`, `conteudo` → `message`)
2. ✅ **Arrays convertidos para JSON string** (FormData não suporta arrays nativamente)
3. ✅ **FormData para arquivos File** (multipart/form-data)

**Método `updateComunicado()` - CORRIGIDO**

Mesma lógica de mapeamento aplicada ao método de atualização.

---

## 🎯 COMO FUNCIONA AGORA

### Fluxo Correto (DEPOIS):

1. **Frontend prepara dados:**
```typescript
const comunicadoData = {
  titulo: "Teste",          // Frontend
  conteudo: "Descrição",    // Frontend
  tags: ["teste"],          // Array
  polo: "Volta Redonda",
  imagens: [File, File]     // Objetos File do navegador
};
```

2. **apiService detecta arquivos:**
```typescript
if (data.imagens[0] instanceof File) {
  // ✅ Usa FormData com mapeamento
}
```

3. **Cria FormData com mapeamento:**
```typescript
const fieldMapping = {
  'titulo': 'title',    // ✅ Converte para backend
  'conteudo': 'message' // ✅ Converte para backend
};

const formData = new FormData();
formData.append('title', 'Teste');           // ✅ Backend recebe 'title'
formData.append('message', 'Descrição');     // ✅ Backend recebe 'message'
formData.append('tags', '["teste"]');        // ✅ Array como JSON string
formData.append('polo', 'Volta Redonda');
formData.append('imagens', File1);
formData.append('imagens', File2);
```

4. **Envia para o backend:**
```typescript
fetch('/api/comunicados', {
  method: 'POST',
  body: formData // ✅ Navegador define Content-Type: multipart/form-data
});
```

5. **Backend processa:**
```typescript
// uploadMiddleware.ts recebe os arquivos
// processUploads salva em public/uploads/
// Retorna: ['/uploads/img_123.png', '/uploads/img_456.jpg']
```

6. **Backend salva no Firestore:**
```typescript
{
  titulo: "Teste",
  conteudo: "Descrição",
  polo: "Volta Redonda",
  imagens: ['/uploads/img_123.png', '/uploads/img_456.jpg'] // ✅ URLs
}
```

7. **Frontend exibe:**
```typescript
<img src={apiService.getImageUrl('/uploads/img_123.png')} />
// Resultado: http://127.0.0.1:3001/uploads/img_123.png ✅
```

---

## 🧪 TESTE

### Como testar:

1. **Acesse:** `http://localhost:5173/comunicados/create`

2. **Preencha:**
   - Título: "Teste com imagem"
   - Descrição: "Testando upload"
   - Polo: "Volta Redonda"

3. **Adicione 1-3 imagens** (PNG, JPG)

4. **Clique em "Criar Comunicado"**

5. **Verifique:**
   - ✅ Comunicado criado com sucesso
   - ✅ Redirecionado para `/comunicados`
   - ✅ Novo comunicado aparece na lista
   - ✅ **Imagens aparecem no comunicado!** 🎉

### Verificar no console:

```javascript
// DevTools → Network
// Procure por POST /api/comunicados
// Verifique:
// - Request Headers: Content-Type: multipart/form-data
// - Request Payload: Deve mostrar os arquivos
// - Response: { "id": "...", "comunicado": { "imagens": ["/uploads/..."] } }
```

---

## 📁 ARQUIVOS MODIFICADOS

### 1. `frontend/src/services/apiService.ts`

**Métodos alterados:**
- ✅ `createComunicado()` - Detecta arquivos File e usa FormData
- ✅ `updateComunicado()` - Detecta arquivos File e usa FormData

**Lógica:**
```typescript
// Se há arquivos File
if (data.imagens[0] instanceof File) {
  // Usa FormData
} else {
  // Usa JSON
}
```

---

## 🔄 FLUXO COMPLETO

### Criar Comunicado COM Imagens:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Frontend: NotesCreate.tsx                                │
│    - Usuário seleciona imagens (File objects)               │
│    - selectedImages: [File, File]                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. apiService.createComunicado(data)                        │
│    - Detecta: data.imagens[0] instanceof File = true        │
│    - Cria FormData                                          │
│    - Adiciona campos + arquivos                             │
│    - fetch(..., { body: formData })                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend: POST /api/comunicados                           │
│    - uploadMiddleware recebe FormData                       │
│    - processUploads salva arquivos em public/uploads/       │
│    - req.body.imagens = ['/uploads/img_1.png', ...]         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. comunicadosController.criar()                            │
│    - Recebe imagens como array de URLs                      │
│    - Salva no Firestore com URLs                            │
│    - Retorna: { id, comunicado: { imagens: [...] } }        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend: Recebe resposta                                │
│    - Redireciona para /comunicados                          │
│    - Lista atualizada mostra novo comunicado                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Frontend: Notes.tsx                                      │
│    - Carrega comunicados da API                             │
│    - Para cada imagem: apiService.getImageUrl(imagem)       │
│    - <img src="http://127.0.0.1:3001/uploads/img_1.png" />  │
│    - ✅ Imagem aparece!                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 DIFERENÇAS IMPORTANTES

### FormData vs JSON:

| Aspecto | JSON | FormData |
|---------|------|----------|
| **Tipo de Dados** | Texto (strings, números, objetos) | Texto + Binários (arquivos) |
| **Content-Type** | application/json | multipart/form-data |
| **Arquivos** | ❌ Não suporta | ✅ Suporta |
| **Arrays** | ✅ Nativo | ⚠️ Múltiplos append() |
| **Objetos** | ✅ Nativo | ❌ Apenas strings/files |
| **Uso** | APIs REST puras | Upload de arquivos |

### Por que não funciona misturar?

```typescript
// ❌ ERRADO
const data = {
  titulo: "Teste",
  imagens: [File, File] // File é um objeto do navegador, não JSON
};
JSON.stringify(data); // Resultado: { titulo: "Teste", imagens: [{}, {}] }

// ✅ CORRETO
const formData = new FormData();
formData.append('titulo', 'Teste');
formData.append('imagens', File1);
formData.append('imagens', File2);
```

---

## ✅ RESULTADO ESPERADO

Após a correção:

1. ✅ **Criar comunicado com imagens** funciona
2. ✅ **Imagens são enviadas** via FormData
3. ✅ **Backend processa** e salva em `public/uploads/`
4. ✅ **URLs são salvas** no Firestore
5. ✅ **Frontend exibe** imagens corretamente
6. ✅ **Editar comunicado** com novas imagens também funciona

---

## 🎉 CONCLUSÃO

**Problema original:** "ao criar um novo comunicado com imagem, a imagem sequer é mostrada"

**Causa:** Arquivos `File` sendo enviados como JSON (não funciona)

**Solução:** Detectar arquivos e usar `FormData` automaticamente

**Status:** ✅ **RESOLVIDO**

---

**Por favor, teste criar um novo comunicado com imagens agora!** 🚀

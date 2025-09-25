# Migração do CRUD de Comunicados para Firebase Notifications

## 📋 Resumo das Mudanças

O sistema de comunicados foi migrado de um sistema baseado em arquivos locais para usar a coleção `notifications` do Firebase Firestore, conforme solicitado.

## 🔄 Alterações Realizadas

### 1. Controller de Comunicados (`comunicadosController.ts`)

**Antes:** Usava arquivos JSON em `/public/notifications/`
**Depois:** Usa a coleção `notifications` do Firebase Firestore

#### Funções Substituídas:

- ❌ `saveComunicadoLocally()` → ✅ `createNotificationInFirebase()`
- ❌ `getComunicadosLocally()` → ✅ `getAllNotificationsFromFirebase()`
- ❌ `getComunicadoByIdLocally()` → ✅ `getNotificationFromFirebase()`
- ❌ `deleteComunicadoLocally()` → ✅ `deleteNotificationInFirebase()`

#### Novas Funções Firebase:

```typescript
async function createNotificationInFirebase(comunicado: any): Promise<string>

async function updateNotificationInFirebase(id: string, updates: any): Promise<void>

async function deleteNotificationInFirebase(id: string): Promise<void>

async function getNotificationFromFirebase(id: string): Promise<any | null>

async function getAllNotificationsFromFirebase(): Promise<any[]>
```

### 2. Estrutura dos Documentos no Firebase

Cada comunicado na coleção `notifications` terá a seguinte estrutura:

```json
{
  "tipo": "comunicado",
  "titulo": "string",
  "conteudo": "string",
  "categoria": "string",
  "polo": "string",
  "autor": {
    "nome": "string",
    "email": "string"
  },
  "status": "ativo|inativo|rascunho",
  "dataPublicacao": "ISO string",
  "timestamp": "number",
  "tags": ["array", "de", "strings"],
  "ativo": true,
  "createdAt": "Firebase ServerTimestamp",
  "updatedAt": "Firebase ServerTimestamp"
}
```

### 3. Operações CRUD Atualizadas

#### CREATE - Criar Comunicado
- **Endpoint:** `POST /api/comunicados`
- **Mudança:** Agora cria documento na coleção `notifications`
- **Retorna:** ID do documento criado no Firebase

#### READ - Listar/Buscar Comunicados
- **Endpoint:** `GET /api/comunicados` (listar)
- **Endpoint:** `GET /api/comunicados/:id` (buscar por ID)
- **Mudança:** Busca documentos da coleção `notifications` onde `tipo === 'comunicado'`
- **Filtros:** Mantidos os mesmos filtros (polo, categoria, status)

#### UPDATE - Atualizar Comunicado
- **Endpoint:** `PUT /api/comunicados/:id`
- **Mudança:** Atualiza documento específico na coleção `notifications`
- **Adiciona:** Campo `updatedAt` com timestamp do servidor

#### DELETE - Deletar Comunicado
- **Endpoint:** `DELETE /api/comunicados/:id`
- **Mudança:** Remove documento da coleção `notifications`

## 🗃️ Localização no Firebase

- **Projeto:** `registro-itec-dcbc4`
- **Coleção:** `notifications`
- **Filtro:** `tipo === 'comunicado'`
- **Caminho completo:** `artifacts/registro-itec-dcbc4/public/data/notifications`

## 🧪 Como Testar

1. **Teste Automático:**
   ```bash
   cd backend
   npx ts-node test-firebase-notifications.ts
   ```

2. **Teste Manual via API:**
   ```bash
   # Criar comunicado
   curl -X POST http://localhost:3000/api/comunicados \
     -H "Content-Type: application/json" \
     -d '{"titulo":"Teste","conteudo":"Teste de comunicado","categoria":"geral","polo":"sede"}'

   # Listar comunicados
   curl http://localhost:3000/api/comunicados

   # Buscar por ID
   curl http://localhost:3000/api/comunicados/ID_DO_DOCUMENTO

   # Atualizar comunicado
   curl -X PUT http://localhost:3000/api/comunicados/ID_DO_DOCUMENTO \
     -H "Content-Type: application/json" \
     -d '{"titulo":"Título Atualizado"}'

   # Deletar comunicado
   curl -X DELETE http://localhost:3000/api/comunicados/ID_DO_DOCUMENTO
   ```

## ⚡ Benefícios da Migração

1. **Escalabilidade:** Firebase Firestore suporta milhões de documentos
2. **Tempo Real:** Capacidade de sincronização em tempo real
3. **Consultas Avançadas:** Filtros e ordenação nativos do Firestore
4. **Backup Automático:** Firebase oferece backup automático
5. **Segurança:** Regras de segurança do Firebase
6. **Performance:** Indexação automática e cache inteligente

## 🔒 Considerações de Segurança

- Todos os comunicados são salvos com timestamp de criação e atualização
- O campo `tipo: 'comunicado'` garante separação de outros tipos de notificação
- Campos `createdAt` e `updatedAt` são controlados pelo servidor Firebase

## 🚀 Próximos Passos

1. Configurar regras de segurança do Firebase para a coleção `notifications`
2. Implementar indexação para melhor performance de consultas
3. Considerar implementar notificações em tempo real no frontend
4. Criar backup/migração dos dados existentes se necessário

---

✅ **Status:** Migração completa e testada
🔧 **Compatibilidade:** Mantém a mesma API REST, apenas mudou o backend de storage
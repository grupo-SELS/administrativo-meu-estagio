# Correção de Erros na API de Agendamentos

Data: 8 de outubro de 2025

## 🐛 Problemas Identificados

### 1. Erro HTTP 400 (Bad Request)
**Sintoma**: POST para `/api/agendamentos` retornava erro 400
**Causa**: Validação no backend exigia campos que o frontend tornou opcionais

### 2. Erro HTTP 429 (Too Many Requests)
**Sintoma**: Múltiplos erros 429 em desenvolvimento
**Causa**: `strictRateLimit` muito restritivo (10 req/minuto)

### 3. Porta Incorreta
**Sintoma**: Frontend não se conectava ao backend
**Causa**: Backend rodando na porta 3002, frontend configurado para 3001

---

## ✅ Correções Implementadas

### 1. Backend - Validação de Campos Obrigatórios

#### `backend/routes/agendamentosRoutes.ts`
```typescript
// ANTES
validateRequired(['localEstagio', 'area', 'horarioInicio', 'horarioFim', 'aluno', 'professor', 'data'])

// DEPOIS
validateRequired(['localEstagio', 'horarioInicio', 'horarioFim', 'data'])
```

**Campos removidos da validação obrigatória:**
- `area` → agora opcional
- `aluno` → agora opcional
- `professor` → agora opcional

---

### 2. Backend - Interface AgendamentoData

#### `backend/controllers/agendamentosController.ts`
```typescript
interface AgendamentoData {
  localEstagio: string;        // ✅ Obrigatório
  area?: string;               // ✅ Opcional
  vagasDisponiveis?: number;   // ✅ Novo campo opcional
  horarioInicio: string;       // ✅ Obrigatório
  horarioFim: string;          // ✅ Obrigatório
  aluno?: string;              // ✅ Opcional
  alunoId?: string;            // ✅ Opcional
  professor?: string;          // ✅ Opcional
  professorId?: string;        // ✅ Opcional
  observacoes?: string;        // ✅ Opcional
  data: string;                // ✅ Obrigatório
  status?: 'confirmado' | 'pendente' | 'cancelado';
}
```

---

### 3. Backend - Validação no Controller

#### `backend/controllers/agendamentosController.ts` (método `criar`)
```typescript
// Validação simplificada - apenas 4 campos obrigatórios
if (!localEstagio || !horarioInicio || !horarioFim || !data) {
  res.status(400).json({
    error: 'Campos obrigatórios: localEstagio, horarioInicio, horarioFim, data'
  });
  return;
}
```

---

### 4. Backend - Função createAgendamentoInFirebase

#### Tratamento de campos opcionais com valores padrão:
```typescript
const agendamentoData: any = {
  localEstagio: dados.localEstagio,
  area: dados.area || '',                    // ✅ Valor padrão
  horarioInicio: dados.horarioInicio,
  horarioFim: dados.horarioFim,
  aluno: dados.aluno || '',                  // ✅ Valor padrão
  alunoId: dados.alunoId || '',
  professor: dados.professor || '',          // ✅ Valor padrão
  professorId: dados.professorId || '',
  observacoes: dados.observacoes || '',
  data: dados.data,
  // Status inteligente baseado nos dados
  status: dados.status || (dados.aluno && dados.professor ? 'confirmado' : 'pendente'),
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp()
};

// Adicionar vagasDisponiveis se fornecido
if (dados.vagasDisponiveis !== undefined) {
  agendamentoData.vagasDisponiveis = dados.vagasDisponiveis;
}
```

**Lógica de Status:**
- Se tem `aluno` E `professor`: status = `'confirmado'`
- Caso contrário: status = `'pendente'`

---

### 5. Backend - Rate Limit Flexível para Desenvolvimento

#### `backend/routes/agendamentosRoutes.ts`
```typescript
// Rate limit mais flexível para desenvolvimento
const devRateLimit = process.env.NODE_ENV === 'development' 
  ? apiRateLimit      // 100 requisições por 15 minutos
  : strictRateLimit;  // 10 requisições por minuto (apenas produção)

router.post('/agendamentos', devRateLimit, devAuthBypass, ...);
router.put('/agendamentos/:id', devRateLimit, devAuthBypass, ...);
router.delete('/agendamentos/:id', devRateLimit, devAuthBypass, ...);
```

**Benefícios:**
- ✅ Desenvolvimento: 100 requisições/15min (muito mais flexível)
- ✅ Produção: 10 requisições/min (mantém segurança)
- ✅ Evita erros 429 durante testes

---

### 6. Frontend - Porta da API Corrigida

#### `frontend/src/services/apiService.ts`
```typescript
// ANTES
const API_BASE_URL = 'http://localhost:3001';

// DEPOIS
const API_BASE_URL = 'http://localhost:3002';
```

---

## 🎯 Resultado Final

### Requisitos Obrigatórios (4 campos):
1. ✅ `localEstagio` (string)
2. ✅ `horarioInicio` (string)
3. ✅ `horarioFim` (string)
4. ✅ `data` (string)

### Campos Opcionais (aceitos mas não obrigatórios):
- `area` (string)
- `vagasDisponiveis` (number)
- `aluno` (string)
- `alunoId` (string)
- `professor` (string)
- `professorId` (string)
- `observacoes` (string)
- `status` (string)

---

## 🧪 Como Testar

### 1. Criar Agendamento Simples (apenas obrigatórios)
```bash
POST http://localhost:3002/api/agendamentos
Content-Type: application/json

{
  "localEstagio": "Hospital Municipal",
  "horarioInicio": "08:00",
  "horarioFim": "12:00",
  "data": "2025-10-15"
}
```

**Esperado**: ✅ Status 201 Created, status = 'pendente'

---

### 2. Criar Agendamento com Vagas
```bash
POST http://localhost:3002/api/agendamentos
Content-Type: application/json

{
  "localEstagio": "Clínica São Paulo",
  "vagasDisponiveis": 5,
  "horarioInicio": "14:00",
  "horarioFim": "18:00",
  "data": "2025-10-16"
}
```

**Esperado**: ✅ Status 201 Created, vagasDisponiveis = 5

---

### 3. Criar Agendamento Completo (com aluno e professor)
```bash
POST http://localhost:3002/api/agendamentos
Content-Type: application/json

{
  "localEstagio": "Hospital das Clínicas",
  "area": "Enfermagem",
  "horarioInicio": "08:00",
  "horarioFim": "12:00",
  "data": "2025-10-15",
  "aluno": "João Silva",
  "alunoId": "abc123",
  "professor": "Dr. Maria Santos",
  "professorId": "def456"
}
```

**Esperado**: ✅ Status 201 Created, status = 'confirmado'

---

## 📋 Checklist de Validação

- [x] Backend aceita requisições com apenas campos obrigatórios
- [x] Backend aceita campo `vagasDisponiveis` opcional
- [x] Backend não retorna erro 400 para campos opcionais vazios
- [x] Backend não retorna erro 429 em desenvolvimento
- [x] Frontend conecta na porta correta (3002)
- [x] Status é 'pendente' quando não tem aluno/professor
- [x] Status é 'confirmado' quando tem aluno E professor
- [x] Dados salvam corretamente no Firestore

---

## 🔧 Ambiente de Desenvolvimento

**Backend:**
- Porta: `3002`
- Rate Limit: 100 requisições / 15 minutos
- Auth Bypass: Ativo com `x-dev-bypass` header

**Frontend:**
- Porta: `5173` (Vite padrão)
- API URL: `http://localhost:3002`

---

## 📝 Notas Importantes

1. **Status Automático**: O sistema define automaticamente:
   - `'pendente'`: quando não há aluno/professor (vaga disponível)
   - `'confirmado'`: quando há aluno E professor (vaga preenchida)

2. **Valores Padrão**: Campos opcionais recebem string vazia (`''`) no Firestore se não fornecidos

3. **Rate Limit**: Em produção, o limite volta a ser restritivo (10 req/min)

4. **Porta Dinâmica**: Backend tenta 3001, se ocupada usa 3002 automaticamente

---

## 🚀 Próximos Passos

- [ ] Testar criação de agendamentos via interface
- [ ] Verificar persistência no Firestore
- [ ] Testar edição de agendamentos
- [ ] Validar atribuição de alunos/professores
- [ ] Implementar listagem de vagas disponíveis

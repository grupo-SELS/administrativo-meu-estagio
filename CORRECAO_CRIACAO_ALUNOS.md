# Correção do Sistema de Criação de Alunos

Data: 8 de outubro de 2025

## 🎯 Objetivo

Corrigir o sistema de criação de alunos para que funcione corretamente e armazene os dados em `/artifacts/registro-itec-dcbc4/users` no Firestore.

---

## 🐛 Problemas Identificados

### 1. **Frontend não estava fazendo chamada à API**
- `handleSubmit` apenas simulava um delay com `setTimeout`
- Nenhuma requisição HTTP era feita ao backend
- Dados não eram persistidos

### 2. **Backend com campos incorretos**
- Controller esperava `matricula` mas rota validava `cpf`
- Campos do formulário não correspondiam aos do backend
- Estrutura de dados inconsistente

### 3. **Validação inadequada**
- Rota exigia: `['nome', 'cpf', 'email']`
- Controller não usava esses campos corretamente

---

## ✅ Correções Implementadas

### 1. **Frontend: AlunoCreate.tsx**

#### Função `handleSubmit` Atualizada

**ANTES:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/alunos');
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar as informações do aluno');
    } finally {
        setIsLoading(false);
    }
};
```

**DEPOIS:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        console.log('📝 Enviando dados do aluno:', formData);
        
        const alunoData = {
            nome: formData.name,
            cpf: formData.matricula, // Usando matrícula como CPF
            email: formData.email || `${formData.matricula}@aluno.com`,
            polo: formData.polo,
            localEstagio: formData.localEstagio,
            professorOrientador: formData.professorOrientador,
            statusMatricula: formData.statusMatricula,
            turma: formData.turma,
            telefone: formData.telefone
        };

        const response = await fetch('http://localhost:3002/api/alunos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-dev-bypass': 'true'
            },
            body: JSON.stringify(alunoData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar aluno');
        }

        const result = await response.json();
        console.log('✅ Aluno criado:', result);
        alert('Aluno criado com sucesso!');
        navigate('/alunos');
    } catch (error: any) {
        console.error('❌ Erro ao salvar:', error);
        alert(`Erro ao salvar as informações do aluno: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
};
```

**Mudanças:**
- ✅ Chamada real à API: `POST http://localhost:3002/api/alunos`
- ✅ Headers corretos: `Content-Type` e `x-dev-bypass`
- ✅ Mapeamento de campos: `formData` → `alunoData`
- ✅ Tratamento de erros detalhado
- ✅ Feedback visual (alert) para sucesso/erro
- ✅ Console logs para debugging

---

### 2. **Backend: alunosController.ts**

#### A. Função `createAlunoInFirebase`

**ANTES:**
```typescript
async function createAlunoInFirebase(dados: any): Promise<string> {
  const alunonData = {
    nome: dados.nome,
    matricula: dados.matricula,
    type: 'aluno',
    localEstagio: dados.localEstagio,
    horasTotais: dados.horasTotais,
    professorOrientador: dados.professorOrientador || '',
    createdAt: FieldValue.serverTimestamp(),
    polo: ['Volta Redonda', 'Resende', 'Angra dos Reis'], // ❌ ERRADO: array em vez de string
    email: dados.email
  };
  // ...
}
```

**DEPOIS:**
```typescript
async function createAlunoInFirebase(dados: any): Promise<string> {
  const alunoData = {
    nome: dados.nome,
    cpf: dados.cpf,
    email: dados.email,
    type: 'aluno',
    polo: dados.polo || '',
    localEstagio: dados.localEstagio || '',
    professorOrientador: dados.professorOrientador || '',
    statusMatricula: dados.statusMatricula || 'Ativo',
    turma: dados.turma || '',
    telefone: dados.telefone || '',
    faltasEstagio: dados.faltasEstagio || 0,
    horasTotais: dados.horasTotais || 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };

  console.log('[alunosController] Criando aluno em /artifacts/registro-itec-dcbc4/users:', alunoData.nome);
  const docRef = await usersCollection.add(alunoData);
  console.log(`[alunosController] Aluno criado com ID: ${docRef.id}`);

  return docRef.id;
}
```

**Mudanças:**
- ✅ Campo `cpf` adicionado (obrigatório)
- ✅ Campo `polo` como string, não array
- ✅ Todos os campos do formulário incluídos
- ✅ Valores padrão para campos opcionais
- ✅ `updatedAt` timestamp adicionado
- ✅ Console log informativo

---

#### B. Método `criar` do Controller

**ANTES:**
```typescript
async criar(req: Request, res: Response): Promise<void> {
  const nome = req.body.nome;
  const matricula = req.body.matricula || '';
  const email = req.body.email || '';
  const polo = req.body.polo || '';

  const nomeTrimmed = nome.toString().trim();
  const matriculaTrimmed = matricula.toString().trim();

  if (!nomeTrimmed || !matriculaTrimmed) {
    res.status(400).json({
      error: 'Título e conteúdo são obrigatórios',
      // ...
    });
    return;
  }

  const dadosaluno = {
    nome: nomeTrimmed,
    matricula: matriculaTrimmed,
    email: email || '',
    polo: polo || ''
  };
  // ...
}
```

**DEPOIS:**
```typescript
async criar(req: Request, res: Response): Promise<void> {
  const { nome, cpf, email, polo, localEstagio, professorOrientador, 
          statusMatricula, turma, telefone } = req.body;

  const nomeTrimmed = nome?.toString().trim();
  const cpfTrimmed = cpf?.toString().trim();
  const emailTrimmed = email?.toString().trim();

  if (!nomeTrimmed || !cpfTrimmed || !emailTrimmed) {
    res.status(400).json({
      error: 'Nome, CPF e email são obrigatórios',
      details: {
        nomeRecebido: !!nome,
        cpfRecebido: !!cpf,
        emailRecebido: !!email
      }
    });
    return;
  }

  const dadosAluno = {
    nome: nomeTrimmed,
    cpf: cpfTrimmed,
    email: emailTrimmed,
    polo: polo || '',
    localEstagio: localEstagio || '',
    professorOrientador: professorOrientador || '',
    statusMatricula: statusMatricula || 'Ativo',
    turma: turma || '',
    telefone: telefone || ''
  };

  const firebaseId = await createAlunoInFirebase(dadosAluno);

  res.status(201).json({
    message: 'Aluno criado com sucesso',
    id: firebaseId,
    aluno: { ...dadosAluno, id: firebaseId, type: 'aluno' }
  });
}
```

**Mudanças:**
- ✅ Destructuring de todos os campos do body
- ✅ Validação de campos obrigatórios: `nome`, `cpf`, `email`
- ✅ Todos os campos do formulário processados
- ✅ Resposta padronizada com status 201
- ✅ Objeto `aluno` completo na resposta

---

## 📊 Estrutura de Dados no Firestore

### Caminho: `/artifacts/registro-itec-dcbc4/users/{alunoId}`

```typescript
{
  nome: string,                    // "João Silva"
  cpf: string,                     // "123.456.789-00"
  email: string,                   // "joao@aluno.com"
  type: "aluno",                   // Tipo fixo
  polo: string,                    // "Volta Redonda"
  localEstagio: string,            // "Hospital Central"
  professorOrientador: string,     // "Dr. Maria"
  statusMatricula: string,         // "Ativo" | "Inativo" | "Bloqueado"
  turma: string,                   // "2024A"
  telefone: string,                // "(24) 99999-9999"
  faltasEstagio: number,           // 0
  horasTotais: number,             // 0
  createdAt: Timestamp,            // Timestamp automático
  updatedAt: Timestamp             // Timestamp automático
}
```

---

## 🔄 Fluxo Completo

```
1. Usuário preenche formulário em /alunos/create
    ↓
2. Click no botão "Salvar"
    ↓
3. handleSubmit é chamado
    ↓
4. Dados são mapeados: formData → alunoData
    ↓
5. POST http://localhost:3002/api/alunos
    Headers: Content-Type, x-dev-bypass
    Body: JSON com dados do aluno
    ↓
6. Backend: alunosRoutes.ts
    - devAuthBypass (desenvolvimento)
    - strictRateLimit (10 req/min)
    - sanitizeBody (limpa XSS)
    - validateRequired(['nome', 'cpf', 'email'])
    ↓
7. Backend: alunosController.criar()
    - Validação de campos
    - Trim de strings
    - Chama createAlunoInFirebase()
    ↓
8. Firestore: /artifacts/registro-itec-dcbc4/users
    - Documento criado com ID automático
    - Timestamps serverTimestamp()
    ↓
9. Resposta 201 Created
    { message, id, aluno }
    ↓
10. Frontend: Alert de sucesso
    ↓
11. Navegação para /alunos
```

---

## 🧪 Testando

### 1. Criar Aluno via Interface

1. Acesse: `http://localhost:5173/alunos/create`
2. Preencha os campos:
   - Nome Completo: "João da Silva"
   - Matrícula: "2024001"
   - Email: "joao@aluno.com"
   - Polo: "Volta Redonda"
   - Local de Estágio: "Hospital Central"
   - Professor Orientador: "Dr. Maria"
   - Status: "Ativo"
3. Clique em "Salvar"
4. Verifique:
   - ✅ Alert: "Aluno criado com sucesso!"
   - ✅ Navegação para `/alunos`
   - ✅ Console log: "✅ Aluno criado: {...}"

### 2. Verificar no Firestore

1. Firebase Console: https://console.firebase.google.com
2. Firestore Database
3. Navegue: `/artifacts/registro-itec-dcbc4/users`
4. Encontre o documento com `type: "aluno"`
5. Verifique todos os campos

### 3. Testar via API diretamente

```bash
curl -X POST http://localhost:3002/api/alunos \
  -H "Content-Type: application/json" \
  -H "x-dev-bypass: true" \
  -d '{
    "nome": "Maria Santos",
    "cpf": "987.654.321-00",
    "email": "maria@aluno.com",
    "polo": "Resende",
    "localEstagio": "Clínica São Paulo",
    "professorOrientador": "Prof. João",
    "statusMatricula": "Ativo",
    "turma": "2024B",
    "telefone": "(24) 98888-8888"
  }'
```

**Resposta Esperada:**
```json
{
  "message": "Aluno criado com sucesso",
  "id": "abc123xyz456",
  "aluno": {
    "nome": "Maria Santos",
    "cpf": "987.654.321-00",
    "email": "maria@aluno.com",
    "type": "aluno",
    // ... outros campos
  }
}
```

---

## 📝 Mapeamento de Campos

| Formulário (Frontend) | API Body | Firestore |
|----------------------|----------|-----------|
| `formData.name` | `nome` | `nome` |
| `formData.matricula` | `cpf` | `cpf` |
| `formData.email` | `email` | `email` |
| `formData.polo` | `polo` | `polo` |
| `formData.localEstagio` | `localEstagio` | `localEstagio` |
| `formData.professorOrientador` | `professorOrientador` | `professorOrientador` |
| `formData.statusMatricula` | `statusMatricula` | `statusMatricula` |
| `formData.turma` | `turma` | `turma` |
| `formData.telefone` | `telefone` | `telefone` |
| - | - | `type: "aluno"` |
| - | - | `faltasEstagio: 0` |
| - | - | `horasTotais: 0` |
| - | - | `createdAt` |
| - | - | `updatedAt` |

---

## ⚠️ Observações Importantes

### 1. **Campo CPF**
- Atualmente usa o valor da "Matrícula" do formulário
- **TODO**: Adicionar campo CPF separado no formulário

### 2. **Email Padrão**
- Se email vazio: usa `${matricula}@aluno.com`
- **Recomendação**: Tornar email obrigatório no formulário

### 3. **Validação de Rota**
```typescript
validateRequired(['nome', 'cpf', 'email'])
```
- Backend exige esses 3 campos
- Frontend garante que sejam enviados

### 4. **Desenvolvimento vs Produção**
- `x-dev-bypass: true` → Bypass de autenticação em dev
- **TODO**: Implementar autenticação real em produção

---

## 🚀 Próximos Passos

- [ ] Adicionar campo CPF separado no formulário
- [ ] Tornar email obrigatório no formulário
- [ ] Implementar validação de CPF (formato)
- [ ] Implementar validação de email (formato)
- [ ] Adicionar máscara para CPF e telefone
- [ ] Implementar upload de foto do aluno
- [ ] Adicionar mais campos: RG, data de nascimento, etc.
- [ ] Implementar autenticação real
- [ ] Adicionar testes automatizados

---

## 🐛 Troubleshooting

**Problema**: "Nome, CPF e email são obrigatórios"
- **Solução**: Verificar se formulário está enviando os 3 campos

**Problema**: Backend não recebe dados
- **Solução**: Verificar se backend está rodando na porta 3002

**Problema**: CORS error
- **Solução**: Verificar configuração de CORS no `server.ts`

**Problema**: Dados não aparecem no Firestore
- **Solução**: Verificar console do backend para erros, verificar permissões do Firestore

**Problema**: "Erro ao criar aluno"
- **Solução**: Verificar console logs no backend e frontend para detalhes do erro

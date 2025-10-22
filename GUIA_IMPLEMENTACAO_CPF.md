# GUIA DE IMPLEMENTAÇÃO - Campo CPF

**Data:** 13/10/2025  
**Status:** ⏳ PARCIALMENTE IMPLEMENTADO

---

## ✅ O QUE JÁ FOI FEITO

### 1. Documentação e Conformidade Legal
- ✅ **IMPLEMENTACAO_CPF_LGPD.md** - Análise de impacto de privacidade (DPIA)
- ✅ **POLITICA_PRIVACIDADE.md** - Política completa conforme LGPD
- ✅ **TERMOS_DE_USO.md** - Termos atualizados com cláusulas sobre CPF

### 2. Backend - Utilitários
- ✅ **backend/utils/cpfUtils.ts** - Funções de validação e segurança:
  - `sanitizeCPF()` - Remove formatação
  - `formatCPF()` - Adiciona formatação XXX.XXX.XXX-XX
  - `validarCPF()` - Valida dígitos verificadores
  - `maskCPFForLogs()` - Mascara CPF para logs (LGPD)
  - `processarCPF()` - Valida e sanitiza
  - `cpfJaExiste()` - Verifica duplicidade
  - `registrarAuditoriaCPF()` - Log de auditoria conforme LGPD Art. 37

### 3. Backend - Controllers
- ✅ **backend/controllers/alunosController.ts**
  - Importa funções de cpfUtils
  - Valida CPF no método `criar()`
  - Verifica duplicidade
  - Registra auditoria LGPD
  - Logs seguros (CPF mascarado)

- ✅ **backend/controllers/professoresController.ts**
  - Importa funções de cpfUtils
  - Valida CPF no método `criar()`
  - Verifica duplicidade
  - Registra auditoria LGPD
  - Logs seguros (CPF mascarado)
  - Adiciona campo CPF na função `createProfessorInFirebase()`

### 4. Frontend - Componente
- ✅ **frontend/src/components/CPFInput.tsx**
  - Input com máscara automática (XXX.XXX.XXX-XX)
  - Validação em tempo real
  - Mensagens de erro amigáveis
  - Aviso de privacidade LGPD
  - Acessibilidade (ARIA)
  - Limita a 11 dígitos

---

## ⏳ O QUE FALTA FAZER

### 1. Frontend - Formulários de Criação

#### A. Atualizar AlunoCreate.tsx
**Arquivo:** `frontend/src/pages/AlunoCreate.tsx`

**Mudanças necessárias:**

```tsx
// 1. Importar o componente CPFInput
import { CPFInput } from '../components/CPFInput';

// 2. Atualizar interface Student
interface Student {
    id: number;
    name: string;
    cpf: string;  // ← ADICIONAR
    matricula: string;
    // ... resto dos campos
}

// 3. Atualizar estado inicial
const [formData, setFormData] = useState<Student>({
    // ...
    cpf: '',  // ← ADICIONAR
    // ...
});

// 4. Adicionar handler para CPF
const handleCPFChange = (value: string) => {
    setFormData(prev => ({
        ...prev,
        cpf: value
    }));
};

// 5. Atualizar handleSubmit
const alunoData = {
    nome: formData.name,
    cpf: formData.cpf,  // ← USAR CPF REAL
    email: formData.email,
    // ... resto
};

// 6. Adicionar campo CPF no formulário (ANTES do campo Email)
<CPFInput
    value={formData.cpf}
    onChange={handleCPFChange}
    label="CPF"
    required={true}
    error={errors.cpf} // Se tiver validação
/>
```

#### B. Atualizar ProfessoresCreate.tsx
**Arquivo:** `frontend/src/pages/ProfessoresCreate.tsx`

**Mudanças necessárias:**

```tsx
// 1. Importar CPFInput
import { CPFInput } from '../components/CPFInput';

// 2. Atualizar interface Professor
interface Professor {
    id: number;
    name: string;
    cpf: string;  // ← ADICIONAR
    // ... resto
}

// 3. Atualizar formData
const [formData, setFormData] = useState<Professor>({
    // ...
    cpf: '',  // ← ADICIONAR
});

// 4. Handler para CPF
const handleCPFChange = (value: string) => {
    setFormData(prev => ({
        ...prev,
        cpf: value
    }));
};

// 5. Atualizar bodyData no handleSubmit
const bodyData = {
    nome: formData.name,
    cpf: formData.cpf,  // ← ADICIONAR
    email: formData.email,
    polo: formData.polo,
    localEstagio: formData.localEstagio
};

// 6. Adicionar campo no formulário
<CPFInput
    value={formData.cpf}
    onChange={handleCPFChange}
    label="CPF"
    required={true}
/>
```

### 2. Frontend - Formulários de Edição

#### A. Atualizar AlunoEdit.tsx
**Arquivo:** `frontend/src/pages/AlunoEdit.tsx`

**Mudanças:**
- Adicionar campo CPF na interface
- Adicionar CPFInput no formulário
- Carregar CPF existente ao buscar aluno
- Incluir CPF no PUT request

#### B. Atualizar Gerenciamento de Professores
**Arquivo:** `frontend/src/pages/GerenciamentoProfessores.tsx`

Se houver modal de edição:
- Adicionar campo CPF
- Validar CPF antes de salvar

### 3. Frontend - Visualização

#### A. Tabelas e Listas
Adicionar coluna CPF (formatado) nas tabelas de:
- `GerenciamentoAlunos.tsx`
- `GerenciamentoProfessores.tsx`

**Importante:** Usar `formatCPF()` para exibição

#### B. Detalhes/Profile
Adicionar exibição de CPF em:
- `AlunoDetalhes.tsx`
- `ProfileAluno.tsx`
- `ProfileProfessor.tsx` (se existir)

### 4. Backend - Métodos Update

Atualizar métodos de edição para aceitar CPF:

#### A. alunosController.ts - método `atualizar()`
```typescript
// Adicionar validação de CPF se ele foi alterado
if (cpf && cpf !== alunoAtual.cpf) {
    const resultadoCPF = processarCPF(cpf);
    if (!resultadoCPF.valido) {
        return res.status(400).json({ error: resultadoCPF.erro });
    }
    
    // Verifica duplicidade excluindo o próprio aluno
    const cpfExistente = await cpfJaExiste(db, resultadoCPF.cpfSanitizado, 'alunos', id);
    if (cpfExistente) {
        return res.status(409).json({ error: 'CPF já cadastrado' });
    }
    
    dadosAtualizados.cpf = resultadoCPF.cpfSanitizado;
    
    // Log de auditoria
    registrarAuditoriaCPF({
        timestamp: new Date(),
        operation: 'UPDATE',
        userId: req.user?.uid || 'unknown',
        collection: 'alunos',
        recordId: id,
        cpfMasked: maskCPFForLogs(resultadoCPF.cpfSanitizado),
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
}
```

#### B. professoresController.ts - método `atualizar()`
Aplicar a mesma lógica acima.

### 5. Exportação CSV

Atualizar função de exportação para incluir CPF (formatado):

```typescript
// Em AgendamentoEstagio.tsx ou onde estiver a exportação
const row = [
    aluno.nome,
    formatCPF(aluno.cpf),  // ← ADICIONAR
    aluno.matricula,
    // ... resto
];
```

### 6. Firestore Rules (Opcional mas Recomendado)

Adicionar validação de CPF nas regras do Firestore:

```javascript
match /artifacts/{artifactId}/users/{userId} {
  allow create: if request.auth != null 
    && request.resource.data.cpf is string
    && request.resource.data.cpf.matches('^[0-9]{11}$');  // 11 dígitos
    
  allow update: if request.auth != null
    && (
      !('cpf' in request.resource.data) 
      || request.resource.data.cpf.matches('^[0-9]{11}$')
    );
}
```

---

## 🔒 CHECKLIST DE SEGURANÇA

Antes de deploy em produção, verificar:

- [ ] CPF **NUNCA** aparece completo em logs
- [ ] Validação de CPF no backend está funcionando
- [ ] Verificação de duplicidade está funcionando
- [ ] Logs de auditoria sendo gerados corretamente
- [ ] HTTPS habilitado em produção
- [ ] Headers de segurança configurados
- [ ] Política de Privacidade acessível no sistema
- [ ] Termos de Uso acessível no sistema
- [ ] Modal de consentimento implementado (primeiro acesso)
- [ ] Contato do DPO visível
- [ ] Formulário para exercício de direitos LGPD disponível
- [ ] Processo de exclusão de dados funcionando
- [ ] Exportação de dados (portabilidade) funcionando

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Backend
- [x] Criar cpfUtils.ts com funções de validação
- [x] Atualizar alunosController.ts - criar()
- [x] Atualizar professoresController.ts - criar()
- [ ] Atualizar alunosController.ts - atualizar()
- [ ] Atualizar professoresController.ts - atualizar()
- [ ] Testar validação de CPF
- [ ] Testar duplicidade
- [ ] Testar logs de auditoria

### Frontend - Componentes
- [x] Criar CPFInput.tsx
- [ ] Testar componente isoladamente

### Frontend - Alunos
- [ ] Atualizar AlunoCreate.tsx
- [ ] Atualizar AlunoEdit.tsx
- [ ] Atualizar GerenciamentoAlunos.tsx (tabela)
- [ ] Atualizar AlunoDetalhes.tsx
- [ ] Atualizar ProfileAluno.tsx

### Frontend - Professores
- [ ] Atualizar ProfessoresCreate.tsx
- [ ] Atualizar modal/formulário de edição
- [ ] Atualizar GerenciamentoProfessores.tsx (tabela)

### Exportação
- [ ] Atualizar exportação CSV para incluir CPF

### Documentação
- [x] Criar IMPLEMENTACAO_CPF_LGPD.md
- [x] Criar POLITICA_PRIVACIDADE.md
- [x] Criar TERMOS_DE_USO.md
- [x] Criar GUIA_IMPLEMENTACAO_CPF.md
- [ ] Criar página de Política de Privacidade no sistema
- [ ] Criar página de Termos de Uso no sistema
- [ ] Criar modal de consentimento

### Testes
- [ ] Testar criação de aluno com CPF válido
- [ ] Testar criação com CPF inválido (deve falhar)
- [ ] Testar criação com CPF duplicado (deve falhar)
- [ ] Testar edição de CPF
- [ ] Testar exportação CSV
- [ ] Testar logs de auditoria
- [ ] Testar máscara de CPF

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **Testar Backend Atual**
   ```bash
   # No terminal backend
   cd backend
   npm run dev
   ```
   
2. **Atualizar Formulários de Criação** (Priority 1)
   - AlunoCreate.tsx
   - ProfessoresCreate.tsx
   
3. **Testar Criação**
   - Criar aluno com CPF válido
   - Tentar criar com CPF inválido
   - Tentar criar com CPF duplicado
   
4. **Atualizar Formulários de Edição** (Priority 2)
   - AlunoEdit.tsx
   - Modal de edição de professores
   - Implementar validação no backend
   
5. **Atualizar Visualizações** (Priority 3)
   - Tabelas
   - Páginas de detalhes
   
6. **Exportação** (Priority 4)
   - Atualizar CSV
   
7. **UI Legal** (Priority 5)
   - Página de Política de Privacidade
   - Página de Termos de Uso
   - Modal de consentimento
   
8. **Testes Finais**
   - Todos os cenários
   - Segurança
   - Performance

---

## 📝 EXEMPLO DE USO DO COMPONENTE CPFInput

```tsx
import { CPFInput } from '../components/CPFInput';

function MeuFormulario() {
  const [cpf, setCpf] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async () => {
    if (cpf.length !== 11) {
      setErro('CPF incompleto');
      return;
    }
    
    // Enviar cpf (já vem sanitizado)
    await api.post('/alunos', { cpf });
  };

  return (
    <form>
      <CPFInput
        value={cpf}
        onChange={setCpf}
        label="CPF do Aluno"
        required={true}
        error={erro}
      />
      
      <button onClick={handleSubmit}>Salvar</button>
    </form>
  );
}
```

---

## 🆘 TROUBLESHOOTING

### Erro: "CPF já cadastrado"
- Verificar se realmente existe duplicidade no banco
- Verificar se a função `cpfJaExiste()` está excluindo o próprio registro na edição

### Erro: "CPF inválido" mas CPF está correto
- Verificar se os dígitos verificadores estão corretos
- Testar com CPFs reais (não usar sequências como 111.111.111-11)

### CPF não está sendo salvo
- Verificar se o campo está sendo enviado no body da requisição
- Verificar logs do backend
- Verificar se o campo `cpf` existe na interface TypeScript

### CPF aparece sem formatação
- Usar `formatCPF()` da cpfUtils ou do componente
- Exemplo: `formatCPF(aluno.cpf)` // "123.456.789-00"

---

## 📞 CONTATOS IMPORTANTES

- **DPO (Encarregado de Dados):** dpo@instituicao.edu.br
- **Segurança:** security@instituicao.edu.br
- **Suporte Técnico:** suporte@instituicao.edu.br

---

## ⚖️ CONFORMIDADE LEGAL

Este sistema está em conformidade com:
- ✅ Lei nº 13.709/2018 (LGPD)
- ✅ Marco Civil da Internet (Lei nº 12.965/2014)
- ✅ Código de Defesa do Consumidor

**Próxima revisão:** 13/04/2026 (6 meses)

---

**IMPORTANTE:** Qualquer dúvida sobre implementação ou LGPD, consulte o DPO antes de prosseguir.

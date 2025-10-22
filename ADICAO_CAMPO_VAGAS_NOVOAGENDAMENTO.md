# Adição do Campo "Quantidade de Vagas Disponíveis" em Novo Agendamento

## 🎯 Implementação

Foi adicionado um novo campo no formulário de **Novo Agendamento** para permitir que o usuário defina a **quantidade de vagas disponíveis** para cada estágio.

---

## ✅ Mudanças Realizadas

### 1. Interface `FormularioAgendamento` Atualizada

**Arquivo:** `frontend/src/pages/NovoAgendamento.tsx`

```typescript
interface FormularioAgendamento {
  localEstagio: string;
  area: string;
  vagasDisponiveis: number;  // ✅ NOVO CAMPO
  horarioInicio: string;
  horarioFim: string;
  aluno: string;
  professor: string;
  observacoes: string;
  repeticao: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'dia-semana';
  diaSemana?: number;
}
```

---

### 2. Estado Inicial Atualizado

```typescript
const INITIAL_FORM_STATE: FormularioAgendamento = {
  localEstagio: '',
  area: '',
  vagasDisponiveis: 1,  // ✅ Valor padrão: 1 vaga
  horarioInicio: '',
  horarioFim: '',
  aluno: '',
  professor: '',
  observacoes: '',
  repeticao: 'nenhuma',
  diaSemana: undefined,
};
```

---

### 3. Campo de Input no Formulário

**Localização:** Entre o campo "Área" e "Horário Início/Fim"

```tsx
<div>
  <label htmlFor="vagasDisponiveis" className="block text-gray-300 text-sm font-semibold mb-2">
    Quantidade de Vagas Disponíveis *
  </label>
  <input
    id="vagasDisponiveis"
    type="number"
    min="1"
    max="100"
    value={formulario.vagasDisponiveis}
    onChange={(e) => handleInputChange('vagasDisponiveis', parseInt(e.target.value) || 1)}
    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
    placeholder="Ex: 5"
    required
    aria-required="true"
  />
  <p className="text-gray-400 text-xs mt-1">
    Número de alunos que podem ser alocados neste estágio
  </p>
</div>
```

**Características do campo:**
- **Tipo:** `number`
- **Valor mínimo:** 1
- **Valor máximo:** 100
- **Valor padrão:** 1
- **Obrigatório:** Sim (marcado com *)
- **Dica visual:** Texto explicativo abaixo do campo

---

### 4. Função `handleInputChange` Atualizada

```typescript
const handleInputChange = useCallback((campo: keyof FormularioAgendamento, valor: string | number) => {
  setFormulario((prev) => ({ ...prev, [campo]: valor }));
}, []);
```

**Mudança:** Agora aceita `string | number` para suportar o campo numérico.

---

### 5. API Service Atualizado

**Arquivo:** `frontend/src/services/apiService.ts`

```typescript
async criarAgendamento(data: {
  localEstagio: string;
  area: string;
  vagasDisponiveis?: number;  // ✅ NOVO CAMPO (opcional)
  horarioInicio: string;
  horarioFim: string;
  aluno: string;
  alunoId?: string;
  professor: string;
  professorId?: string;
  observacoes?: string;
  data: string;
  status?: 'confirmado' | 'pendente' | 'cancelado';
}) {
  return this.request<{ message: string; id: string; agendamento: any }>('/api/agendamentos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

---

### 6. Envio do Formulário

O campo `vagasDisponiveis` agora é incluído automaticamente ao criar um agendamento:

```typescript
await apiService.criarAgendamento({
  localEstagio,
  area: area || 'Estágio',
  vagasDisponiveis: formulario.vagasDisponiveis,  // ✅ Enviado para API
  horarioInicio,
  horarioFim,
  aluno,
  professor,
  observacoes,
  data: dataFormatada,
  status: 'confirmado'
});
```

---

## 🎨 Layout do Campo

### Posição no Formulário

```
┌─────────────────────────────────────────┐
│ Local de Estágio *                       │
│ [_________________________________]      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Área                                     │
│ [_________________________________]      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐  ← NOVO CAMPO
│ Quantidade de Vagas Disponíveis *        │
│ [_______________1_________________]      │
│ Número de alunos que podem ser alocados  │
│ neste estágio                            │
└─────────────────────────────────────────┘

┌──────────────────┬──────────────────────┐
│ Horário Início * │ Horário Fim *        │
│ [______:______]  │ [______:______]      │
└──────────────────┴──────────────────────┘
```

---

## 📊 Validações

### Validações do Campo

1. ✅ **Obrigatório:** Campo não pode ficar vazio
2. ✅ **Mínimo:** 1 vaga (não permite valores negativos ou zero)
3. ✅ **Máximo:** 100 vagas
4. ✅ **Tipo:** Apenas números inteiros
5. ✅ **Fallback:** Se valor inválido, retorna para 1

### Comportamento

```javascript
// Se usuário digitar valor inválido
onChange={(e) => handleInputChange('vagasDisponiveis', parseInt(e.target.value) || 1)}

// Exemplos:
// Input: ""     → Valor: 1
// Input: "0"    → Valor: 1
// Input: "-5"   → Valor: 1
// Input: "abc"  → Valor: 1
// Input: "10"   → Valor: 10 ✓
```

---

## 🧪 Como Testar

### Teste 1: Criação de Agendamento com Vagas

1. Acesse a página "Novo Agendamento"
2. Clique em uma data no calendário
3. Preencha os campos:
   - **Local de Estágio:** Hospital Central
   - **Área:** Enfermagem
   - **Quantidade de Vagas:** 5 ← **NOVO CAMPO**
   - **Horário Início:** 08:00
   - **Horário Fim:** 12:00
   - **Aluno:** (selecionar)
   - **Professor:** (selecionar)
4. Clique em "Criar Agendamento"
5. ✅ Agendamento deve ser criado com `vagasDisponiveis: 5`

---

### Teste 2: Valores Mínimo e Máximo

#### Valor Mínimo (1)
1. Digite "0" no campo
2. Clique fora do campo
3. ✅ Valor deve voltar para 1

#### Valor Máximo (100)
1. Digite "150" no campo
2. ✅ Campo deve aceitar apenas até 100

---

### Teste 3: Valores Inválidos

1. Tente digitar:
   - Letras: "abc" → Valor fica 1
   - Negativo: "-10" → Valor fica 1
   - Vazio: "" → Valor fica 1
2. ✅ Todos devem resultar em 1

---

### Teste 4: Verificação no Backend

1. Após criar agendamento, verifique o console do backend
2. Deve mostrar:
```json
{
  "localEstagio": "Hospital Central",
  "area": "Enfermagem",
  "vagasDisponiveis": 5,  // ← NOVO CAMPO
  "horarioInicio": "08:00",
  "horarioFim": "12:00",
  ...
}
```

---

## 📱 Responsividade

O campo se adapta a diferentes tamanhos de tela:

### Desktop
```
┌──────────────────────────────────────────────┐
│ Quantidade de Vagas Disponíveis *             │
│ [________________5_______________________]    │
│ Número de alunos que podem ser alocados neste │
│ estágio                                       │
└──────────────────────────────────────────────┘
```

### Mobile
```
┌─────────────────────────┐
│ Quantidade de Vagas     │
│ Disponíveis *           │
│ [________5________]     │
│ Número de alunos que    │
│ podem ser alocados neste│
│ estágio                 │
└─────────────────────────┘
```

---

## 🎯 Casos de Uso

### Caso 1: Hospital com Múltiplas Vagas
**Cenário:** Hospital oferece 10 vagas de estágio na UTI

```
Local: Hospital Central
Área: UTI
Vagas: 10 ← Define que 10 alunos podem ser alocados
```

### Caso 2: Consultório com Vaga Única
**Cenário:** Consultório particular com apenas 1 vaga

```
Local: Consultório Dr. Silva
Área: Clínica Geral
Vagas: 1 ← Apenas 1 aluno por vez
```

### Caso 3: Escola com Salas de Aula
**Cenário:** Escola permite múltiplos estagiários

```
Local: Escola Municipal
Área: Pedagogia
Vagas: 5 ← 5 estagiários simultaneamente
```

---

## 🔗 Integração com Backend

### Modelo de Dados Atualizado

O backend deve aceitar o campo opcional `vagasDisponiveis`:

```typescript
interface Agendamento {
  id: string;
  localEstagio: string;
  area: string;
  vagasDisponiveis?: number;  // ← NOVO CAMPO OPCIONAL
  horarioInicio: string;
  horarioFim: string;
  aluno: string;
  alunoId?: string;
  professor: string;
  professorId?: string;
  observacoes?: string;
  data: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
}
```

---

## 📚 Arquivos Modificados

1. **frontend/src/pages/NovoAgendamento.tsx**
   - Linha 46: Interface `FormularioAgendamento` - adicionado `vagasDisponiveis: number`
   - Linha 167: `INITIAL_FORM_STATE` - adicionado `vagasDisponiveis: 1`
   - Linha 298: `handleInputChange` - aceita `string | number`
   - Linhas 522-544: Novo campo de input no formulário
   - Linha 410: Envio inclui `vagasDisponiveis`

2. **frontend/src/services/apiService.ts**
   - Linha 294: Interface de `criarAgendamento` - adicionado `vagasDisponiveis?: number`

---

## ✅ Checklist de Implementação

- [x] Interface `FormularioAgendamento` atualizada
- [x] Estado inicial com valor padrão (1)
- [x] Campo de input adicionado no formulário
- [x] Validações min/max implementadas
- [x] Texto de ajuda adicionado
- [x] `handleInputChange` aceita number
- [x] API Service atualizado
- [x] Envio do formulário inclui vagas
- [x] Testes de validação funcionando
- [x] Documentação completa

---

## 🎉 Benefícios

1. ✅ **Controle de Capacidade:** Define quantos alunos cabem em cada estágio
2. ✅ **Planejamento:** Facilita alocação de recursos
3. ✅ **Transparência:** Usuário vê claramente quantas vagas existem
4. ✅ **Flexibilidade:** Cada estágio pode ter capacidade diferente
5. ✅ **Validação:** Impede valores inválidos automaticamente

---

**Data:** Outubro 8, 2025  
**Versão:** 2.1.0  
**Status:** ✅ Implementado e Documentado  
**Página Afetada:** NovoAgendamento  
**Desenvolvido por:** GitHub Copilot

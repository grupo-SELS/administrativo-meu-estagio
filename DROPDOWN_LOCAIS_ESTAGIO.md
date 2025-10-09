# Dropdown de Opções - Locais de Estágio

Data: 8 de outubro de 2025

## 🎯 Objetivo

Implementar um dropdown de opções para cada card de local de estágio, com z-index adequado para evitar sobreposição por outros elementos.

---

## 📝 Funcionalidades Implementadas

### 1. **Botão "Mais Opções" (⋮)**

Localizado no canto inferior direito de cada card de estágio, abre um menu com 3 opções.

### 2. **Opções do Dropdown**

#### A. Ver Atribuídos
- **Ícone**: Grupo de pessoas
- **Cor**: Branco/cinza
- **Ação**: Abre modal mostrando professor e alunos atribuídos ao estágio
- **Função**: `setModalAtribuidosAberto(true)`

#### B. Editar Campo
- **Ícone**: Lápis/editar
- **Cor**: Branco/cinza
- **Ação**: Chama função para editar o estágio
- **Função**: `handleEditarCampoEstagio(estagioId)`

#### C. Deletar ⬅️ **NOVO**
- **Ícone**: Lixeira
- **Cor**: Vermelho (`text-red-400`)
- **Hover**: Fundo vermelho (`hover:bg-red-600`)
- **Ação**: Deleta o agendamento após confirmação
- **Função**: `handleDeletarEstagio(estagioId)`

---

## 🔧 Solução de Z-Index

### Problema Original
Os cards abaixo estavam sobrepondo o dropdown, tornando-o inacessível.

### Solução Implementada

#### 1. **Z-Index Dinâmico no Card**
```tsx
className={`... ${menuAberto === estagio.id ? 'z-[10000]' : 'z-0'}`}
```
- Quando o menu está **aberto**: card recebe `z-index: 10000`
- Quando o menu está **fechado**: card recebe `z-index: 0`

#### 2. **Z-Index Alto no Dropdown**
```tsx
<div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-xl border border-gray-600 z-[9999]">
```
- Dropdown tem `z-index: 9999`
- Fica dentro do contexto do card pai (z-index: 10000)

#### 3. **Overflow Visível nos Containers**

**Section (container principal):**
```tsx
<section style={{ overflow: 'visible' }}>
```

**Div de scroll:**
```tsx
<div style={{ overflowY: 'auto', overflowX: 'visible' }}>
```

**Container dos cards:**
```tsx
<div style={{ overflow: 'visible' }}>
```

---

## 🗑️ Função de Deletar

### Código da Função

```typescript
const handleDeletarEstagio = async (estagioId: string) => {
    const estagio = estagios.find(e => e.id === estagioId);
    if (!estagio) {
        alert('Estágio não encontrado.');
        return;
    }

    const confirmacao = window.confirm(
        `Tem certeza que deseja deletar o estágio?\n\n` +
        `Local: ${estagio.local}\n` +
        `Área: ${estagio.area}\n\n` +
        `Esta ação não pode ser desfeita.`
    );

    if (!confirmacao) return;

    try {
        console.log('🗑️ Deletando estágio:', estagioId);
        await apiService.deletarAgendamento(estagioId);
        
        // Remove o estágio da lista local
        setEstagios(prev => prev.filter(e => e.id !== estagioId));
        
        // Remove atribuições relacionadas
        setAtribuicoes(prev => prev.filter(a => a.estagioId !== estagioId));
        
        // Limpa seleção se era o estágio selecionado
        if (estagioSelecionado === estagioId) {
            setEstagioSelecionado(null);
        }

        alert('Estágio deletado com sucesso!');
    } catch (error: any) {
        console.error('❌ Erro ao deletar estágio:', error);
        alert('Erro ao deletar estágio. Verifique o console para mais detalhes.');
    }
};
```

### Fluxo de Deleção

```
1. Usuário clica em "Deletar"
    ↓
2. Busca dados do estágio
    ↓
3. Mostra confirmação com:
   - Local do estágio
   - Área
   - Aviso de ação irreversível
    ↓
4. [Cancelar] → Nada acontece
   [OK] → Continua
    ↓
5. Chama API: DELETE /api/agendamentos/:id
    ↓
6. Remove da lista local (setEstagios)
    ↓
7. Remove atribuições (setAtribuicoes)
    ↓
8. Limpa seleção se necessário
    ↓
9. ✅ Feedback: "Estágio deletado com sucesso!"
```

### Tratamento de Erros

- ❌ **Estágio não encontrado**: Alert imediato
- ❌ **Usuário cancela**: Nada acontece
- ❌ **Erro na API**: Console log + alert com erro

---

## 🎨 Estrutura Visual do Dropdown

```
┌─────────────────────────┐
│ ⋮ (botão mais opções)   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ 👥 Ver Atribuídos       │ ← Cinza
├─────────────────────────┤
│ ✏️ Editar Campo         │ ← Cinza
├─────────────────────────┤
│ 🗑️ Deletar              │ ← Vermelho
└─────────────────────────┘
```

### Classes CSS Aplicadas

**Dropdown Container:**
- `absolute right-0 mt-2` - Posicionamento
- `w-48` - Largura fixa
- `bg-gray-700` - Fundo escuro
- `rounded-lg` - Bordas arredondadas
- `shadow-xl` - Sombra grande
- `border border-gray-600` - Borda
- `z-[9999]` - Z-index altíssimo

**Botão Ver Atribuídos:**
- `text-white` - Texto branco
- `hover:bg-gray-600` - Hover cinza
- `rounded-t-lg` - Arredonda topo

**Botão Editar Campo:**
- `text-white` - Texto branco
- `hover:bg-gray-600` - Hover cinza
- `border-t` - Borda superior

**Botão Deletar:**
- `text-red-400` - Texto vermelho
- `hover:bg-red-600` - Hover vermelho forte
- `hover:text-white` - Texto fica branco no hover
- `rounded-b-lg` - Arredonda base
- `border-t` - Borda superior

---

## 📊 Estados Gerenciados

```typescript
const [menuAberto, setMenuAberto] = useState<string | null>(null);
```

- `null`: Nenhum menu aberto
- `"estagioId"`: Menu do estágio específico está aberto
- Fecha ao clicar em qualquer opção
- Fecha ao clicar fora (stopPropagation)

---

## 🧪 Testando

### 1. Abrir Dropdown
1. Clique no botão ⋮ de qualquer card
2. Dropdown deve aparecer **por cima** de todos os outros elementos
3. Outros cards não devem cobrir o dropdown

### 2. Ver Atribuídos
1. Clique em "Ver Atribuídos"
2. Modal deve abrir mostrando professor e alunos
3. Dropdown fecha automaticamente

### 3. Editar Campo
1. Clique em "Editar Campo"
2. Alert com ID do estágio (implementação futura)
3. Dropdown fecha automaticamente

### 4. Deletar Estágio
1. Clique em "Deletar"
2. Confirmação aparece com dados do estágio
3. [Cancelar] → Nada acontece
4. [OK] → Estágio é removido
5. Sucesso: Alert de confirmação
6. Erro: Alert de erro + console log

---

## ⚠️ Observações Importantes

### 1. **Z-Index Hierarchy**
```
Card com menu aberto: 10000
  └─ Dropdown: 9999
Cards sem menu: 0
Modal: 50 (padrão)
```

### 2. **Overflow Management**
- Section: `overflow: visible`
- Scroll container: `overflowY: auto`, `overflowX: visible`
- Cards container: `overflow: visible`

### 3. **Click Events**
Todos os botões do dropdown têm:
```typescript
onClick={(e) => {
    e.stopPropagation(); // Impede propagação para o card
    // ... ação específica
    setMenuAberto(null); // Fecha o menu
}}
```

### 4. **API Endpoint**
```
DELETE /api/agendamentos/:id
```
- Deleta o agendamento no Firestore
- Retorna confirmação de sucesso ou erro

---

## 🚀 Próximas Melhorias

- [ ] Implementar função real de "Editar Campo"
- [ ] Adicionar animação de entrada/saída do dropdown
- [ ] Fechar dropdown ao clicar fora (click outside)
- [ ] Adicionar loading state durante deleção
- [ ] Toast notification em vez de alert
- [ ] Confirmação modal em vez de window.confirm
- [ ] Undo/desfazer após deletar (timeout de 5s)

---

## 🐛 Troubleshooting

**Problema**: Dropdown ainda é sobreposto
- **Solução**: Verificar se todos os containers pais têm `overflow: visible`

**Problema**: Dropdown não aparece
- **Solução**: Verificar console para erros de estado `menuAberto`

**Problema**: Deletar não funciona
- **Solução**: Verificar se backend está rodando na porta 3002

**Problema**: Z-index não funciona
- **Solução**: Verificar se card tem classe dinâmica `z-[10000]` quando menu aberto

---

## 📚 Referências

- **Arquivo**: `frontend/src/pages/AgendamentoEstagio.tsx`
- **Linhas do Dropdown**: ~890-930
- **Função de Deletar**: ~295-325
- **Estado menuAberto**: ~71

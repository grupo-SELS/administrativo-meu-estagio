# 🔍 Troubleshooting: Botão "Salvar Agendamento" Não Habilita

## 🚨 Problema

O botão "Salvar Agendamento" continua desabilitado mesmo após o usuário inserir professor e alunos.

---

## 📊 Sistema de Logs Implementado

Foi adicionado um **sistema completo de logs em tempo real** que monitora:

1. ✅ Mudanças no estado (`estagioSelecionado`, `atribuicoes`)
2. ✅ Confirmação de professor
3. ✅ Confirmação de alunos
4. ✅ Estado do botão (habilitado/desabilitado)

---

## 🧪 Como Debugar (Passo a Passo)

### 1. Abrir o Console do Navegador

**Pressione F12** e vá para a aba **"Console"**

### 2. Recarregar a Página

Você verá:
```
📚 Buscando alunos da API...
✅ X alunos carregados
🔄 Estado atualizado: { estagioSelecionado: null, qtdAtribuicoes: 0, atribuicoes: [] }
```

### 3. Selecionar um Estágio

Clique em um card verde (lado direito). Você verá:
```
🔄 Estado atualizado: { estagioSelecionado: "1", qtdAtribuicoes: 0, atribuicoes: [] }
🎯 Atribuição do estágio selecionado: undefined
⚠️ Nenhuma atribuição encontrada para este estágio
```

### 4. Atribuir Professor

a) Clique no botão **"Professores"** (topo esquerdo)
b) Clique no botão **"Professor"** no card do estágio
c) Selecione um professor da lista
d) Clique em **"Confirmar"**

**Logs esperados:**
```
👨‍🏫 Confirmando atribuição de professor: { professorSelecionadoId: "prof-1", estagioSelecionado: "1" }
✅ Professor encontrado: { id: "prof-1", nome: "Maria Silva Santos", ... }
📋 Atribuição existente? undefined
➕ Nova atribuição criada
📊 Todas as atribuições após update: [{ estagioId: "1", professorId: "prof-1", professorNome: "Maria Silva Santos", alunosIds: [] }]

🔄 Estado atualizado: { estagioSelecionado: "1", qtdAtribuicoes: 1, atribuicoes: [...] }
🎯 Atribuição do estágio selecionado: { estagioId: "1", professorId: "prof-1", professorNome: "Maria Silva Santos", alunosIds: [] }
📊 Análise detalhada da atribuição: {
  temProfessor: true,
  professorId: "prof-1",
  temAlunos: false,
  qtdAlunos: 0,
  alunosIds: []
}
❌ BOTÃO DEVE ESTAR DESABILITADO
```

### 5. Atribuir Alunos

a) Clique no botão **"Alunos"** (topo esquerdo)
b) Clique no botão **"Alunos"** no card do estágio
c) Marque os alunos desejados
d) Clique em **"Confirmar"**

**Logs esperados:**
```
👥 Confirmando atribuição de alunos: { estagioSelecionado: "1", alunosAtribuidosIds: ["aluno-1", "aluno-2"], qtdAlunos: 2 }
📋 Atribuição existente? { estagioId: "1", professorId: "prof-1", professorNome: "Maria Silva Santos", alunosIds: [] }
✏️ Atribuição atualizada com alunos
📊 Todas as atribuições após update: [{ estagioId: "1", professorId: "prof-1", professorNome: "Maria Silva Santos", alunosIds: ["aluno-1", "aluno-2"] }]

🔄 Estado atualizado: { estagioSelecionado: "1", qtdAtribuicoes: 1, atribuicoes: [...] }
🎯 Atribuição do estágio selecionado: { estagioId: "1", professorId: "prof-1", professorNome: "Maria Silva Santos", alunosIds: ["aluno-1", "aluno-2"] }
📊 Análise detalhada da atribuição: {
  temProfessor: true,
  professorId: "prof-1",
  temAlunos: true,
  qtdAlunos: 2,
  alunosIds: ["aluno-1", "aluno-2"]
}
✅ BOTÃO DEVE ESTAR HABILITADO
```

### 6. Verificar Estado do Botão

**Se o botão continuar desabilitado mesmo após ver "✅ BOTÃO DEVE ESTAR HABILITADO"**, há um problema de sincronização do React.

---

## 🐛 Cenários de Erro e Soluções

### Cenário 1: Log "➕ Nova atribuição criada" não aparece

**Causa:** `setAtribuicoes` não foi chamado

**Solução:**
- Verifique se você clicou em "Confirmar" (não apenas selecionou o professor/aluno)
- Verifique se não há erro no console antes do log

**Debug adicional (cole no console):**
```javascript
// Verificar se a função setAtribuicoes existe
console.log('setAtribuicoes:', typeof window.setAtribuicoes);
```

---

### Cenário 2: Log "🔄 Estado atualizado" não aparece após confirmar

**Causa:** `useEffect` não está sendo disparado

**Solução:**
- Recarregue a página (Ctrl + F5)
- Limpe o cache do navegador
- Verifique se não há erro de compilação no terminal

**Debug adicional (verifique terminal frontend):**
```powershell
cd C:\Users\luiza\Desktop\site-adm-app\frontend
npm run dev
```

---

### Cenário 3: "✅ BOTÃO DEVE ESTAR HABILITADO" aparece mas botão continua cinza

**Causa:** Lógica do `disabled` não está sincronizada com o estado

**Investigação:**
1. Abra o console
2. Cole este código:
```javascript
// Inspecionar o botão diretamente
const botao = document.querySelector('button:has(span:contains("Salvar Agendamento"))');
console.log('Botão encontrado:', botao);
console.log('Disabled:', botao?.disabled);
console.log('Classes:', botao?.className);
```

3. Se `disabled: true` mesmo com logs corretos, há um bug no React

**Solução temporária:**
- Clique em outro estágio e volte
- Atribua novamente o professor e alunos

---

### Cenário 4: Array `alunosIds` está vazio após confirmação

**Causa:** Estado `alunosAtribuidosIds` não foi populado

**Verificação:**
Antes de clicar em "Confirmar", cole no console:
```javascript
// Ver quais alunos estão marcados
console.log('Alunos marcados:', alunosAtribuidosIds);
```

Se retornar `undefined` ou `[]`, o problema está na seleção de alunos.

**Debug do checkbox:**
```javascript
// Ver todos os checkboxes marcados
const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
console.log('Checkboxes marcados:', checkboxes.length);
checkboxes.forEach(cb => console.log('ID:', cb.value || cb.id));
```

---

### Cenário 5: Estado muda mas UI não atualiza

**Causa:** React não está re-renderizando

**Solução:**
1. Verifique se há erros no console
2. Verifique se o componente está usando `useState` corretamente
3. Force re-render clicando em "Alunos" → "Professores" → "Alunos"

**Debug adicional:**
```javascript
// Forçar re-render (cole no console)
const event = new Event('storage');
window.dispatchEvent(event);
```

---

## 🎯 Checklist de Validação

Use este checklist para garantir que tudo está correto:

### Antes de Atribuir Professor
- [ ] Console aberto (F12)
- [ ] Logs "🔄 Estado atualizado" aparecem ao selecionar estágio
- [ ] Log mostra `estagioSelecionado: "X"` (não null)

### Após Atribuir Professor
- [ ] Log "👨‍🏫 Confirmando atribuição de professor" apareceu
- [ ] Log "✅ Professor encontrado" apareceu
- [ ] Log "📊 Todas as atribuições após update" mostra `professorId: "prof-X"`
- [ ] Log "🔄 Estado atualizado" apareceu logo após
- [ ] Log "📊 Análise detalhada" mostra `temProfessor: true`
- [ ] Card do estágio mostra "✓ Professor"

### Após Atribuir Alunos
- [ ] Log "👥 Confirmando atribuição de alunos" apareceu
- [ ] Log "📊 Todas as atribuições após update" mostra `alunosIds: ["aluno-1", ...]`
- [ ] Log "🔄 Estado atualizado" apareceu logo após
- [ ] Log "📊 Análise detalhada" mostra `temAlunos: true`
- [ ] Card do estágio mostra "✓ X Aluno(s)"

### Verificação Final do Botão
- [ ] Log "✅ BOTÃO DEVE ESTAR HABILITADO" apareceu
- [ ] Botão "Salvar Agendamento" está verde (não cinza)
- [ ] Botão não tem cursor de "proibido" ao passar mouse
- [ ] Ao clicar, log "🔍 Debug - Salvando agendamento" aparece

---

## 🔧 Comandos Úteis para Debug

### Verificar Estado Completo
Cole no console do navegador:
```javascript
console.log('=== ESTADO COMPLETO ===');
console.log('Estágio selecionado:', estagioSelecionado);
console.log('Atribuições:', atribuicoes);

const atrib = atribuicoes.find(a => a.estagioId === estagioSelecionado);
console.log('Atribuição atual:', atrib);

if (atrib) {
    console.log('Validação:', {
        temProfessor: !!atrib.professorId,
        temAlunos: !!(atrib.alunosIds && atrib.alunosIds.length > 0),
        botaoDeveEstarHabilitado: !!atrib.professorId && !!(atrib.alunosIds && atrib.alunosIds.length > 0)
    });
}
```

### Verificar Botão DOM
```javascript
const botao = document.querySelector('button:has(svg[viewBox="0 0 24 24"]):has(span:contains("Salvar"))');
console.log('Botão:', botao);
console.log('Disabled?', botao?.disabled);
console.log('Classes:', botao?.className);
```

### Forçar Re-render (última tentativa)
```javascript
// ⚠️ Use apenas se nada funcionar
window.location.reload();
```

---

## 📸 Capture de Logs para Suporte

Se o problema persistir, **tire um print do console** incluindo:

1. Todos os logs desde "📚 Buscando alunos"
2. Logs de confirmação de professor
3. Logs de confirmação de alunos
4. Log "🔄 Estado atualizado" mais recente
5. Log "✅ BOTÃO DEVE ESTAR HABILITADO" ou "❌ BOTÃO DEVE ESTAR DESABILITADO"

Envie o print junto com:
- Navegador usado (Chrome, Edge, Firefox)
- Versão do navegador
- Se o botão está verde ou cinza
- Se consegue clicar no botão

---

## 📚 Arquivos Modificados

- **frontend/src/pages/AgendamentoEstagio.tsx**
  - Linhas 82-113: useEffect de monitoramento do estado
  - Linhas 330-363: Lógica do disabled do botão com logs
  - Linhas 582-625: Confirmação de professor com logs
  - Linhas 730-775: Confirmação de alunos com logs

---

## ✅ Próximos Passos

1. **Execute o fluxo completo** seguindo o passo a passo
2. **Copie TODOS os logs** do console
3. **Cole os logs** em um documento de texto
4. **Verifique qual log está faltando** (comparar com os logs esperados)
5. **Identifique o cenário de erro** neste documento
6. **Aplique a solução** correspondente

Se nenhum cenário corresponder ao problema, **cole os logs completos** para análise detalhada.

---

**Data:** Outubro 8, 2025  
**Versão:** 1.5.0 - Debug Completo  
**Status:** 🔍 Sistema de Logs Implementado  
**Desenvolvido por:** GitHub Copilot

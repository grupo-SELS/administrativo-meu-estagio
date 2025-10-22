# Remoção de Mocks - Dados Reais de Estágios e Professores

Data: 8 de outubro de 2025

## 🎯 Objetivo

Substituir os dados mockados (hardcoded) por dados reais da API para:
- **Locais de Estágio**: Buscar agendamentos reais do backend
- **Professores**: Buscar professores cadastrados no sistema

---

## 📝 Alterações Realizadas

### 1. **frontend/src/services/apiService.ts**

#### Adicionado método para listar professores:
```typescript
async listarProfessores() {
  return this.request<{ professores: any[] }>('/api/professores');
}
```

**Endpoint utilizado**: `GET /api/professores`

---

### 2. **frontend/src/pages/AgendamentoEstagio.tsx**

#### A. Novos estados de loading e erro

```typescript
const [loadingEstagios, setLoadingEstagios] = useState(true);
const [erroEstagios, setErroEstagios] = useState<string | null>(null);
const [loadingProfessores, setLoadingProfessores] = useState(true);
const [erroProfessores, setErroProfessores] = useState<string | null>(null);
```

**Propósito**: Gerenciar estados de carregamento e erros para melhor UX.

---

#### B. Substituição do mock de estágios por dados reais

**ANTES** (Mock removido):
```typescript
useEffect(() => {
    if (estagios.length === 0) {
        setEstagios([
            {
                id: '1',
                local: 'Hospital Central',
                area: 'Enfermagem',
                horarios: ['08:00 - 12:00', '13:00 - 17:00'],
                vagasDisponiveis: 5
            },
            // ... mais mocks
        ]);
    }
}, [estagios.length]);
```

**DEPOIS** (Busca real da API):
```typescript
useEffect(() => {
    async function fetchEstagios() {
        setLoadingEstagios(true);
        setErroEstagios(null);
        try {
            console.log('📋 Buscando agendamentos (estágios) da API...');
            const response = await apiService.listarAgendamentos();
            
            if (response && Array.isArray(response.agendamentos)) {
                console.log(`${response.agendamentos.length} agendamentos carregados`);
                
                // Converter agendamentos para formato de estágios
                const estagiosData = response.agendamentos.map((agendamento: any) => ({
                    id: agendamento.id,
                    local: agendamento.localEstagio || 'Local não informado',
                    area: agendamento.area || 'Área não informada',
                    horarios: [
                        agendamento.horarioInicio && agendamento.horarioFim 
                            ? `${agendamento.horarioInicio} - ${agendamento.horarioFim}` 
                            : 'Horário não informado'
                    ],
                    vagasDisponiveis: agendamento.vagasDisponiveis || 1,
                    professor: agendamento.professor,
                    professorId: agendamento.professorId,
                    data: agendamento.data,
                    status: agendamento.status
                }));
                
                setEstagios(estagiosData);
            } else {
                setErroEstagios('Nenhum estágio encontrado.');
                setEstagios([]);
            }
        } catch (err: any) {
            console.error('❌ Erro ao buscar estágios:', err);
            setErroEstagios('Erro ao buscar estágios. Tente novamente.');
            setEstagios([]);
        } finally {
            setLoadingEstagios(false);
        }
    }
    fetchEstagios();
}, []);
```

**Endpoint utilizado**: `GET /api/agendamentos`

**Conversão de dados**:
- `agendamento.localEstagio` → `estagio.local`
- `agendamento.area` → `estagio.area`
- `agendamento.horarioInicio + horarioFim` → `estagio.horarios[]`
- `agendamento.vagasDisponiveis` → `estagio.vagasDisponiveis`
- Adiciona campos extras: `professor`, `professorId`, `data`, `status`

---

#### C. Substituição do mock de professores por dados reais

**ANTES** (Mock removido):
```typescript
useEffect(() => {
    if (professores.length === 0) {
        setProfessores([
            {
                id: 'prof-1',
                nome: 'Maria Silva Santos',
                matricula: 'PROF-2023-001',
                polo: 'Polo Central'
            },
            // ... mais mocks
        ]);
    }
}, [professores.length]);
```

**DEPOIS** (Busca real da API):
```typescript
useEffect(() => {
    async function fetchProfessores() {
        setLoadingProfessores(true);
        setErroProfessores(null);
        try {
            console.log('👨‍🏫 Buscando professores da API...');
            const response = await apiService.listarProfessores();
            
            if (response && Array.isArray(response.professores)) {
                console.log(`${response.professores.length} professores carregados`);
                setProfessores(response.professores);
            } else {
                setErroProfessores('Nenhum professor encontrado.');
                setProfessores([]);
            }
        } catch (err: any) {
            console.error('❌ Erro ao buscar professores:', err);
            setErroProfessores('Erro ao buscar professores. Tente novamente.');
            setProfessores([]);
        } finally {
            setLoadingProfessores(false);
        }
    }
    fetchProfessores();
}, []);
```

**Endpoint utilizado**: `GET /api/professores`

---

#### D. UI com estados de loading e erro

**Seção de Professores**:
```tsx
{showProfessores ? (
    <>
        {loadingProfessores ? (
            <div className="text-gray-300 text-center py-8">
                Carregando professores...
            </div>
        ) : erroProfessores ? (
            <div className="text-red-400 text-center py-8">
                {erroProfessores}
            </div>
        ) : (
            // Lista de professores
        )}
    </>
) : /* ... alunos ... */}
```

**Seção de Locais de Estágio**:
```tsx
{loadingEstagios ? (
    <div className="text-gray-300 text-center py-8">
        Carregando estágios...
    </div>
) : erroEstagios ? (
    <div className="text-red-400 text-center py-8">
        {erroEstagios}
    </div>
) : (
    // Lista de estágios
)}
```

---

## 🔄 Fluxo de Dados

### Estágios (Agendamentos)
```
Backend Firestore 
    ↓
GET /api/agendamentos
    ↓
apiService.listarAgendamentos()
    ↓
Conversão: Agendamento → Estagio
    ↓
setEstagios(estagiosData)
    ↓
UI: Lista de Locais de Estágio
```

### Professores
```
Backend Firestore
    ↓
GET /api/professores
    ↓
apiService.listarProfessores()
    ↓
setProfessores(response.professores)
    ↓
UI: Lista de Professores
```

---

## 📊 Interface Estagio

```typescript
interface Estagio {
    id: string;
    local: string;                // agendamento.localEstagio
    horarios: string[];           // [horarioInicio - horarioFim]
    area: string;                 // agendamento.area
    vagasDisponiveis: number;     // agendamento.vagasDisponiveis || 1
    professor?: string;           // agendamento.professor
    professorId?: string;         // agendamento.professorId
    data?: string;                // agendamento.data
    status?: string;              // agendamento.status
}
```

---

## ✅ Benefícios

1. **Dados Reais**: Sistema agora usa dados do Firestore em vez de mocks
2. **Feedback Visual**: Loading e mensagens de erro melhoram UX
3. **Sincronização**: Mudanças no backend refletem automaticamente no frontend
4. **Escalabilidade**: Fácil adicionar mais campos conforme necessário
5. **Debugging**: Console logs para rastrear carregamento de dados

---

## 🧪 Testando

### 1. Backend deve estar rodando
```bash
cd backend
npm run dev
# Deve estar em http://localhost:3002
```

### 2. Verificar endpoints
```bash
# Testar agendamentos
curl http://localhost:3002/api/agendamentos

# Testar professores
curl http://localhost:3002/api/professores
```

### 3. Verificar no frontend
1. Abrir página "Agendamento de Estágio"
2. Deve mostrar "Carregando..." inicialmente
3. Depois exibir dados reais ou mensagem de erro
4. Console deve mostrar logs de carregamento

---

## 🔍 Console Logs

Ao carregar a página, você verá:

```
📋 Buscando agendamentos (estágios) da API...
5 agendamentos carregados
👨‍🏫 Buscando professores da API...
3 professores carregados
```

Ou em caso de erro:

```
❌ Erro ao buscar estágios: Error: HTTP error! status: 500
❌ Erro ao buscar professores: Error: HTTP error! status: 404
```

---

## 📝 Próximos Passos

- [ ] Adicionar refresh automático dos dados
- [ ] Implementar paginação no backend para grandes volumes
- [ ] Cache de dados para melhorar performance
- [ ] Filtros avançados (por área, polo, status)
- [ ] Sincronização em tempo real com Firestore listeners

---

## ⚠️ Observações

1. **Campos opcionais**: `professor`, `professorId`, `data`, `status` podem ser undefined
2. **Valores padrão**: Se `vagasDisponiveis` não existir, usa 1
3. **Formato de horários**: Array com strings no formato "HH:MM - HH:MM"
4. **Error handling**: Trata tanto erros de rede quanto respostas vazias

---

## 🐛 Troubleshooting

**Problema**: "Nenhum estágio encontrado"
- **Solução**: Criar agendamentos usando a página "Novo Agendamento"

**Problema**: "Nenhum professor encontrado"
- **Solução**: Cadastrar professores usando a página "Gerenciamento de Professores"

**Problema**: Loading infinito
- **Solução**: Verificar se backend está rodando e acessível na porta 3002

**Problema**: Erro CORS
- **Solução**: Verificar configuração de CORS no backend `server.ts`

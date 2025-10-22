# Backend - Testes e Validações

## 📋 Estrutura de Testes

Este projeto mantém apenas testes essenciais e bem documentados, seguindo boas práticas de código.

### Testes Disponíveis

#### 1. **Teste de Conexão Firestore** (`test-firestore.ts`)
Valida a conexão com o Firebase Firestore e operações CRUD básicas.

```bash
npm run test:connection
```

**O que testa:**
- ✅ Conexão com Firebase Admin SDK
- ✅ Operação de escrita
- ✅ Operação de leitura
- ✅ Acesso às collections principais
- ✅ Limpeza de dados de teste

#### 2. **Verificação de Notificações** (`check-notifications.ts`)
Lista e verifica notificações no Firestore.

```bash
npm run test:notifications
```

**O que faz:**
- 📋 Lista todas as notificações
- 🔍 Exibe estrutura de dados
- 📊 Mostra estatísticas

#### 3. **Limpeza de Notificações** (`delete-all-notifications.ts`)
Remove todas as notificações de teste do Firestore.

```bash
npm run db:clean-notifications
```

**Cuidado:** Esta operação é irreversível!

---

## 🧹 Limpeza de Arquivos

### Remover Arquivos de Teste Redundantes

Execute o script de limpeza para remover arquivos de teste obsoletos:

```bash
npm run cleanup
```

**Arquivos removidos:**
- Testes redundantes de API
- Testes de nomenclatura já resolvidos
- Scripts de migração executados
- Documentação obsoleta
- Servidores de teste duplicados

**Arquivos mantidos:**
- `server.ts` - Servidor principal
- `test-firestore.ts` - Teste de conexão essencial
- `check-notifications.ts` - Verificação de notificações
- `delete-all-notifications.ts` - Limpeza de dados
- `README.md` - Documentação principal
- `QUICK-START.md` - Guia rápido

---

## 📊 Boas Práticas Implementadas

### 1. **Testes Bem Estruturados**
- ✅ Documentação inline clara
- ✅ Interfaces TypeScript para resultados
- ✅ Funções pequenas e focadas
- ✅ Mensagens de erro descritivas

### 2. **Organização de Código**
- ✅ Constantes separadas
- ✅ Funções assíncronas com async/await
- ✅ Tratamento de erros robusto
- ✅ Tipagem forte com TypeScript

### 3. **Execução e Feedback**
- ✅ Emojis para feedback visual
- ✅ Resultados estruturados
- ✅ Sugestões de solução em caso de erro
- ✅ Exit codes apropriados

### 4. **Performance**
- ✅ Testes sequenciais quando necessário
- ✅ Limpeza automática de dados
- ✅ Operações otimizadas

---

## 🚀 Scripts NPM Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor em modo desenvolvimento |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Inicia servidor em produção |
| `npm test` | Executa teste de conexão |
| `npm run test:connection` | Testa conexão com Firestore |
| `npm run test:notifications` | Lista notificações |
| `npm run cleanup` | Remove arquivos redundantes |
| `npm run db:clean-notifications` | Limpa notificações |

---

## 📁 Estrutura de Arquivos (Após Limpeza)

```
backend/
├── config/
│   ├── firebase-admin.ts       # Configuração Firebase Admin
│   └── serviceAccountKey.json  # Credenciais (gitignored)
├── controllers/
│   ├── alunosController.ts
│   ├── comunicadosController.ts
│   ├── notificationsController.ts
│   └── professoresController.ts
├── middleware/
│   ├── authMiddleware.ts
│   └── uploadMiddleware.ts
├── models/
│   ├── alunos.ts
│   ├── comunicados.ts
│   └── professores.ts
├── routes/
│   ├── alunosRoutes.ts
│   ├── comunicadosRoutes.ts
│   ├── notificationsRoutes.ts
│   └── professoresRoutes.ts
├── scripts/
│   └── cleanup-tests.js        # Script de limpeza
├── utils/
│   └── (utilitários diversos)
├── server.ts                   # Servidor principal
├── test-firestore.ts          # Teste de conexão
├── check-notifications.ts      # Verificação de notificações
├── delete-all-notifications.ts # Limpeza de notificações
├── package.json
├── tsconfig.json
├── README.md                   # Este arquivo
└── QUICK-START.md             # Guia rápido
```

---

## 🔧 Configuração de Testes

### Pré-requisitos

1. **Firebase Admin SDK configurado**
   ```bash
   # Arquivo: config/serviceAccountKey.json
   ```

2. **Variáveis de ambiente**
   ```bash
   # Arquivo: .env
   FIREBASE_PROJECT_ID=registro-itec-dcbc4
   ```

3. **Dependências instaladas**
   ```bash
   npm install
   ```

### Primeira Execução

```bash
# 1. Teste a conexão
npm run test:connection

# 2. Se tudo estiver OK, inicie o servidor
npm run dev

# 3. Verifique o health check
curl http://localhost:3001/health
```

---

## 📝 Adicionando Novos Testes

Se precisar adicionar um novo teste, siga estas diretrizes:

### Template de Teste

```typescript
/**
 * Descrição do teste
 * 
 * Este script valida:
 * - Item 1
 * - Item 2
 * 
 * Uso: npm run test:nome
 */

import { db } from './config/firebase-admin';

// Constantes
const CONST_NAME = 'valor';

// Interfaces
interface TestResult {
  success: boolean;
  operation: string;
  details?: string;
  error?: string;
}

// Funções de teste
async function testarOperacao(): Promise<TestResult> {
  try {
    // Lógica do teste
    return { success: true, operation: 'Nome', details: 'OK' };
  } catch (error) {
    return {
      success: false,
      operation: 'Nome',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

// Função principal
async function executarTeste(): Promise<void> {
  console.log('🔄 Iniciando teste...');
  
  const resultado = await testarOperacao();
  
  if (resultado.success) {
    console.log('✅ Teste passou!');
    process.exit(0);
  } else {
    console.error('❌ Teste falhou!', resultado.error);
    process.exit(1);
  }
}

// Executar
executarTeste().catch(console.error);
```

### Adicionar ao package.json

```json
{
  "scripts": {
    "test:nome": "ts-node test-nome.ts"
  }
}
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'firebase-admin'"
```bash
npm install
```

### Erro: "serviceAccountKey.json not found"
```bash
# Baixe as credenciais do Firebase Console
# Coloque em: backend/config/serviceAccountKey.json
```

### Erro: "Permission denied"
```bash
# Verifique as regras do Firestore
# Certifique-se de ter permissões de admin
```

---

## 📚 Recursos Adicionais

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## ✨ Contribuindo

Ao adicionar novos testes:
1. Siga o template fornecido
2. Documente o propósito e uso
3. Adicione ao package.json
4. Atualize este README
5. Mantenha código limpo e tipado

---

**Última atualização:** Outubro 2025

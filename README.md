# Sistema Administrativo - Gestão de Estágios

Sistema completo de gerenciamento administrativo para estágios na área de saúde, desenvolvido com React, TypeScript, Node.js, Express e Firebase.

## Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Funcionalidades](#funcionalidades)
- [API Endpoints](#api-endpoints)
- [Arquitetura e Padrões](#arquitetura-e-padrões)
- [Segurança](#segurança)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)

---

## Visão Geral

Sistema web para gerenciamento administrativo de estágios, permitindo:
- Gestão de alunos e professores
- Agendamento e controle de estágios
- Criação e gerenciamento de comunicados
- Controle de pontos, faltas e horas
- Sistema de notificações em tempo real
- Interface responsiva com suporte a dark mode

## Tecnologias

### Frontend
- **React 18+** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS 3** - Framework de estilização
- **React Router v6** - Gerenciamento de rotas
- **Firebase Auth** - Autenticação de usuários
- **React Icons** - Biblioteca de ícones
- **React Big Calendar** - Calendário de agendamentos

### Backend
- **Node.js 18+** - Runtime JavaScript
- **Express 4** - Framework web
- **TypeScript 5** - Tipagem estática
- **Firebase Admin SDK** - Integração com Firebase
- **Firestore** - Banco de dados NoSQL
- **Firebase Storage** - Armazenamento de arquivos
- **Helmet** - Segurança HTTP headers
- **Express Rate Limit** - Proteção contra abuso

## Estrutura do Projeto

```
site-adm-app/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   │   ├── Toast/       # Sistema de notificações
│   │   │   ├── ConfirmModal/# Modal de confirmação
│   │   │   ├── Header/      # Cabeçalho principal
│   │   │   └── ...
│   │   ├── pages/           # Páginas da aplicação
│   │   │   ├── Home.tsx
│   │   │   ├── GerenciamentoAlunos.tsx
│   │   │   ├── GerenciamentoProfessores.tsx
│   │   │   ├── AgendamentoEstagio.tsx
│   │   │   ├── NovoAgendamento.tsx
│   │   │   └── ...
│   │   ├── contexts/        # Contextos React
│   │   │   └── ToastContext.tsx
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useConfirm.tsx
│   │   ├── services/        # Serviços e API
│   │   │   └── apiService.ts
│   │   ├── config/          # Configurações
│   │   │   └── firebase.ts
│   │   └── routes.tsx       # Configuração de rotas
│   ├── public/              # Arquivos estáticos
│   └── package.json
│
├── backend/                  # API Node.js
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   │   ├── alunosController.ts
│   │   │   ├── professoresController.ts
│   │   │   ├── agendamentosController.ts
│   │   │   ├── comunicadosController.ts
│   │   │   └── pontosController.ts
│   │   ├── routes/          # Rotas da API
│   │   │   ├── alunosRoutes.ts
│   │   │   ├── professoresRoutes.ts
│   │   │   ├── agendamentosRoutes.ts
│   │   │   ├── comunicadosRoutes.ts
│   │   │   └── pontosRoutes.ts
│   │   ├── middleware/      # Middlewares
│   │   │   ├── authMiddleware.ts
│   │   │   ├── rateLimitMiddleware.ts
│   │   │   ├── uploadMiddleware.ts
│   │   │   └── validationMiddleware.ts
│   │   ├── config/          # Configurações
│   │   │   ├── firebase-admin.ts
│   │   │   └── serviceAccountKey.json
│   │   └── server.ts        # Servidor principal
│   ├── public/              # Arquivos públicos
│   │   └── uploads/         # Uploads locais
│   └── package.json
│
└── README.md                # Este arquivo
```

## Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ e npm
- **Git**
- Conta no **Firebase** (gratuita)

### 1. Clonar o Repositório

```bash
git clone https://github.com/grupo-SELS/administrativo-meu-estagio.git
cd administrativo-meu-estagio
```

### 2. Configurar Firebase

#### 2.1 Criar Projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome: `registro-itec-dcbc4` (ou outro nome de sua escolha)
4. Desabilite Google Analytics (opcional para desenvolvimento)

#### 2.2 Configurar Firestore Database
1. No console do Firebase: Firestore Database > Criar banco de dados
2. Modo: Teste (para desenvolvimento) ou Produção (com regras de segurança)
3. Localização: southamerica-east1 (São Paulo)

#### 2.3 Configurar Firebase Storage
1. No menu lateral: Storage > Começar
2. Aceite as regras padrão ou configure regras customizadas

#### 2.4 Gerar Service Account Key (Backend)
1. Configurações do projeto > Contas de serviço
2. Clique em "Gerar nova chave privada"
3. Baixe o arquivo JSON
4. Salve como `backend/config/serviceAccountKey.json`
5. IMPORTANTE: Adicione este arquivo ao .gitignore

#### 2.5 Configurar Firebase Authentication
1. No menu lateral: Authentication > Método de login
2. Ative o provedor "E-mail/senha"
3. Crie usuários de teste para desenvolvimento

#### 2.6 Obter Credenciais Web (Frontend)
1. Configurações do projeto > Geral
2. Em "Seus aplicativos", clique no ícone Web
3. Registre o app e copie as credenciais do firebaseConfig
4. Configure o arquivo `frontend/src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJECT_ID.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJECT_ID.appspot.com",
  messagingSenderId: "SEU_MESSAGING_ID",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 3. Instalar Dependências

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 4. Estrutura do Firestore

O sistema usa a seguinte estrutura de coleções:

```
/artifacts/registro-itec-dcbc4/
├── users/                    # Alunos e Professores
│   └── {userId}
│       ├── nome
│       ├── email
│       ├── type: 'aluno' | 'professor'
│       ├── polo
│       ├── cpf (alunos)
│       ├── localEstagio
│       └── ...
│
├── public/data/
│   ├── agendamentos/         # Agendamentos de estágios
│   │   └── {agendamentoId}
│   │       ├── local
│   │       ├── horarios
│   │       ├── area
│   │       ├── vagasDisponiveis
│   │       └── ...
│   │
│   └── comunicados/          # Comunicados
│       └── {comunicadoId}
│           ├── titulo
│           ├── conteudo
│           ├── polo
│           ├── categoria
│           └── ...
```

## Executando o Projeto

### Desenvolvimento

#### 1. Iniciar Backend (Terminal 1)
```bash
cd backend
npm run dev
```
- Servidor rodando em: http://localhost:3001
- Hot reload ativado automaticamente
- NODE_ENV=development (bypass de autenticação ativo)

#### 2. Iniciar Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
- Aplicação rodando em: http://localhost:5173
- Hot reload ativado automaticamente
- Header x-dev-bypass enviado automaticamente

### Produção

#### Backend
```bash
cd backend
npm run build    # Compila TypeScript
npm start        # Inicia servidor em modo produção
```

#### Frontend
```bash
cd frontend
npm run build    # Gera build otimizado em dist/
npm run preview  # Preview local do build
```

Observação: Em produção, configure as variáveis de ambiente adequadamente e desative o modo de desenvolvimento.

## Funcionalidades

### Gerenciamento de Alunos
- Criar, editar, visualizar e deletar alunos
- Filtrar por polo e status
- Controle de faltas e horas de estágio
- Atribuir professores orientadores
- Paginação e busca

### Gerenciamento de Professores
- CRUD completo de professores
- Vincular a locais de estágio
- Visualizar alunos orientados
- Deleção individual e em lote

### Agendamento de Estágios
- Criar agendamentos com calendário visual
- Definir locais, horários e vagas
- Atribuir professores aos estágios
- Vincular alunos aos agendamentos
- Deletar agendamentos
- Exportar para CSV

### Comunicados
- Criar comunicados com imagens
- Categorização (geral, urgente, informativo)
- Filtrar por polo e categoria
- Upload de múltiplas imagens
- Soft delete

### Controle de Pontos
- Registrar entrada e saída
- Histórico de pontos
- Correção de registros incorretos
- Visualização por período

### Sistema de Notificações
- Toasts flutuantes (success, error, warning, info)
- Modais de confirmação estilizados
- Animações suaves
- Auto-fechamento configurável

## API Endpoints

### Alunos
```
GET    /api/alunos              # Listar alunos
GET    /api/alunos/:id          # Buscar aluno por ID
POST   /api/alunos              # Criar aluno
PUT    /api/alunos/:id          # Editar aluno
DELETE /api/alunos/:id          # Deletar aluno
```

### Professores
```
GET    /api/professors          # Listar professores
GET    /api/professors/:id      # Buscar professor por ID
POST   /api/professors          # Criar professor
PUT    /api/professors/:id      # Editar professor
DELETE /api/professors/:id      # Deletar professor
```

### Agendamentos
```
GET    /api/agendamentos        # Listar agendamentos
GET    /api/agendamentos/:id    # Buscar agendamento por ID
POST   /api/agendamentos        # Criar agendamento
PUT    /api/agendamentos/:id    # Editar agendamento
DELETE /api/agendamentos/:id    # Deletar agendamento
```

### Comunicados
```
GET    /api/comunicados         # Listar comunicados
GET    /api/comunicados/:id     # Buscar comunicado por ID
POST   /api/comunicados         # Criar comunicado (com upload)
PUT    /api/comunicados/:id     # Editar comunicado
DELETE /api/comunicados/:id     # Deletar comunicado (soft)
```

### Pontos
```
GET    /api/pontos              # Listar pontos
POST   /api/pontos/registrar    # Registrar ponto
PUT    /api/pontos/corrigir     # Corrigir ponto
```

### Parâmetros de Filtro Comuns
```
?polo=Volta Redonda          # Filtrar por polo
?limite=50                   # Limitar resultados
?status=ativo                # Filtrar por status
?categoria=urgente           # Filtrar por categoria
```

## Arquitetura e Padrões

### Frontend

#### Componentes
- **Atômicos**: Botões, inputs, cards
- **Compostos**: Tabelas, formulários
- **Páginas**: Rotas principais

#### Hooks Personalizados
- `useToast()` - Sistema de notificações
- `useConfirm()` - Modais de confirmação

#### Contexts
- `ToastContext` - Gerenciamento global de toasts

#### Roteamento
```tsx
/                          → Home
/login                     → Login
/alunos                    → Gerenciamento de Alunos
/alunos/create            → Criar Aluno
/alunos/editar/:id        → Editar Aluno
/professores              → Gerenciamento de Professores
/professores/create       → Criar Professor
/agendamento-estagio      → Agendamentos
/novo-agendamento         → Criar Agendamento
/comunicados              → Comunicados
/comunicados/create       → Criar Comunicado
/pontos                   → Registro de Pontos
```

### Backend

#### Estrutura MVC
- **Models**: Interfaces TypeScript
- **Controllers**: Lógica de negócio
- **Routes**: Definição de endpoints

#### Middlewares
- `authMiddleware` - Validação JWT
- `devAuthBypass` - Bypass para desenvolvimento
- `rateLimitMiddleware` - Proteção contra rate limiting
- `uploadMiddleware` - Upload de arquivos
- `validationMiddleware` - Validação de dados

#### Rate Limiting
- API geral: 100 requisições / 15 minutos
- Endpoints críticos: 10 requisições / minuto

## Segurança

### Autenticação
- Firebase Authentication com JWT
- Tokens enviados via header `Authorization: Bearer <token>`
- Validação em todos os endpoints de escrita

### Desenvolvimento
- Header `x-dev-bypass: true` para bypass de autenticação
- Ativado apenas em `NODE_ENV=development`

### Validação
- Sanitização de inputs contra XSS
- Validação de tipos e campos obrigatórios
- Rate limiting em rotas críticas

### Upload de Arquivos
- Limitado a imagens (jpg, png, webp, svg)
- Tamanho máximo: 10MB por arquivo
- Sanitização de nomes de arquivo

## Troubleshooting

### Backend não inicia

**Problema**: Erro `Cannot find module 'firebase-admin'`
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Problema**: Erro ao conectar ao Firestore
- Verifique se `serviceAccountKey.json` está no local correto
- Confirme que as credenciais são válidas
- Verifique conexão com internet

### Frontend não conecta à API

**Problema**: CORS error
- Certifique-se que backend está rodando
- Verifique `API_BASE_URL` em `frontend/src/services/apiService.ts`
- Backend deve estar em `http://localhost:3001`

**Problema**: 401 Unauthorized
- Faça login novamente
- Verifique se Firebase Auth está configurado
- Em desenvolvimento, adicione header `x-dev-bypass: true`

### Porta em uso

**Backend (3001)**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

**Frontend (5173)**:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### Uploads não funcionam

1. Verifique `backend/public/uploads/` existe
2. Confirme permissões de escrita
3. Verifique `uploadMiddleware.ts` configuração
4. Tamanho máximo: 10MB

### Banco de dados vazio

Execute os scripts de seed:
```bash
cd backend
npm run seed  # Se disponível
```

Ou crie dados manualmente via interface.

## Deploy

### Preparação para Deploy

1. **Atualizar URLs de produção**:
   - Frontend: Altere `API_BASE_URL` em `frontend/src/services/apiService.ts`
   - Backend: Atualize `ALLOWED_ORIGINS` em `backend/server.ts`

2. **Configurar variáveis de ambiente**:
   - Use os arquivos `.env.example` como referência
   - Configure `NODE_ENV=production` no backend
   - Configure `VITE_ENV=production` no frontend

3. **Testar build localmente**:
   ```bash
   cd frontend && npm run build
   cd ../backend && npm run build
   ```

4. **Revisar segurança**:
   - Verifique que `serviceAccountKey.json` está no .gitignore
   - Confirme que console.logs estão desabilitados em produção
   - Revise regras do Firestore e Storage

### Opções de Deploy

#### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy da pasta dist/
```

#### Backend (Heroku/Railway/Cloud Run)
```bash
cd backend
# Configure variáveis de ambiente no provider
# Deploy via Git ou CLI do provider
```

Para instruções detalhadas, consulte `GUIA_DEPLOY.md` e `PRODUCAO_CHECKLIST.md`.

## Documentação Adicional

O projeto contém documentação detalhada nos seguintes arquivos:

- `GUIA_DEPLOY.md` - Guia completo de deploy para produção
- `PRODUCAO_CHECKLIST.md` - Checklist de verificação pré-deploy
- `RELATORIO_SEGURANCA.md` - Relatório de segurança e auditoria
- `INDICE_DOCUMENTACAO.md` - Índice completo de documentos

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature: `git checkout -b feature/NovaFuncionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/NovaFuncionalidade`
5. Abra um Pull Request

## Licença

Este projeto é privado e pertence ao grupo SELS.

## Equipe

Desenvolvido pela equipe SELS para gestão de estágios na área de saúde.

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento
- Consulte a seção Troubleshooting deste README

---

Última atualização: Outubro 2025

# 🔥 Backend - Sistema de Gestão de Estágios

Backend Node.js com Express, TypeScript e Firebase para gerenciamento de comunicados de estágio na área de saúde.

## 🚀 Configuração Inicial

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Firebase

#### 2.1 Criar Projeto no Firebase Console
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nome do projeto: `sistema-estagios` (ou sua escolha)
4. Desabilite Google Analytics (opcional para este projeto)

#### 2.2 Configurar Firestore Database
1. No console do Firebase, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Selecione uma localização (recomendado: southamerica-east1)

#### 2.3 Configurar Firebase Storage
1. Vá em "Storage" no console
2. Clique em "Começar"
3. Aceite as regras padrão (vamos configurar depois)

#### 2.4 Gerar Service Account Key
1. Vá em "Configurações do projeto" (ícone da engrenagem)
2. Aba "Contas de serviço"
3. Clique em "Gerar nova chave privada"
4. Baixe o arquivo JSON

#### 2.5 Configurar Autenticação (Opcional)
1. Vá em "Authentication"
2. Aba "Método de login"
3. Ative "E-mail/senha"
4. Crie usuários de teste

### 3. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

**Opção 1: Service Account via variável de ambiente**
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"seu-projeto",...}
```

**Opção 2: Service Account via arquivo**
- Salve o JSON baixado como `config/serviceAccountKey.json`

### 4. Scripts Disponíveis
```bash
# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Executar versão buildada
npm start
```

## 📋 API Endpoints

### Públicos (Leitura)
- `GET /health` - Health check
- `GET /api/comunicados` - Listar comunicados
- `GET /api/comunicados/:id` - Buscar comunicado específico

### Privados (Escrita - Requer autenticação)
- `POST /api/comunicados` - Criar comunicado
- `PUT /api/comunicados/:id` - Editar comunicado
- `DELETE /api/comunicados/:id` - Excluir comunicado (soft delete)

### Filtros disponíveis
```
GET /api/comunicados?polo=Volta Redonda
GET /api/comunicados?status=ativo
GET /api/comunicados?limit=5
```

## 🔐 Autenticação

O sistema usa Firebase Authentication com JWT tokens:

1. **Frontend** faz login via Firebase Auth
2. **Frontend** envia token no header: `Authorization: Bearer <token>`
3. **Backend** valida token com Firebase Admin SDK

### Exemplo de uso:
```javascript
{
  "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "Content-Type": "application/json"
}
```

## 📁 Upload de Imagens

Suporte a upload de até 5 imagens por comunicado:

```javascript
const formData = new FormData();
formData.append('titulo', 'Título do comunicado');
formData.append('conteudo', 'Conteúdo...');
formData.append('imagens', file1);
formData.append('imagens', file2);
```

### Formatos aceitos:
- JPG, JPEG, PNG, GIF, WebP
- Tamanho máximo: 5MB por arquivo
- Máximo: 5 arquivos por comunicado

## 🏗️ Estrutura do Projeto

```
backend/
├── config/
│   ├── firebase-admin.ts      # Configuração Firebase
│   └── serviceAccountKey.json # Chave do Firebase (não commitada)
├── controllers/
│   └── comunicadosController.ts # Lógica CRUD
├── middleware/
│   ├── authMiddleware.ts      # Autenticação JWT
│   └── uploadMiddleware.ts    # Upload de arquivos
├── models/
│   └── comunicados.ts         # Interfaces TypeScript
├── routes/
│   └── comunicadosRoutes.ts   # Definição de rotas
├── server.ts                  # Servidor principal
├── package.json
├── tsconfig.json
└── .env                       # Variáveis de ambiente
```

## 🔒 Regras de Segurança Firestore

Para produção, configure estas regras no Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /comunicados/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🔒 Regras de Segurança Storage

Para o Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /comunicados/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🐛 Troubleshooting

### Erro: "Service Account Key não encontrado"
- Verifique se o arquivo `config/serviceAccountKey.json` existe
- OU se a variável `FIREBASE_SERVICE_ACCOUNT` está configurada

### Erro: "Token inválido"
- Verifique se o token JWT não expirou
- Confirme se o projeto Firebase está correto

### Erro: "Permission denied"
- Verifique as regras do Firestore
- Confirme se o usuário está autenticado

## 📚 Documentação Adicional

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)

## 🔄 Deploy

Para deploy em produção:

1. Configure variáveis de ambiente no seu provedor
2. Execute `npm run build`
3. Configure regras de segurança do Firebase
4. Configure domínio no CORS
# Firebase Config

As configurações do Firebase estão no arquivo `frontend/src/config/firebase.ts`.

**IMPORTANTE**: O arquivo atual contém configurações de exemplo. Para produção, você precisa:

1. Acessar o [Console do Firebase](https://console.firebase.google.com/)
2. Selecionar seu projeto `registro-itec-dcbc4`
3. Ir em "Configurações do projeto" → "Geral"
4. Na seção "Seus apps", encontrar a configuração do seu app web
5. Copiar a configuração real e substituir no arquivo `firebase.ts`

## Configuração atual (exemplo):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBEzMkuCK7jLhP1PNwq6S9r1q7mCKr_Y8I",
  authDomain: "registro-itec-dcbc4.firebaseapp.com",
  projectId: "registro-itec-dcbc4",
  storageBucket: "registro-itec-dcbc4.appspot.com",
  messagingSenderId: "432984556",
  appId: "1:432984556:web:abc123def456ghi789"
}
```

## Autenticação

O sistema agora está configurado com Firebase Authentication:

- **Frontend**: React Context (`AuthContext`) integrado com Firebase Auth
- **Backend**: Middleware de autenticação que verifica tokens Firebase
- **Desenvolvimento**: Sistema de bypass para testes (`x-dev-bypass` header)

## Funcionalidades implementadas:

1. **Login/Logout** completo com Firebase
2. **Rotas protegidas** que redirecionam para login se não autenticado
3. **Headers de autenticação** automáticos nas requisições API
4. **Gerenciamento de estado** do usuário em toda a aplicação
5. **Sistema de bypass** para desenvolvimento/testes

## Para usar em produção:

1. Substitua a configuração do Firebase pela real
2. Configure autenticação no Firebase Console
3. Remova ou desabilite o sistema de bypass no backend (`devAuthBypass`)
# Modal de Consentimento LGPD - Especificação

**Arquivo a criar:** `frontend/src/components/ConsentimentoLGPD.tsx`

---

## Visual Proposto

```
┌─────────────────────────────────────────────────────────────┐
│  🔒 Proteção de Dados Pessoais                              │
│  ───────────────────────────────────────────────────────    │
│                                                              │
│  Bem-vindo ao Sistema Administrativo!                       │
│                                                              │
│  Para utilizar nosso sistema, precisamos coletar e          │
│  processar alguns dados pessoais, incluindo seu CPF.        │
│                                                              │
│  📋 Dados que coletamos:                                    │
│  • Nome completo                                            │
│  • CPF (para identificação oficial)                         │
│  • E-mail                                                   │
│  • Polo e dados acadêmicos                                  │
│                                                              │
│  🎯 Para que usamos:                                        │
│  • Gestão acadêmica e de estágios                           │
│  • Emissão de certificados e documentos                     │
│  • Comunicações institucionais                              │
│  • Cumprimento de obrigações legais                         │
│                                                              │
│  🔒 Como protegemos:                                        │
│  • Criptografia em todas as comunicações                    │
│  • Acesso restrito apenas a pessoal autorizado              │
│  • Logs de auditoria de todas as operações                  │
│  • Conformidade total com a LGPD                            │
│                                                              │
│  📜 Seus direitos (LGPD):                                   │
│  • Acessar seus dados a qualquer momento                    │
│  • Solicitar correção de dados incorretos                   │
│  • Solicitar exclusão de dados desnecessários               │
│  • Exportar seus dados em formato estruturado               │
│                                                              │
│  📞 Contato do Encarregado de Dados (DPO):                  │
│  dpo@instituicao.edu.br                                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☑ Li e aceito a Política de Privacidade            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☑ Li e aceito os Termos de Uso                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☑ Autorizo a coleta e tratamento do meu CPF        │   │
│  │   para fins administrativos e acadêmicos           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Ver Política Completa]  [Ver Termos Completos]           │
│                                                              │
│          [Não Aceito]         [Aceito e Continuar]         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Código do Componente

```tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ConsentimentoLGPDProps {
  onAccept: () => void;
  onReject: () => void;
}

export const ConsentimentoLGPD: React.FC<ConsentimentoLGPDProps> = ({
  onAccept,
  onReject
}) => {
  const [aceitouPolitica, setAceitouPolitica] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [autorizouCPF, setAutorizouCPF] = useState(false);

  const podeAceitar = aceitouPolitica && aceitouTermos && autorizouCPF;

  const handleAceitar = () => {
    if (!podeAceitar) return;
    
    // Registrar consentimento no backend
    const consentimento = {
      timestamp: new Date().toISOString(),
      politicaPrivacidade: true,
      termosUso: true,
      coletaCPF: true,
      ip: window.location.hostname,
      userAgent: navigator.userAgent
    };
    
    // Salvar no localStorage (temporário) e no backend
    localStorage.setItem('lgpd_consentimento', JSON.stringify(consentimento));
    
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-xl">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔒</span>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Proteção de Dados Pessoais
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Conforme Lei nº 13.709/2018 (LGPD)
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introdução */}
          <div>
            <p className="text-gray-300 leading-relaxed">
              Bem-vindo ao <strong>Sistema Administrativo</strong>! Para utilizar 
              nosso sistema, precisamos coletar e processar alguns dados pessoais, 
              incluindo seu <strong className="text-yellow-400">CPF</strong>.
            </p>
          </div>

          {/* Dados Coletados */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              📋 Dados que coletamos:
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Nome completo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span><strong className="text-yellow-400">CPF</strong> (para identificação oficial)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>E-mail</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Polo e dados acadêmicos</span>
              </li>
            </ul>
          </div>

          {/* Finalidades */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🎯 Para que usamos:
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Gestão acadêmica e de estágios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Emissão de certificados e documentos oficiais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Comunicações institucionais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Cumprimento de obrigações legais</span>
              </li>
            </ul>
          </div>

          {/* Segurança */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🔒 Como protegemos seus dados:
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Criptografia TLS/SSL em todas as comunicações</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Acesso restrito apenas a pessoal autorizado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Logs de auditoria de todas as operações</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Conformidade total com a LGPD</span>
              </li>
            </ul>
          </div>

          {/* Direitos */}
          <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              📜 Seus direitos (LGPD Art. 18):
            </h3>
            <ul className="space-y-2 text-purple-100">
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>Acessar seus dados a qualquer momento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>Solicitar correção de dados incorretos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>Solicitar exclusão de dados desnecessários</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>Exportar seus dados em formato estruturado (CSV)</span>
              </li>
            </ul>
          </div>

          {/* Contato DPO */}
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <p className="text-gray-300">
              📞 <strong>Contato do Encarregado de Dados (DPO):</strong>
            </p>
            <a 
              href="mailto:dpo@instituicao.edu.br"
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              dpo@instituicao.edu.br
            </a>
          </div>

          {/* Checkboxes de Consentimento */}
          <div className="space-y-3 border-t border-gray-600 pt-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={aceitouPolitica}
                onChange={(e) => setAceitouPolitica(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-300 group-hover:text-white transition-colors">
                Li e aceito a{' '}
                <Link to="/politica-privacidade" target="_blank" className="text-blue-400 hover:underline">
                  Política de Privacidade
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={(e) => setAceitouTermos(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-300 group-hover:text-white transition-colors">
                Li e aceito os{' '}
                <Link to="/termos-uso" target="_blank" className="text-blue-400 hover:underline">
                  Termos de Uso
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group bg-yellow-900 bg-opacity-20 p-3 rounded-lg border border-yellow-700">
              <input
                type="checkbox"
                checked={autorizouCPF}
                onChange={(e) => setAutorizouCPF(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-300 group-hover:text-white transition-colors">
                <strong className="text-yellow-400">Autorizo expressamente</strong> a coleta e 
                tratamento do meu <strong>CPF</strong> para fins administrativos, acadêmicos e 
                emissão de documentos oficiais, conforme LGPD Art. 7º, II.
              </span>
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onReject}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Não Aceito
            </button>
            <button
              onClick={handleAceitar}
              disabled={!podeAceitar}
              className={`
                flex-1 px-6 py-3 rounded-lg font-semibold transition-all
                ${podeAceitar
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {podeAceitar ? '✓ Aceito e Continuar' : 'Marque todas as opções'}
            </button>
          </div>

          {/* Informação Legal */}
          <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
            Ao aceitar, você reconhece ter lido e compreendido todos os termos. 
            Seu consentimento será registrado com data, hora e IP para fins de auditoria.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentimentoLGPD;
```

---

## Como Usar

### 1. Em App.tsx ou no componente principal:

```tsx
import { useState, useEffect } from 'react';
import { ConsentimentoLGPD } from './components/ConsentimentoLGPD';

function App() {
  const [mostrarConsentimento, setMostrarConsentimento] = useState(false);

  useEffect(() => {
    // Verifica se usuário já aceitou
    const consentimento = localStorage.getItem('lgpd_consentimento');
    if (!consentimento) {
      setMostrarConsentimento(true);
    }
  }, []);

  const handleAceitarConsentimento = async () => {
    // Salvar no backend
    const consentimento = JSON.parse(localStorage.getItem('lgpd_consentimento')!);
    
    await fetch('/api/consentimento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consentimento)
    });
    
    setMostrarConsentimento(false);
  };

  const handleRejeitarConsentimento = () => {
    // Redirecionar para página externa ou logout
    alert('Sem o consentimento, não é possível usar o sistema.');
    // window.location.href = '/';
  };

  return (
    <>
      {mostrarConsentimento && (
        <ConsentimentoLGPD
          onAccept={handleAceitarConsentimento}
          onReject={handleRejeitarConsentimento}
        />
      )}
      
      {/* Resto da aplicação */}
      <YourApp />
    </>
  );
}
```

---

## Backend - Endpoint para Salvar Consentimento

**Arquivo:** `backend/controllers/consentimentoController.ts`

```typescript
import { Request, Response } from 'express';
import { db } from '../config/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const APP_ID = 'registro-itec-dcbc4';
const consentimentosCollection = db.collection(`artifacts/${APP_ID}/consentimentos`);

export class ConsentimentoController {
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const { timestamp, politicaPrivacidade, termosUso, coletaCPF, ip, userAgent } = req.body;
      const userId = (req as any).user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const consentimentoData = {
        userId,
        timestamp: new Date(timestamp),
        politicaPrivacidade: !!politicaPrivacidade,
        termosUso: !!termosUso,
        coletaCPF: !!coletaCPF,
        ip: ip || req.ip,
        userAgent: userAgent || req.get('user-agent'),
        createdAt: FieldValue.serverTimestamp()
      };

      const docRef = await consentimentosCollection.add(consentimentoData);

      console.log(`[LGPD] Consentimento registrado - User: ${userId}, Doc: ${docRef.id}`);

      res.status(201).json({
        message: 'Consentimento registrado com sucesso',
        id: docRef.id
      });
    } catch (error: any) {
      console.error('[consentimentoController] Erro:', error);
      res.status(500).json({
        error: 'Erro ao registrar consentimento',
        message: error.message
      });
    }
  }

  async consultar(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid;

      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const snapshot = await consentimentosCollection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        res.status(404).json({ error: 'Nenhum consentimento encontrado' });
        return;
      }

      const doc = snapshot.docs[0];
      res.json({
        id: doc.id,
        ...doc.data()
      });
    } catch (error: any) {
      console.error('[consentimentoController] Erro:', error);
      res.status(500).json({
        error: 'Erro ao consultar consentimento',
        message: error.message
      });
    }
  }
}

export default new ConsentimentoController();
```

---

## Rota

**Arquivo:** `backend/routes/consentimento.ts`

```typescript
import { Router } from 'express';
import consentimentoController from '../controllers/consentimentoController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, consentimentoController.registrar);
router.get('/', authMiddleware, consentimentoController.consultar);

export default router;
```

---

## Integração no server.ts

```typescript
import consentimentoRoutes from './routes/consentimento';

// ...

app.use('/api/consentimento', consentimentoRoutes);
```

---

## Checklist de Implementação

- [ ] Criar componente `ConsentimentoLGPD.tsx`
- [ ] Criar controller `consentimentoController.ts`
- [ ] Criar rota `/api/consentimento`
- [ ] Integrar no App.tsx
- [ ] Criar páginas `/politica-privacidade` e `/termos-uso`
- [ ] Testar fluxo completo
- [ ] Verificar salvamento no Firestore
- [ ] Testar rejeição de consentimento

---

**Nota:** Este modal deve aparecer APENAS no primeiro acesso do usuário. Uma vez aceito, o consentimento fica registrado permanentemente (salvo revogação expressa do titular).

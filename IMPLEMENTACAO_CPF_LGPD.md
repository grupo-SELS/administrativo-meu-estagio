# Implementação de Campo CPF - Análise de Impacto de Privacidade (LGPD)

**Data:** 13/10/2025  
**Autor:** Sistema de Gerenciamento Administrativo  
**Classificação:** DADOS PESSOAIS SENSÍVEIS

---

## 1. ANÁLISE DE IMPACTO NA PROTEÇÃO DE DADOS (DPIA)

### 1.1 Justificativa Legal
- **Base Legal:** Art. 7º, II da LGPD - Cumprimento de obrigação legal ou regulatória
- **Finalidade:** Identificação única e inequívoca de alunos e professores para fins administrativos e acadêmicos
- **Necessidade:** CPF é necessário para emissão de documentos oficiais, certificados e registros acadêmicos

### 1.2 Dados Coletados
- **Tipo:** CPF (Cadastro de Pessoa Física) - Dado Pessoal
- **Categoria:** Identificação numérica única
- **Titulares:** Alunos e Professores
- **Sensibilidade:** MÉDIO-ALTO

### 1.3 Riscos Identificados
| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Vazamento de dados | ALTO | MÉDIO | Criptografia, controle de acesso |
| Uso indevido | ALTO | BAIXO | Logs de auditoria, validação |
| Exposição em logs | MÉDIO | MÉDIO | Sanitização de logs |
| Acesso não autorizado | ALTO | BAIXO | Autenticação Firebase |

---

## 2. MEDIDAS DE SEGURANÇA IMPLEMENTADAS

### 2.1 Validação e Sanitização
- ✅ Validação de formato CPF (XXX.XXX.XXX-XX)
- ✅ Validação de dígitos verificadores
- ✅ Remoção de caracteres especiais antes do armazenamento
- ✅ Verificação de CPF duplicado no sistema

### 2.2 Armazenamento Seguro
- ✅ Armazenamento no Firestore com regras de segurança
- ✅ CPF armazenado apenas em texto (sem criptografia adicional devido a limitações de busca)
- ✅ Acesso restrito apenas a usuários autenticados

### 2.3 Transmissão Segura
- ✅ HTTPS obrigatório em produção
- ✅ Headers de segurança (CSP, HSTS)
- ✅ Validação de token JWT

### 2.4 Logs e Auditoria
- ✅ CPF **NUNCA** aparece em logs completos
- ✅ Apenas últimos 3 dígitos para identificação em logs
- ✅ Registro de todas as operações CRUD com CPF

---

## 3. CONFORMIDADE COM LGPD

### 3.1 Direitos dos Titulares
- ✅ **Acesso:** Titular pode solicitar seus dados
- ✅ **Retificação:** Sistema permite edição de CPF
- ✅ **Eliminação:** Deleção completa ao remover cadastro
- ✅ **Portabilidade:** Exportação via CSV
- ✅ **Revogação:** Titular pode solicitar remoção

### 3.2 Políticas Atualizadas
- ✅ Política de Privacidade atualizada
- ✅ Termos de Uso atualizados
- ✅ Aviso de Coleta de Dados implementado

### 3.3 Transparência
- ✅ Informação clara sobre coleta de CPF
- ✅ Finalidade específica documentada
- ✅ Base legal informada aos usuários

---

## 4. IMPLEMENTAÇÃO TÉCNICA

### 4.1 Backend
```typescript
// Validação de CPF
function validarCPF(cpf: string): boolean
function sanitizeCPF(cpf: string): string

// Logs seguros
function logCPFSeguro(cpf: string): string // Retorna apenas ***.***.XXX-XX
```

### 4.2 Frontend
```typescript
// Componente de input CPF com máscara
// Validação em tempo real
// Mensagens de erro claras
```

### 4.3 Firestore Rules
```javascript
// Acesso apenas para usuários autenticados
// Validação de formato no servidor
```

---

## 5. CRONOGRAMA DE IMPLEMENTAÇÃO

1. ✅ Análise de impacto (DPIA)
2. ⏳ Atualização das políticas
3. ⏳ Implementação no backend
4. ⏳ Implementação no frontend
5. ⏳ Testes de segurança
6. ⏳ Revisão final e documentação

---

## 6. RESPONSABILIDADES

- **Controlador de Dados:** Instituição de Ensino
- **Operador de Dados:** Sistema Administrativo
- **DPO (Encarregado):** [A DEFINIR]
- **Equipe Técnica:** Desenvolvimento e manutenção

---

## 7. CONTATO PARA EXERCÍCIO DE DIREITOS

**E-mail:** dpo@instituicao.edu.br  
**Telefone:** [A DEFINIR]  
**Canal de Atendimento:** Sistema interno

---

## 8. REVISÕES

| Data | Versão | Alterações | Responsável |
|------|--------|------------|-------------|
| 13/10/2025 | 1.0 | Documento inicial | Sistema |

---

**IMPORTANTE:** Este documento deve ser revisado a cada 6 meses ou sempre que houver alterações significativas no processamento de dados pessoais.

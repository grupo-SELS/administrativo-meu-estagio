/**
 * Utilitários para validação e manipulação segura de CPF
 * Conforme LGPD - Lei 13.709/2018
 * 
 * IMPORTANTE: Este arquivo contém funções críticas para proteção de dados pessoais.
 * Qualquer modificação deve ser revisada quanto a impactos na privacidade.
 */

/**
 * Remove caracteres não numéricos do CPF
 * @param cpf - CPF com ou sem formatação
 * @returns CPF apenas com números
 */
export function sanitizeCPF(cpf: string): string {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

/**
 * Formata CPF para exibição (XXX.XXX.XXX-XX)
 * @param cpf - CPF sem formatação
 * @returns CPF formatado
 */
export function formatCPF(cpf: string): string {
  const sanitized = sanitizeCPF(cpf);
  if (sanitized.length !== 11) return cpf;
  
  return sanitized.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Valida formato e dígitos verificadores do CPF
 * @param cpf - CPF a ser validado
 * @returns true se CPF é válido
 */
export function validarCPF(cpf: string): boolean {
  const sanitized = sanitizeCPF(cpf);
  
  // Verifica se tem 11 dígitos
  if (sanitized.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(sanitized)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(sanitized.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digitoVerificador1 = resto >= 10 ? 0 : resto;
  
  if (digitoVerificador1 !== parseInt(sanitized.charAt(9))) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(sanitized.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digitoVerificador2 = resto >= 10 ? 0 : resto;
  
  if (digitoVerificador2 !== parseInt(sanitized.charAt(10))) {
    return false;
  }
  
  return true;
}

/**
 * Mascara CPF para logs (mostra apenas últimos 3 dígitos)
 * CRÍTICO PARA LGPD: Nunca logue CPF completo!
 * @param cpf - CPF a ser mascarado
 * @returns CPF mascarado (***.***.XXX-XX)
 */
export function maskCPFForLogs(cpf: string): string {
  if (!cpf) return '';
  
  const sanitized = sanitizeCPF(cpf);
  if (sanitized.length !== 11) return '***';
  
  const ultimosDigitos = sanitized.slice(-5); // Últimos 5 dígitos (XXX-XX)
  return `***.***. ${ultimosDigitos.slice(0, 3)}-${ultimosDigitos.slice(3)}`;
}

/**
 * Valida e sanitiza CPF para armazenamento
 * @param cpf - CPF a ser processado
 * @returns Objeto com CPF sanitizado e status de validação
 */
export function processarCPF(cpf: string): { 
  valido: boolean; 
  cpfSanitizado: string; 
  erro?: string 
} {
  if (!cpf || cpf.trim() === '') {
    return {
      valido: false,
      cpfSanitizado: '',
      erro: 'CPF é obrigatório'
    };
  }
  
  const sanitized = sanitizeCPF(cpf);
  
  if (!validarCPF(sanitized)) {
    return {
      valido: false,
      cpfSanitizado: sanitized,
      erro: 'CPF inválido. Verifique os dígitos.'
    };
  }
  
  return {
    valido: true,
    cpfSanitizado: sanitized
  };
}

/**
 * Verifica se CPF já existe no banco de dados
 * @param firestore - Instância do Firestore
 * @param cpf - CPF a ser verificado
 * @param excludeId - ID a ser excluído da verificação (para edição)
 * @param collection - Nome da coleção ('alunos' ou 'professores')
 * @returns true se CPF já existe
 */
export async function cpfJaExiste(
  firestore: FirebaseFirestore.Firestore,
  cpf: string,
  collection: 'alunos' | 'professores',
  excludeId?: string
): Promise<boolean> {
  try {
    const sanitized = sanitizeCPF(cpf);
    
    if (!sanitized || sanitized.length !== 11) {
      return false;
    }
    
    const snapshot = await firestore
      .collection(collection)
      .where('cpf', '==', sanitized)
      .get();
    
    if (snapshot.empty) {
      return false;
    }
    
    // Se estiver editando, ignora o próprio registro
    if (excludeId) {
      const filtered = snapshot.docs.filter(doc => doc.id !== excludeId);
      return filtered.length > 0;
    }
    
    return true;
  } catch (error) {
    console.error(`[cpfUtils] Erro ao verificar CPF existente:`, error);
    return false;
  }
}

/**
 * Gera mensagem de erro amigável para validação de CPF
 * @param erro - Tipo de erro
 * @returns Mensagem de erro
 */
export function getMensagemErroCPF(erro: string): string {
  const mensagens: { [key: string]: string } = {
    'CPF_OBRIGATORIO': 'CPF é obrigatório para o cadastro',
    'CPF_INVALIDO': 'CPF inválido. Verifique se digitou corretamente.',
    'CPF_DUPLICADO': 'Este CPF já está cadastrado no sistema',
    'CPF_FORMATO': 'CPF deve conter 11 dígitos numéricos'
  };
  
  return mensagens[erro] || 'Erro ao validar CPF';
}

/**
 * Interface para registro de log de auditoria de CPF
 */
export interface CPFAuditLog {
  timestamp: Date;
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  userId: string;
  collection: 'alunos' | 'professores';
  recordId: string;
  cpfMasked: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Registra operação com CPF para auditoria (LGPD Art. 37)
 * @param log - Dados do log
 */
export function registrarAuditoriaCPF(log: CPFAuditLog): void {
  // Em produção, isso deve ser enviado para um sistema de logs centralizado
  console.log('[AUDITORIA CPF]', {
    timestamp: log.timestamp.toISOString(),
    operation: log.operation,
    userId: log.userId,
    collection: log.collection,
    recordId: log.recordId,
    cpfMasked: log.cpfMasked, // IMPORTANTE: Sempre mascarado!
    ip: log.ip,
    userAgent: log.userAgent
  });
}

export default {
  sanitizeCPF,
  formatCPF,
  validarCPF,
  maskCPFForLogs,
  processarCPF,
  cpfJaExiste,
  getMensagemErroCPF,
  registrarAuditoriaCPF
};

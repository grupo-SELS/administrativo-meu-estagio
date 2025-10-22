// Configuração de segurança para produção
// Desabilita console.log, console.warn e console.info em produção

if (process.env.NODE_ENV === 'production') {
  // Desabilita logs desnecessários
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  
  // Mantém console.error para logs críticos
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Adiciona timestamp aos erros
    originalError(new Date().toISOString(), ...args);
  };
}

export {};

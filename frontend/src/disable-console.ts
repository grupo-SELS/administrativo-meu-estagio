// Desabilita console.log, console.warn e console.info em produção
// Mantém console.error para logging de erros críticos

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
}

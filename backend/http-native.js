const http = require('http');

console.log('🔧 Criando servidor HTTP nativo...\n');

const server = http.createServer((req, res) => {
  console.log(`📥 Requisição: ${req.method} ${req.url}`);
  
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.end(JSON.stringify({
    ok: true,
    message: 'Servidor HTTP nativo funcionando!',
    timestamp: new Date().toISOString()
  }));
});

server.listen(3001, '0.0.0.0', () => {
  console.log('✅ Servidor HTTP nativo rodando em http://localhost:3001');
  console.log('✅ Teste: curl http://localhost:3001\n');
});

server.on('error', (err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});

// Verificar após 1 segundo
setTimeout(() => {
  console.log('📊 Status:');
  console.log('  PID:', process.pid);
  console.log('  Listening:', server.listening);
  const addr = server.address();
  console.log('  Address:', addr);
}, 1000);

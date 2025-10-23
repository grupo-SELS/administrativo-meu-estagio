import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080; // Porta diferente

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  console.log('✅ Requisição recebida!');
  res.json({ message: 'Funcionou!' });
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 Servidor de teste em http://127.0.0.1:${PORT}`);
  console.log('Teste: curl http://127.0.0.1:8080/test\n');
});

server.on('listening', () => {
  const address = server.address();
  console.log('✓ Servidor REALMENTE ouvindo em:', address);
});

server.on('error', (err: any) => {
  console.error('❌ Erro:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Porta ${PORT} em uso!`);
  } else if (err.code === 'EACCES') {
    console.error('Sem permissão para usar esta porta!');
  } else if (err.code === 'EADDRNOTAVAIL') {
    console.error('Endereço não disponível!');
  }
  process.exit(1);
});

setTimeout(() => {
  console.log('\n📊 Status do servidor:');
  console.log('  - Processo rodando:', process.pid);
  console.log('  - Servidor listening:', server.listening);
  const addr = server.address();
  console.log('  - Address:', addr);
}, 2000);

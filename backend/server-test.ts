import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando!' });
});

app.get('/api/comunicados', (req, res) => {
  res.json({
    comunicados: [
      {
        id: '1',
        titulo: 'Teste',
        conteudo: 'Comunicado de teste',
        autor: 'Sistema',
        status: 'ativo',
        dataPublicacao: new Date().toISOString()
      }
    ],
    total: 1
  });
});

const tryPort = (port: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`✅ Backend rodando em http://localhost:${port}`);
      resolve(port);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Porta ${port} ocupada, tentando ${port + 1}...`);
        tryPort(port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

tryPort(3001).catch(console.error);
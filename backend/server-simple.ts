import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Backend funcionando!' });
});

app.get('/api/comunicados', (req, res) => {
  res.json({ comunicados: [], total: 0 });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor SIMPLES rodando em http://localhost:${PORT}`);
});

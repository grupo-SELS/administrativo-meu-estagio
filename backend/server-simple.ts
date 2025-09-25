import express from 'express';
import cors from 'cors';
import { db } from './config/firebase-admin';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend funcionando',
    timestamp: new Date().toISOString()
  });
});

app.get('/test-firestore', async (req, res) => {
  try {
    console.log('🔄 Testando conexão com Firestore...');
    
    const snapshot = await db.collection('comunicados').limit(5).get();
    const comunicados = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({
      success: true,
      message: 'Conexão com Firestore funcionando!',
      projeto: 'registro-itec-dcbc4',
      comunicados_encontrados: comunicados.length,
      comunicados
    });
    
  } catch (error: any) {
    console.error('❌ Erro na conexão com Firestore:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      help: 'Verifique se o serviceAccountKey.json está configurado corretamente'
    });
  }
});

app.get('/api/comunicados', async (req, res) => {
  try {
    const snapshot = await db.collection('comunicados')
      .where('ativo', '==', true)
      .orderBy('dataPublicacao', 'desc')
      .limit(10)
      .get();
      
    const comunicados = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        titulo: data.titulo || 'Sem título',
        conteudo: data.conteudo || 'Sem conteúdo',
        autor: data.autor || 'Autor não informado',
        dataPublicacao: data.dataPublicacao?.toDate?.()?.toISOString() || new Date().toISOString(),
        polo: data.polo || '',
        categoria: data.categoria || 'Geral'
      };
    });
    
    res.json({
      comunicados,
      total: comunicados.length
    });
  } catch (error: any) {
    console.error('Erro ao buscar comunicados:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Teste Firestore: http://localhost:${PORT}/test-firestore`);
  console.log(`📊 API Comunicados: http://localhost:${PORT}/api/comunicados`);
});
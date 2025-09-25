const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');

// Inicializar Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
}

const db = admin.firestore();

async function createTestComunicado() {
  try {
    console.log('📝 Criando comunicado de teste com imagens...');
    
    const comunicadoRef = db.collection('comunicados').doc();
    const agora = new Date();
    
    const comunicado = {
      id: comunicadoRef.id,
      titulo: 'Comunicado de Teste com Imagens',
      conteudo: 'Este é um comunicado de teste que contém múltiplas imagens para demonstrar a funcionalidade de exibição de imagens no sistema.',
      autor: 'Admin - Volta Redonda',
      email: 'teste@exemplo.com',
      polo: 'Volta Redonda',
      categoria: 'Informativo',
      status: 'ativo',
      prioridade: 'media',
      dataPublicacao: agora.toISOString(),
      timestamp: agora.getTime(),
      tags: ['teste', 'imagens', 'demonstracao'],
      imagens: [
        'https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Imagem+1+do+Comunicado',
        'https://via.placeholder.com/800x600/059669/FFFFFF?text=Imagem+2+do+Comunicado',
        'https://via.placeholder.com/800x600/DC2626/FFFFFF?text=Imagem+3+do+Comunicado'
      ],
      visualizacoes: 0,
      ativo: true,
      criadoEm: agora.toISOString(),
      atualizadoEm: agora.toISOString()
    };
    
    await comunicadoRef.set(comunicado);
    
    console.log('✅ Comunicado criado com sucesso!');
    console.log(`📄 ID: ${comunicadoRef.id}`);
    console.log(`📷 Imagens: ${comunicado.imagens.length}`);
    console.log('🔗 URLs das imagens:');
    comunicado.imagens.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
    
    return comunicadoRef.id;
    
  } catch (error) {
    console.error('❌ Erro ao criar comunicado:', error);
    throw error;
  }
}

// Executar
createTestComunicado()
  .then((id) => {
    console.log(`🎉 Comunicado ${id} criado com sucesso! Agora você pode verificar no frontend.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha:', error);
    process.exit(1);
  });
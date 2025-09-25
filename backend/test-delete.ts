import { db } from './config/firebase-admin';

async function testDelete() {
  console.log('🧪 === TESTE DE DELEÇÃO ===');
  
  try {
    const snapshot = await db.collection('notifications')
      .where('tipo', '==', 'comunicado')
      .get();
    
    console.log(`📊 Total de comunicados encontrados: ${snapshot.size}`);
    
    if (snapshot.size === 0) {
      console.log('❌ Nenhum comunicado encontrado para testar');
      return;
    }
    
    const firstDoc = snapshot.docs[0];
    console.log(`🎯 Testando deleção do comunicado: ${firstDoc.id}`);
    console.log(`📄 Dados:`, { id: firstDoc.id, ...firstDoc.data() });
    
    await db.collection('notifications').doc(firstDoc.id).delete();
    console.log('✅ Comunicado deletado com sucesso via Firebase Admin SDK');
    
    const deletedDoc = await db.collection('notifications').doc(firstDoc.id).get();
    if (!deletedDoc.exists) {
      console.log('✅ Confirmado: documento foi deletado');
    } else {
      console.log('❌ Erro: documento ainda existe');
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste de deleção:', error);
  }
}

testDelete()
  .then(() => {
    console.log('✅ Teste concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
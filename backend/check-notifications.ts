import { db } from './config/firebase-admin';

async function checkNotifications() {
  console.log('🔍 === VERIFICANDO NOTIFICATIONS ===');
  
  try {
    
    const snapshot = await db.collection('notifications').get();
    
    console.log(`📊 Total de documentos encontrados: ${snapshot.size}`);
    
    if (snapshot.size === 0) {
      console.log('✅ Collection notifications está vazia');
      return;
    }
    
    let index = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n📄 Documento ${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Tipo: ${data.tipo || 'NÃO DEFINIDO'}`);
      console.log(`   Título: ${data.titulo || data.title || 'NÃO DEFINIDO'}`);
      console.log(`   Estrutura:`, Object.keys(data));
      
      if (data.tipo === 'comunicado') {
        console.log(`   📝 Conteúdo: ${data.conteudo}`);
        console.log(`   👤 Autor: ${data.autor}`);
        console.log(`   📅 Data: ${data.dataPublicacao}`);
        console.log(`   ✅ É um comunicado válido`);
      } else {
        console.log(`   ⚠️ NÃO é um comunicado (tipo: ${data.tipo})`);
      }
      index++;
    });
    
    const comunicadosSnapshot = await db.collection('notifications')
      .where('tipo', '==', 'comunicado')
      .get();
    
    console.log(`\n📋 Comunicados encontrados: ${comunicadosSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar notifications:', error);
  }
}

checkNotifications()
  .then(() => {
    console.log('\n✅ Verificação concluída');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
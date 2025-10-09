import { db } from './config/firebase-admin';

async function checkNotifications() {
  
  
  try {
    
    const snapshot = await db.collection('notifications').get();
    
    
    
    
    
    let index = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      
      
      index++;
    });
    
    const comunicadosSnapshot = await db.collection('notifications')
      .where('tipo', '==', 'comunicado')
      .get();
    
    
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
const admin = require('firebase-admin');

try {
  const serviceAccount = require('./config/serviceAccountKey.json');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'registro-itec-dcbc4.appspot.com'
    });
  }

  console.log('🔥 Firebase inicializado com sucesso');
  
  async function testStorage() {
    try {
      const bucket = admin.storage().bucket();
      console.log(`📦 Bucket: ${bucket.name}`);
      
      const [exists] = await bucket.exists();
      console.log(`✅ Bucket existe: ${exists}`);
      
      if (exists) {
        console.log('🎉 Firebase Storage está funcionando!');
      } else {
        console.log('❌ Bucket não existe no projeto');
      }
      
    } catch (error) {
      console.error('❌ Erro ao testar Storage:', error.message);
    }
  }
  
  testStorage();
  
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error.message);
}
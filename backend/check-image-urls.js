const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkImageUrls() {
  try {
    console.log('🔍 Verificando URLs de imagens no Firestore...\n');
    
    const snapshot = await db
      .collection('artifacts/registro-itec-dcbc4/public/data/notifications')
      .get();
    
    let count = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.imagens && data.imagens.length > 0) {
        count++;
        console.log(`📄 Comunicado ${count}: "${data.title || data.titulo}"`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Autor: ${data.autor || 'N/A'}`);
        console.log(`   Imagens (${data.imagens.length}):`);
        data.imagens.forEach((img, idx) => {
          console.log(`      ${idx + 1}. ${img}`);
        });
        console.log('');
      }
    });
    
    console.log(`\n✅ Total de comunicados com imagens: ${count}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkImageUrls();

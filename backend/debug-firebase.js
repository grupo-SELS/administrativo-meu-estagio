const admin = require('firebase-admin');


const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://registro-itec-dcbc4-default-rtdb.firebaseio.com",
  storageBucket: "registro-itec-dcbc4.appspot.com"
});

const db = admin.firestore();

async function debugFirebase() {
  try {
    console.log('🔍 VERIFICANDO COLLECTION NOTIFICATIONS...');
    
    const snapshot = await db.collection('notifications').get();
    
    console.log(`📊 Total de documentos na collection: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('❌ A collection notifications está VAZIA!');
      return;
    }
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📋 DOCUMENTO ${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   title: ${data.title || 'N/A'}`);
      console.log(`   message: ${data.message || 'N/A'}`);
      console.log(`   type: ${data.type || 'N/A'}`);
      console.log(`   senderId: ${data.senderId || 'N/A'}`);
      console.log(`   createdAt: ${data.createdAt || 'N/A'}`);
      console.log(`   targetPolos: ${JSON.stringify(data.targetPolos || [])}`);
      console.log(`   targetUserTypes: ${JSON.stringify(data.targetUserTypes || [])}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar Firebase:', error);
  }
}

debugFirebase();
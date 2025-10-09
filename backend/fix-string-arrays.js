const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixStringArrays() {
  try {
    console.log('🔧 Corrigindo arrays de imagens salvos como string...\n');
    
    const snapshot = await db
      .collection('artifacts/registro-itec-dcbc4/public/data/notifications')
      .get();
    
    let fixed = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (data.imagens) {

        if (typeof data.imagens === 'string' && data.imagens.length > 0) {
          console.log(`📄 Comunicado: "${data.title || data.titulo}"`);
          console.log(`   Tipo atual: string`);
          console.log(`   Valor: ${data.imagens.substring(0, 100)}...`);
          

          const imagensArray = data.imagens.includes(',')
            ? data.imagens.split(',').map(img => img.trim()).filter(img => img)
            : [data.imagens];
          
          console.log(`   ✅ Convertido para array com ${imagensArray.length} itens`);
          

          await doc.ref.update({
            imagens: imagensArray,
            imageUrl: imagensArray.length > 0 ? imagensArray[0] : null
          });
          
          fixed++;
          console.log('');
        } else if (Array.isArray(data.imagens)) {
          console.log(`✓ "${data.title || data.titulo}" - já é array (${data.imagens.length} itens)`);
        }
      }
    }
    
    console.log(`\n📊 Resumo:`);
    console.log(`   ✅ Documentos corrigidos: ${fixed}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixStringArrays();

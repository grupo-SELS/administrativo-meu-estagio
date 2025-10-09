const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');
const fs = require('fs');
const path = require('path');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixImageUrls() {
  try {
    console.log('🔧 Corrigindo URLs de imagens no Firestore...\n');
    
    const snapshot = await db
      .collection('artifacts/registro-itec-dcbc4/public/data/notifications')
      .get();
    
    const uploadsDir = path.join(__dirname, 'public/uploads');
    const availableImages = fs.readdirSync(uploadsDir)
      .filter(file => file.startsWith('img_'))
      .map(file => `/uploads/${file}`);
    
    console.log(`📁 Imagens disponíveis em /uploads: ${availableImages.length}\n`);
    
    let fixed = 0;
    let removed = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (data.imagens) {

        let imagensArray = data.imagens;
        if (typeof data.imagens === 'string') {
          console.log(`⚠️  String detectada em "${data.title || data.titulo}": convertendo para array`);
          imagensArray = data.imagens.includes(',') 
            ? data.imagens.split(',').map(img => img.trim()).filter(img => img)
            : [data.imagens];
        }
        
        const originalImages = Array.isArray(imagensArray) ? [...imagensArray] : [];
        
        if (originalImages.length === 0) continue;
        

        const validImages = originalImages.filter(img => {

          if (img.includes('placeholder')) {
            console.log(`❌ Removendo placeholder de "${data.title || data.titulo}": ${img}`);
            removed++;
            return false;
          }
          

          if (img.startsWith('/uploads/')) {
            const filename = img.replace('/uploads/', '');
            const exists = availableImages.some(available => available.includes(filename));
            if (!exists) {
              console.log(`⚠️  Imagem não encontrada em "${data.title || data.titulo}": ${img}`);
              removed++;
              return false;
            }
          }
          
          return true;
        });
        

        if (JSON.stringify(originalImages) !== JSON.stringify(validImages)) {
          await doc.ref.update({
            imagens: validImages,
            imageUrl: validImages.length > 0 ? validImages[0] : null
          });
          
          console.log(`✅ Atualizado "${data.title || data.titulo}":`);
          console.log(`   Antes: ${originalImages.length} imagens`);
          console.log(`   Depois: ${validImages.length} imagens\n`);
          fixed++;
        }
      }
    }
    
    console.log(`\n📊 Resumo:`);
    console.log(`   ✅ Documentos atualizados: ${fixed}`);
    console.log(`   ❌ Imagens removidas: ${removed}`);
    console.log(`   📁 Imagens válidas disponíveis: ${availableImages.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixImageUrls();

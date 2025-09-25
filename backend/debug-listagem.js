const admin = require('firebase-admin');

const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://registro-itec-dcbc4-default-rtdb.firebaseio.com",
  storageBucket: "registro-itec-dcbc4.appspot.com"
});

const db = admin.firestore();

async function debugListagem() {
  try {
    console.log('🔍 TESTANDO LÓGICA DE LISTAGEM...');
    
    const snapshot = await db.collection('notifications').get();
    const comunicados = [];
    
    console.log(`📊 Total de documentos: ${snapshot.size}`);
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📋 PROCESSANDO DOCUMENTO ${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   title: "${data.title}"`);
      console.log(`   message: "${data.message}"`);
      console.log(`   senderId: "${data.senderId}"`);
      
      const isComunicado = data.title && data.message && data.senderId;
      console.log(`   É comunicado? ${isComunicado}`);
      
      if (isComunicado) {
        const comunicado = {
          id: doc.id,
          titulo: data.title || '',
          conteudo: data.message || '',
          autor: data.senderId || 'Admin',
          polo: Array.isArray(data.targetPolos) ? data.targetPolos.join(', ') : (data.targetPolos || ''),
          categoria: Array.isArray(data.targetUserTypes) ? data.targetUserTypes.join(', ') : (data.targetUserTypes || 'geral'),
          tags: data.tags || [],
          imagens: data.imageUrl ? [data.imageUrl] : [],
          status: 'ativo',
          ativo: true,
          dataPublicacao: data.createdAt ? new Date(data.createdAt.toDate()).toISOString() : new Date().toISOString(),
          visualizacoes: data.visualizacoes || 0
        };
        
        console.log(`   ✅ ADICIONADO: "${comunicado.titulo}"`);
        
        if (comunicado.titulo && comunicado.conteudo) {
          comunicados.push(comunicado);
          console.log(`   ✅ INCLUÍDO NA LISTA FINAL`);
        } else {
          console.log(`   ❌ REJEITADO: titulo="${comunicado.titulo}" conteudo="${comunicado.conteudo}"`);
        }
      }
    });
    
    console.log(`\n📊 RESULTADO FINAL:`);
    console.log(`   Comunicados encontrados: ${comunicados.length}`);
    comunicados.forEach((c, i) => {
      console.log(`   ${i+1}. "${c.titulo}" - ${c.conteudo.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

debugListagem();
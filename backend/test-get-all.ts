/**
 * Script para testar a função getAllNotificationsFromFirebase
 */

import { db } from './config/firebase-admin';

async function getAllNotificationsFromFirebase(): Promise<any[]> {
  try {
    console.log('🔍 Buscando comunicados...');
    
    const snapshot = await db.collection('notifications')
      .where('tipo', '==', 'comunicado')
      .get();
    
    console.log(`📊 Documentos encontrados: ${snapshot.size}`);
    
    const comunicados: any[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n📄 Processando documento ${doc.id}:`);
      console.log(`   Autor original: ${JSON.stringify(data.autor)} (${typeof data.autor})`);
      
      const autorConvertido = typeof data.autor === 'object' && data.autor?.nome 
        ? data.autor.nome 
        : data.autor || 'Sistema';
      
      console.log(`   Autor convertido: ${autorConvertido}`);
      
      comunicados.push({
        id: doc.id,
        ...data,
        autor: autorConvertido
      });
    });
    
    comunicados.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.toDate()).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt.toDate()).getTime() : 0;
      return dateB - dateA;
    });
    
    console.log(`\n✅ Retornando ${comunicados.length} comunicados processados`);
    
    return comunicados;
  } catch (error: any) {
    console.error('❌ Erro ao listar comunicados do Firebase:', error);
    throw error;
  }
}

getAllNotificationsFromFirebase()
  .then((comunicados) => {
    console.log('\n🎯 Resultado final:');
    comunicados.forEach((com, index) => {
      console.log(`   ${index + 1}. ID: ${com.id}`);
      console.log(`      Título: ${com.titulo}`);
      console.log(`      Autor: ${com.autor}`);
      console.log(`      Status: ${com.status}`);
      console.log(`      Ativo: ${com.ativo}`);
    });
    
    console.log('\n✅ Teste concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
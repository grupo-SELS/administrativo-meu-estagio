const fs = require('fs');
const path = require('path');


const ARQUIVOS_PARA_REMOVER = [

  'test-api.js',
  'test-api-simple.js',
  'test-api-browser.js',
  'test-api-endpoints.js',
  

  'test-direct-firebase.js',
  'test-firebase-notifications.ts',
  'test-firestore-structure.js',
  

  'test-admin-naming.js',
  'test-admin-logic.js',
  'test-new-admin-naming.js',
  'test-complete-new-naming.js',
  

  'test-artifacts-path.js',
  'test-collection-paths.js',
  'test-new-path.js',
  
  'test-data-notifications.js',
  

  'test-storage.js',
  

  'test-complete-flow.js',
  

  'test-updated-controller.js',
  

  'test-get-all.ts',
  'test-delete.ts',
  

  'debug-firebase.js',
  'debug-listagem.js',
  'test-api-browser.js',
  

  'migrate-to-correct-structure.js',
  'migrate-to-data-notifications.js',

  'setup-data-notifications.js',
  'create-test-comunicado.js',
  'create-test-data.ts',
  
  'ADMIN_NAMING_IMPLEMENTATION.md',
  'NEW_ADMIN_NAMING_FINAL.md',
  'FIREBASE_MIGRATION.md',
  'PATH_UPDATE_SUMMARY.md',
  'DIAGNOSTIC_SUMMARY.md',
  

  'cors.json',
  'test-comunicado.json',
  

  'server-test.ts',
  'server-simple.ts',
  

  'cleanup-redundant-files.js',
];

const ARQUIVOS_ESSENCIAIS = [
  'server.ts',                    
  'test-firestore.ts',           
  'check-notifications.ts',       
  'delete-all-notifications.ts',  
  'QUICK-START.md',              
  'README.md',                   
];

async function removerArquivosRedundantes() {
  console.log('🧹 Iniciando limpeza de arquivos redundantes...\n');
  
  let removidos = 0;
  let erros = 0;
  
  for (const arquivo of ARQUIVOS_PARA_REMOVER) {
    const caminhoCompleto = path.join(__dirname, '..', arquivo);
    
    try {
      if (fs.existsSync(caminhoCompleto)) {
        fs.unlinkSync(caminhoCompleto);
        console.log(`✅ Removido: ${arquivo}`);
        removidos++;
      } else {
        console.log(`⚠️  Arquivo não encontrado: ${arquivo}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao remover ${arquivo}:`, error.message);
      erros++;
    }
  }
  
  console.log('\n📊 Resumo da limpeza:');
  console.log(`   ✅ Arquivos removidos: ${removidos}`);
  console.log(`   ❌ Erros: ${erros}`);
  console.log(`   📁 Arquivos essenciais mantidos: ${ARQUIVOS_ESSENCIAIS.length}`);
  
  console.log('\n📝 Arquivos essenciais mantidos:');
  ARQUIVOS_ESSENCIAIS.forEach(arquivo => {
    console.log(`   - ${arquivo}`);
  });
  
  console.log('\n✨ Limpeza concluída!');
  console.log('\n💡 Próximos passos:');
  console.log('   1. Execute: npm run test:connection (testa conexão Firestore)');
  console.log('   2. Execute: npm start (inicia o servidor principal)');
  console.log('   3. Revise o README.md para documentação atualizada');
}


removerArquivosRedundantes().catch(console.error);

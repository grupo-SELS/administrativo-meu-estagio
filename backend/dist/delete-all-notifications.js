"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("./config/firebase-admin");
async function deleteAllNotifications() {
    console.log('🗑️ === DELETANDO TODOS OS DOCUMENTOS ===');
    try {
        const snapshot = await firebase_admin_1.db.collection('notifications').get();
        console.log(`📊 Total de documentos encontrados: ${snapshot.size}`);
        if (snapshot.size === 0) {
            console.log('✅ Nenhum documento encontrado na collection notifications');
            return;
        }
        const batchSize = 500;
        let deleted = 0;
        const docs = snapshot.docs;
        for (let i = 0; i < docs.length; i += batchSize) {
            const batch = firebase_admin_1.db.batch();
            const batchDocs = docs.slice(i, i + batchSize);
            console.log(`📦 Preparando batch ${Math.floor(i / batchSize) + 1} com ${batchDocs.length} documentos...`);
            batchDocs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            deleted += batchDocs.length;
            console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} deletado - ${deleted}/${docs.length} documentos processados`);
        }
        console.log(`🎉 Todos os ${deleted} documentos foram deletados com sucesso!`);
        const verifySnapshot = await firebase_admin_1.db.collection('notifications').limit(1).get();
        if (verifySnapshot.empty) {
            console.log('✅ Confirmado: Collection notifications está vazia');
        }
        else {
            console.log('⚠️ Aviso: Ainda existem documentos na collection');
        }
    }
    catch (error) {
        console.error('❌ Erro ao deletar documentos:', error);
    }
}
deleteAllNotifications()
    .then(() => {
    console.log('✅ Script concluído');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});

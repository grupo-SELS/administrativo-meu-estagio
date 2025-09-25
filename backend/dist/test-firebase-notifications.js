"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("./config/firebase-admin");
async function testFirebaseNotifications() {
    console.log('🔥 === TESTE DO FIREBASE NOTIFICATIONS ===');
    try {
        console.log('📡 Testando conexão com Firebase...');
        const testDoc = await firebase_admin_1.db.collection('notifications').limit(1).get();
        console.log('✅ Conexão com Firebase funcionando');
        console.log(`📊 Documentos existentes: ${testDoc.size}`);
        console.log('\n📝 Criando comunicado de teste...');
        const testComunicado = {
            tipo: 'comunicado',
            titulo: 'Teste de Comunicado',
            conteudo: 'Este é um comunicado de teste para verificar a integração com Firebase.',
            categoria: 'geral',
            polo: 'sede',
            autor: {
                nome: 'Sistema de Teste',
                email: 'sistema@teste.com'
            },
            status: 'ativo',
            dataPublicacao: new Date().toISOString(),
            timestamp: Date.now(),
            tags: ['teste', 'firebase'],
            ativo: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const docRef = await firebase_admin_1.db.collection('notifications').add(testComunicado);
        console.log(`✅ Comunicado criado com ID: ${docRef.id}`);
        console.log('\n🔍 Buscando comunicado criado...');
        const doc = await firebase_admin_1.db.collection('notifications').doc(docRef.id).get();
        if (doc.exists) {
            console.log('✅ Comunicado encontrado:', { id: doc.id, ...doc.data() });
        }
        else {
            console.log('❌ Comunicado não encontrado');
        }
        console.log('\n📋 Listando todos os comunicados...');
        const snapshot = await firebase_admin_1.db.collection('notifications')
            .where('tipo', '==', 'comunicado')
            .get();
        console.log(`📊 Total de comunicados encontrados: ${snapshot.size}`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`  - ${doc.id}: ${data.titulo} (${data.status})`);
        });
        console.log('\n✏️ Atualizando comunicado...');
        await firebase_admin_1.db.collection('notifications').doc(docRef.id).update({
            titulo: 'Teste de Comunicado - ATUALIZADO',
            status: 'atualizado',
            updatedAt: new Date()
        });
        console.log('✅ Comunicado atualizado');
        console.log('\n🗑️ Deletando comunicado de teste...');
        await firebase_admin_1.db.collection('notifications').doc(docRef.id).delete();
        console.log('✅ Comunicado deletado');
        console.log('\n🎉 === TODOS OS TESTES PASSARAM ===');
    }
    catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }
}
testFirebaseNotifications()
    .then(() => {
    console.log('\n✅ Teste concluído');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});

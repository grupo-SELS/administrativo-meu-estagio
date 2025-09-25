"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("./config/firebase-admin");
async function testarConexaoFirestore() {
    try {
        console.log('🔄 Testando conexão com Firestore...');
        const testRef = firebase_admin_1.db.collection('test').doc('connection');
        await testRef.set({
            teste: true,
            timestamp: new Date(),
            projeto: 'registro-itec-dcbc4'
        });
        console.log('✅ Escrita no Firestore: OK');
        const snapshot = await testRef.get();
        if (snapshot.exists) {
            console.log('✅ Leitura do Firestore: OK');
            console.log('📄 Dados:', snapshot.data());
        }
        const comunicadosRef = firebase_admin_1.db.collection('comunicados');
        const comunicadosSnapshot = await comunicadosRef.limit(1).get();
        console.log(`✅ Collection 'comunicados': ${comunicadosSnapshot.size} documentos encontrados`);
        await testRef.delete();
        console.log('🧹 Documento de teste removido');
        console.log('🎉 Conexão com Firestore funcionando perfeitamente!');
        console.log('🔗 Projeto:', 'registro-itec-dcbc4');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erro na conexão com Firestore:');
        console.error(error);
        console.log('\n💡 Soluções:');
        console.log('1. Verifique se o arquivo config/serviceAccountKey.json existe');
        console.log('2. Confirme se o projeto Firebase está correto');
        console.log('3. Verifique as regras do Firestore');
        process.exit(1);
    }
}
testarConexaoFirestore();

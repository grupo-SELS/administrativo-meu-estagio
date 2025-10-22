"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("./config/firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const APP_ID = 'registro-itec-dcbc4';
const usersCollection = firebase_admin_1.db.collection(`artifacts/${APP_ID}/users`);
async function testCreateProfessor() {
    try {
        console.log('🧪 Iniciando teste de criação de professor...');
        const professorData = {
            nome: 'Professor Teste',
            type: 'professor',
            localEstagio: 'Hospital Teste',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            polo: 'Volta Redonda',
            email: 'teste@example.com'
        };
        console.log('📝 Dados do professor:', professorData);
        console.log('📍 Collection path:', `artifacts/${APP_ID}/users`);
        const docRef = await usersCollection.add(professorData);
        console.log('✅ Professor criado com ID:', docRef.id);
        const snap = await docRef.get();
        console.log('📄 Documento existe:', snap.exists);
        console.log('📄 Dados salvos:', snap.data());
        await docRef.delete();
        console.log('🗑️  Documento de teste deletado');
        console.log('✅ Teste concluído com sucesso!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erro no teste:', error);
        console.error('❌ Stack:', error.stack);
        process.exit(1);
    }
}
testCreateProfessor();
//# sourceMappingURL=test-professor-create.js.map
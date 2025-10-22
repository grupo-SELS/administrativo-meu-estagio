"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = require("./config/firebase-admin");
const TEST_COLLECTION = 'test';
const TEST_DOC_ID = 'connection';
const PROJETO_ID = 'registro-itec-dcbc4';
async function testarEscrita() {
    try {
        const testRef = firebase_admin_1.db.collection(TEST_COLLECTION).doc(TEST_DOC_ID);
        await testRef.set({
            teste: true,
            timestamp: new Date(),
            projeto: PROJETO_ID,
            ambiente: process.env.NODE_ENV || 'development',
        });
        return {
            success: true,
            operation: 'Escrita',
            details: 'Documento criado com sucesso',
        };
    }
    catch (error) {
        return {
            success: false,
            operation: 'Escrita',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
    }
}
async function testarLeitura() {
    try {
        const testRef = firebase_admin_1.db.collection(TEST_COLLECTION).doc(TEST_DOC_ID);
        const snapshot = await testRef.get();
        if (!snapshot.exists) {
            return {
                success: false,
                operation: 'Leitura',
                error: 'Documento não encontrado',
            };
        }
        const data = snapshot.data();
        return {
            success: true,
            operation: 'Leitura',
            details: `Dados recuperados: ${JSON.stringify(data, null, 2)}`,
        };
    }
    catch (error) {
        return {
            success: false,
            operation: 'Leitura',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
    }
}
async function verificarCollections() {
    try {
        const collections = ['comunicados', 'artifacts/registro-itec-dcbc4/users'];
        const results = [];
        for (const collectionPath of collections) {
            const snapshot = await firebase_admin_1.db.collection(collectionPath).limit(1).get();
            results.push(`${collectionPath}: ${snapshot.size} documento(s)`);
        }
        return {
            success: true,
            operation: 'Verificação de Collections',
            details: results.join('\n   '),
        };
    }
    catch (error) {
        return {
            success: false,
            operation: 'Verificação de Collections',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
    }
}
async function limparTeste() {
    try {
        const testRef = firebase_admin_1.db.collection(TEST_COLLECTION).doc(TEST_DOC_ID);
        await testRef.delete();
        return {
            success: true,
            operation: 'Limpeza',
            details: 'Documento de teste removido',
        };
    }
    catch (error) {
        return {
            success: false,
            operation: 'Limpeza',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
        };
    }
}
function exibirResultado(result) {
    const icon = result.success ? '✅' : '❌';
    console.log(`\n${icon} ${result.operation}: ${result.success ? 'OK' : 'FALHOU'}`);
    if (result.details) {
        console.log(`   ${result.details}`);
    }
    if (result.error) {
        console.error(`   Erro: ${result.error}`);
    }
}
async function testarConexaoFirestore() {
    console.log('🔄 Testando conexão com Firestore...');
    console.log(`🔗 Projeto: ${PROJETO_ID}\n`);
    const resultados = [];
    resultados.push(await testarEscrita());
    resultados.push(await testarLeitura());
    resultados.push(await verificarCollections());
    resultados.push(await limparTeste());
    console.log('\n📊 Resultados dos Testes:');
    resultados.forEach(exibirResultado);
    const todosSucesso = resultados.every((r) => r.success);
    if (todosSucesso) {
        console.log('\n🎉 Todos os testes passaram!');
        console.log('✨ Conexão com Firestore funcionando perfeitamente!\n');
        process.exit(0);
    }
    else {
        console.log('\n⚠️  Alguns testes falharam!');
        console.log('\n💡 Soluções:');
        console.log('   1. Verifique se config/serviceAccountKey.json existe');
        console.log('   2. Confirme se o projeto Firebase está correto');
        console.log('   3. Verifique as regras do Firestore');
        console.log('   4. Certifique-se de ter as permissões necessárias\n');
        process.exit(1);
    }
}
testarConexaoFirestore().catch((error) => {
    console.error('\n❌ Erro crítico ao executar testes:');
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=test-firestore.js.map
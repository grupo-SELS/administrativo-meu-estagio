import { db } from './config/firebase-admin';

async function testarAlunosCount(): Promise<void> {
  console.log('🔍 Testando contagem de alunos no Firestore...\n');

  try {
    // Teste 1: Contar todos com type === 'aluno'
    console.log('📊 Teste 1: Contando com where("type", "==", "aluno")...');
    let alunos: any[] = [];
    let query = db.collection('artifacts/registro-itec-dcbc4/users').where('type', '==', 'aluno');
    let snapshot = await query.get();

    console.log(`   Primeiro lote: ${snapshot.docs.length} documentos`);

    // Primeiro lote
    for (const doc of snapshot.docs) {
      alunos.push({ id: doc.id, ...doc.data() });
    }

    // Paginação através de todos
    let loteNum = 1;
    while (snapshot.docs.length === 50) {
      loteNum++;
      const lastDoc = snapshot.docs.at(-1);
      if (!lastDoc) break;

      snapshot = await query.startAfter(lastDoc).get();
      console.log(`   Lote ${loteNum}: ${snapshot.docs.length} documentos`);

      for (const doc of snapshot.docs) {
        alunos.push({ id: doc.id, ...doc.data() });
      }
    }

    console.log(`\n✅ Total com paginação: ${alunos.length} alunos\n`);

    // Teste 2: Verificar se há limite padrão do Firestore
    console.log('📊 Teste 2: Testando sem paginação (sem startAfter)...');
    const basicSnapshot = await query.get();
    console.log(`   Resultado direto: ${basicSnapshot.docs.length} documentos\n`);

    // Teste 3: Contar todos os documentos (sem filtro)
    console.log('📊 Teste 3: Contando TODOS os documentos (sem type filter)...');
    const allDocsSnapshot = await db.collection('artifacts/registro-itec-dcbc4/users').get();
    console.log(`   Total geral: ${allDocsSnapshot.docs.length} documentos\n`);

    // Teste 4: Listar tipos de documentos diferentes
    console.log('📊 Teste 4: Verificando tipos de documentos...');
    const typesMap = new Map<string, number>();
    for (const doc of allDocsSnapshot.docs) {
      const type = doc.data().type || 'sem-type';
      typesMap.set(type, (typesMap.get(type) || 0) + 1);
    }

    console.log('   Contagem por tipo:');
    for (const [type, count] of typesMap) {
      console.log(`     - ${type}: ${count}`);
    }

    console.log('\n✨ Testes concluídos!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao testar:', error);
    process.exit(1);
  }
}

try { // NOSONAR
  // NOSONAR - Necessário para compatibilidade CommonJS
  // sonarqube-disable-next-line
  (async () => { // NOSONAR
    await testarAlunosCount();
  })();
} catch (error) {
  console.error('❌ Erro crítico:', error);
  process.exit(1);
}

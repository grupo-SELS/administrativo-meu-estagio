// Teste completo de todos os endpoints de listagem
const API_BASE = 'http://localhost:3001/api';

async function testarEndpoint(nome, url) {
  console.log(`\n🧪 Testando ${nome}...`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const keys = Object.keys(data);
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Estrutura:`, keys);
    
    // Detectar qual é a propriedade de array
    const arrayKey = keys.find(k => Array.isArray(data[k]));
    
    if (arrayKey) {
      console.log(`   ✅ Array encontrado: "${arrayKey}"`);
      console.log(`   ✅ Total de itens: ${data[arrayKey].length}`);
      
      if (data.total !== undefined) {
        console.log(`   ✅ Total (propriedade): ${data.total}`);
      }
      
      if (data[arrayKey].length > 0) {
        const primeiro = data[arrayKey][0];
        const primeiroKeys = Object.keys(primeiro);
        console.log(`   ✅ Campos do primeiro item:`, primeiroKeys.slice(0, 5).join(', '), primeiroKeys.length > 5 ? '...' : '');
      }
    } else {
      console.log(`   ⚠️ Nenhum array encontrado na resposta`);
    }
    
    return { sucesso: true, data };
    
  } catch (error) {
    console.log(`   ❌ ERRO: ${error.message}`);
    return { sucesso: false, erro: error.message };
  }
}

async function testarTodos() {
  console.log('═══════════════════════════════════════════════');
  console.log('🔍 TESTE COMPLETO DOS ENDPOINTS DE LISTAGEM');
  console.log('═══════════════════════════════════════════════');
  
  const endpoints = [
    { nome: 'Comunicados', url: `${API_BASE}/comunicados` },
    { nome: 'Alunos', url: `${API_BASE}/alunos` },
    { nome: 'Professores', url: `${API_BASE}/professores` },
    { nome: 'Agendamentos', url: `${API_BASE}/agendamentos` },
  ];
  
  const resultados = [];
  
  for (const endpoint of endpoints) {
    const resultado = await testarEndpoint(endpoint.nome, endpoint.url);
    resultados.push({ ...endpoint, ...resultado });
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('📊 RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════════════\n');
  
  resultados.forEach(r => {
    const status = r.sucesso ? '✅' : '❌';
    console.log(`${status} ${r.nome.padEnd(20)} - ${r.sucesso ? 'OK' : r.erro}`);
  });
  
  const total = resultados.length;
  const sucessos = resultados.filter(r => r.sucesso).length;
  const falhas = total - sucessos;
  
  console.log('\n═══════════════════════════════════════════════');
  console.log(`Total: ${total} | Sucessos: ${sucessos} | Falhas: ${falhas}`);
  console.log('═══════════════════════════════════════════════\n');
  
  if (falhas === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
}

testarTodos();

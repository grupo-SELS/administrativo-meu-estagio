// Teste rápido para verificar se a API de comunicados está funcionando
const API_BASE = 'http://localhost:3001/api';

async function testarComunicados() {
  console.log('🧪 Testando endpoint /api/comunicados...\n');
  
  try {
    const response = await fetch(`${API_BASE}/comunicados`);
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('\n✅ Resposta da API:');
    console.log('   - Estrutura:', Object.keys(data));
    console.log('   - Total:', data.total);
    console.log('   - Comunicados (array):', Array.isArray(data.comunicados));
    console.log('   - Quantidade:', data.comunicados?.length || 0);
    
    if (data.comunicados && data.comunicados.length > 0) {
      console.log('\n📋 Primeiro comunicado:');
      const primeiro = data.comunicados[0];
      console.log('   - ID:', primeiro.id);
      console.log('   - Título:', primeiro.titulo?.substring(0, 50) + '...');
      console.log('   - Autor:', primeiro.autor);
      console.log('   - Data:', primeiro.dataPublicacao);
      console.log('   - Polo:', primeiro.polo);
      console.log('   - Categoria:', primeiro.categoria);
      console.log('   - Imagens:', primeiro.imagens?.length || 0);
    }
    
    console.log('\n✅ API funcionando corretamente!');
    
  } catch (error) {
    console.error('\n❌ Erro ao testar API:', error.message);
  }
}

testarComunicados();

fetch('http://localhost:3001/api/comunicados?limite=3')
  .then(response => {
    console.log('📊 Status:', response.status);
    console.log('📊 Headers:', [...response.headers.entries()]);
    return response.json();
  })
  .then(data => {
    console.log('📋 Resposta completa da API:', data);
    console.log('📋 Total de comunicados:', data.comunicados?.length || 0);
    
    if (data.comunicados && data.comunicados.length > 0) {
      console.log('📋 Comunicados encontrados:');
      data.comunicados.forEach((c, i) => {
        console.log(`   ${i+1}. "${c.titulo}" por ${c.autor}`);
        console.log(`      Conteúdo: ${c.conteudo.substring(0, 50)}...`);
        console.log(`      Polo: ${c.polo}`);
        console.log(`      Categoria: ${c.categoria}`);
        console.log(`      Data: ${c.dataPublicacao}`);
        console.log('---');
      });
    } else {
      console.log('❌ Nenhum comunicado encontrado na resposta');
    }
  })
  .catch(error => {
    console.error('❌ Erro na requisição:', error);
  });
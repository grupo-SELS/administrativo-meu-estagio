const http = require('http');

const data = JSON.stringify({
  titulo: 'Teste Firebase',
  conteudo: 'Testando se o comunicado está sendo salvo no Firebase',
  polo: 'Sede',
  categoria: 'teste',
  email: 'admin@teste.com'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/comunicados',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'x-dev-bypass': 'true'
  }
};

console.log('🧪 Testando criação de comunicado...');
console.log('📡 URL: http://localhost:3001/api/comunicados');
console.log('📦 Dados:', data);

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`📄 Headers:`, res.headers);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('📋 Resposta:', body);
    
    if (res.statusCode === 201) {
      console.log('✅ Comunicado criado com sucesso!');
      
      testListagem();
    } else {
      console.log('❌ Erro na criação do comunicado');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error);
});

req.write(data);
req.end();

function testListagem() {
  console.log('\n🧪 Testando listagem...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/comunicados',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Status listagem: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      console.log('📋 Comunicados encontrados:', body);
      
      try {
        const response = JSON.parse(body);
        if (response.comunicados && response.comunicados.length > 0) {
          const comunicado = response.comunicados[0];
          console.log(`✅ Encontrado comunicado com ID: ${comunicado.id}`);
          
          testDelecao(comunicado.id);
        } else {
          console.log('❌ Nenhum comunicado encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao parsear resposta:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na listagem:', error);
  });

  req.end();
}

function testDelecao(id) {
  console.log(`\n🧪 Testando deleção do comunicado ${id}...`);
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/comunicados/${id}`,
    method: 'DELETE',
    headers: {
      'x-dev-bypass': 'true'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Status deleção: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      console.log('📋 Resposta deleção:', body);
      
      if (res.statusCode === 200) {
        console.log('✅ Comunicado deletado com sucesso!');
      } else {
        console.log('❌ Erro na deleção do comunicado');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na deleção:', error);
  });

  req.end();
}
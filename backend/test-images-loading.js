// Script de teste para verificar carregamento de imagens
const http = require('http');

const imagens = [
  'img_1758206953353_oyyh5vo4w7.png',
  'img_1758042235174_72c62b62388257e9.jpg',
  'img_1758049304745_12a073cdc8813eeb.png'
];

console.log('🧪 Testando carregamento de imagens dos comunicados...\n');
console.log('Base URL: http://localhost:3001/uploads/\n');

let testados = 0;
let sucessos = 0;
let falhas = 0;

async function testarImagem(filename) {
  return new Promise((resolve) => {
    const url = `http://localhost:3001/uploads/${filename}`;
    console.log(`Testando: ${url}`);
    
    const req = http.get(url, (res) => {
      testados++;
      const status = res.statusCode;
      const contentType = res.headers['content-type'];
      
      if (status === 200) {
        console.log(`✅ ${filename}`);
        console.log(`   Status: ${status}`);
        console.log(`   Content-Type: ${contentType}\n`);
        sucessos++;
      } else {
        console.log(`❌ ${filename}`);
        console.log(`   Status: ${status} (esperado: 200)`);
        console.log(`   Content-Type: ${contentType}\n`);
        falhas++;
      }
      
      resolve();
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${filename}`);
      console.log(`   Erro de conexão: ${err.code} - ${err.message}\n`);
      testados++;
      falhas++;
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ ${filename}`);
      console.log(`   Erro: Timeout após 5 segundos\n`);
      req.destroy();
      testados++;
      falhas++;
      resolve();
    });
  });
}

async function testarTodas() {
  for (const img of imagens) {
    await testarImagem(img);
  }
  
  console.log('═══════════════════════════════════════════════');
  console.log('📊 RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════════════');
  console.log(`Total testado: ${testados}`);
  console.log(`✅ Sucessos: ${sucessos}`);
  console.log(`❌ Falhas: ${falhas}`);
  console.log('═══════════════════════════════════════════════\n');
  
  if (falhas === 0) {
    console.log('🎉 TODAS AS IMAGENS ESTÃO ACESSÍVEIS!');
    console.log('✅ O problema foi resolvido!\n');
  } else if (falhas === testados) {
    console.log('⚠️ NENHUMA IMAGEM ESTÁ ACESSÍVEL!');
    console.log('❌ Você reiniciou o servidor backend?');
    console.log('💡 Execute: cd backend && npm run dev\n');
  } else {
    console.log('⚠️ ALGUMAS IMAGENS NÃO ESTÃO ACESSÍVEIS!');
    console.log('💡 Verifique se os arquivos existem em backend/public/uploads/\n');
  }
}

testarTodas();

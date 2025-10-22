import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

interface RouteTest {
  name: string;
  method: string;
  endpoint: string;
  expectedStatus?: number;
}

const routes: RouteTest[] = [
  { name: 'GET /api/alunos', method: 'GET', endpoint: '/api/alunos', expectedStatus: 200 },
  { name: 'GET /api/alunos (com paginação)', method: 'GET', endpoint: '/api/alunos?skip=0&limit=10', expectedStatus: 200 },
  { name: 'GET /api/professores', method: 'GET', endpoint: '/api/professores', expectedStatus: 200 },
  { name: 'GET /api/professores (com paginação)', method: 'GET', endpoint: '/api/professores?skip=0&limit=10', expectedStatus: 200 },
  { name: 'GET /api/comunicados', method: 'GET', endpoint: '/api/comunicados', expectedStatus: 200 },
  { name: 'GET /api/comunicados (com paginação)', method: 'GET', endpoint: '/api/comunicados?skip=0&limit=10', expectedStatus: 200 },
  { name: 'GET /api/agendamentos', method: 'GET', endpoint: '/api/agendamentos', expectedStatus: 200 },
  { name: 'GET /api/agendamentos (com paginação)', method: 'GET', endpoint: '/api/agendamentos?skip=0&limit=5', expectedStatus: 200 },
];

async function logTestResult(route: RouteTest, passed: boolean, duration: number, data: any): Promise<void> {
  const statusColor = passed ? colors.green : colors.red;
  const icon = passed ? '✅' : '❌';
  
  console.log(`${colors.green}${icon}${colors.reset} ${route.name}`);
  console.log(`   Status: ${statusColor}${passed ? '200' : 'erro'}${colors.reset} | Tempo: ${duration}ms`);
  
  if (data?.message) console.log(`   Mensagem: ${data.message}`);
  if (Array.isArray(data)) console.log(`   Registros: ${data.length}`);
  else if (data?.data && Array.isArray(data.data)) console.log(`   Registros: ${data.data.length}`);
}

async function testSingleRoute(route: RouteTest): Promise<boolean> {
  try {
    const startTime = Date.now();
    const response = await axios({
      method: route.method as any,
      url: `${API_BASE_URL}${route.endpoint}`,
      timeout: 5000,
      validateStatus: () => true,
    });
    const duration = Date.now() - startTime;
    const passed = response.status < 400;
    
    await logTestResult(route, passed, duration, response.data);
    console.log('');
    return passed;
  } catch (error: any) {
    console.log(`${colors.red}❌${colors.reset} ${route.name}`);
    console.log(`   ${colors.red}Erro: ${error.message}${colors.reset}`);
    console.log('');
    return false;
  }
}

async function testRoutes(): Promise<void> {
  console.log(`\n${colors.blue}🧪 Iniciando testes de rotas...${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  for (const route of routes) {
    const success = await testSingleRoute(route);
    if (success) passed++;
    else failed++;
  }

  console.log(`${colors.blue}📊 RESUMO${colors.reset}`);
  console.log(`${colors.green}✅ Rotas OK: ${passed}/${routes.length}${colors.reset}`);
  console.log(`${colors.red}❌ Rotas com erro: ${failed}/${routes.length}${colors.reset}`);

  if (failed === 0) {
    console.log(`\n${colors.green}🎉 Todas as rotas estão funcionando!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}⚠️  Algumas rotas apresentaram erros.${colors.reset}\n`);
    process.exit(1);
  }
}

// NOSONAR - Necessário para compatibilidade CommonJS
// sonarqube-disable-next-line
(async () => { // NOSONAR
  await testRoutes();
})();

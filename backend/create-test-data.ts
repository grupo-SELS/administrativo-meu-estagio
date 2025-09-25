import { db } from './config/firebase-admin';

async function createTestData() {
  console.log('🔄 Criando dados de teste...');
  
  const testComunicados = [
    {
      tipo: 'comunicado',
      titulo: 'Bem-vindos ao novo sistema!',
      conteudo: 'Estamos felizes em apresentar o novo sistema de gestão de estágios. Aqui você encontrará todas as informações importantes sobre seu estágio.',
      categoria: 'geral',
      polo: 'sede',
      autor: {
        nome: 'Sistema Administrativo',
        email: 'admin@sistema.com'
      },
      status: 'ativo',
      dataPublicacao: new Date().toISOString(),
      timestamp: Date.now(),
      tags: ['sistema', 'bem-vindos'],
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      tipo: 'comunicado',
      titulo: 'Horários de funcionamento',
      conteudo: 'Lembramos que o atendimento funciona de segunda a sexta-feira, das 8h às 17h. Em caso de emergência, utilize os contatos de plantão.',
      categoria: 'informativo',
      polo: 'sede',
      autor: {
        nome: 'RH',
        email: 'rh@sistema.com'
      },
      status: 'ativo',
      dataPublicacao: new Date(Date.now() - 86400000).toISOString(), 
      timestamp: Date.now() - 86400000,
      tags: ['horarios', 'funcionamento'],
      ativo: true,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      tipo: 'comunicado',
      titulo: 'Documentos obrigatórios',
      conteudo: 'Lembrete: todos os estagiários devem manter seus documentos sempre atualizados no sistema. Verifique regularmente se não há pendências.',
      categoria: 'importante',
      polo: 'sede',
      autor: {
        nome: 'Coordenação',
        email: 'coordenacao@sistema.com'
      },
      status: 'ativo',
      dataPublicacao: new Date(Date.now() - 172800000).toISOString(), 
      timestamp: Date.now() - 172800000,
      tags: ['documentos', 'obrigatorio'],
      ativo: true,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000)
    }
  ];

  try {
    for (const comunicado of testComunicados) {
      const docRef = await db.collection('notifications').add(comunicado);
      console.log(`✅ Comunicado criado: ${docRef.id} - ${comunicado.titulo}`);
    }
    
    console.log('🎉 Dados de teste criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  }
}


createTestData()
  .then(() => {
    console.log('✅ Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
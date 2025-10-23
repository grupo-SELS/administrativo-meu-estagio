// ===============================================
// PM2 ECOSYSTEM CONFIGURATION
// ===============================================
// Configuração do PM2 para gerenciar o backend em produção
// PM2 é um gerenciador de processos para Node.js
// ===============================================

module.exports = {
  apps: [
    {
      // Identificação da aplicação
      name: 'site-adm-estagio-backend',
      
      // Arquivo principal (TypeScript será compilado)
      script: 'server.ts',
      
      // Interpretador para TypeScript
      interpreter: 'node',
      interpreter_args: '-r ts-node/register',
      
      // Diretório de trabalho
      cwd: '/var/www/site-adm-app/backend',
      
      // Instâncias (cluster mode)
      instances: 1, // Use 'max' para usar todos os núcleos da CPU
      exec_mode: 'fork', // ou 'cluster' para múltiplas instâncias
      
      // Variáveis de ambiente
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      
      // Auto-restart configurações
      watch: false, // Não observar mudanças em produção
      autorestart: true, // Reiniciar automaticamente se crashar
      max_restarts: 10, // Máximo de restarts em sequência
      min_uptime: '10s', // Tempo mínimo para considerar restart bem-sucedido
      max_memory_restart: '500M', // Reiniciar se usar mais que 500MB
      
      // Logs
      error_file: '/var/www/site-adm-app/logs/backend-error.log',
      out_file: '/var/www/site-adm-app/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Configurações de tempo
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Source map support para melhor debugging
      source_map_support: true,
      
      // Configurações adicionais
      node_args: '--max-old-space-size=512',
    },
  ],

  // Configuração de deploy (opcional)
  deploy: {
    production: {
      user: 'root', // Substitua pelo seu usuário
      host: '31.97.255.226',
      ref: 'origin/main',
      repo: 'git@github.com:seu-usuario/seu-repo.git', // Substitua pelo seu repo
      path: '/var/www/site-adm-app',
      'post-deploy': 'cd backend && npm install --production && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};

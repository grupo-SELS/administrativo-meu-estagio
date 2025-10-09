import { Header } from "../components/Header";

const politicaConteudo = `
Política de Privacidade - Meu Estágio

Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos os dados pessoais dos usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

1. Dados Coletados
Coletamos dados pessoais necessários para o funcionamento da plataforma, como nome, e-mail, matrícula, geolocalização via GPS, biometria facial, informações acadêmicas e de estágio.

2. Finalidade do Tratamento
Os dados são utilizados para gestão acadêmica, comunicação institucional, controle e autorização de estágios e melhorias funcionais e de segurança dos serviços.

3. Compartilhamento de Dados
Os dados podem ser compartilhados apenas com instituições parceiras e órgãos reguladores, sempre respeitando a LGPD.

4. Segurança
Adotamos medidas técnicas e administrativas para proteger os dados contra acessos não autorizados, perda, alteração ou divulgação indevida.

5. Direitos do Titular
O usuário pode solicitar acesso, correção, exclusão ou portabilidade de seus dados, bem como revogar consentimentos, conforme previsto na LGPD.

6. Retenção dos Dados
Os dados são mantidos pelo tempo necessário para cumprir as finalidades informadas ou obrigações legais.

7. Cookies e Tecnologias
Utilizamos cookies apenas para melhorar a experiência do usuário, sem coleta excessiva de dados.

8. Alterações na Política
Esta política pode ser atualizada. Notificaremos os usuários sobre mudanças relevantes.

9. Contato
Para dúvidas ou solicitações relacionadas à privacidade, envie e-mail para suporte@meuestagio.com.br.
`;

export const PoliticaPrivacidade = () => (
  <>
    <Header />
    <div className="min-h-screen bg-gray-900 pt-20 px-4 flex items-center justify-center">
      <div className="container mx-auto py-8 max-w-3xl flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Política de Privacidade</h1>
        <div className="bg-gray-800 rounded-xl p-6 text-gray-200 whitespace-pre-line shadow-lg border border-gray-700 text-center">
          {politicaConteudo}
        </div>
      </div>
    </div>
  </>
);

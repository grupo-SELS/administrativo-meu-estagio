import { Header } from "../components/Header";

const termosConteudo = `
Bem-vindo ao Meu Estágio!

Estes Termos e Condições regulam o uso da plataforma Meu Estágio. Ao acessar ou utilizar nossos serviços, você concorda com estes termos. Leia atentamente.

1. Aceitação dos Termos
Ao utilizar a plataforma, você concorda com estes Termos e Condições e com nossa Política de Privacidade.

2. Uso da Plataforma
A plataforma destina-se à gestão acadêmica e de estágios. O usuário compromete-se a fornecer informações verdadeiras e manter a confidencialidade de suas credenciais.

3. Propriedade Intelectual
Todo o conteúdo da plataforma é protegido por direitos autorais. É proibida a reprodução sem autorização.

4. Responsabilidades do Usuário
O usuário é responsável pelo uso adequado da plataforma e pelo respeito às normas institucionais e legais, incluindo a LGPD.

5. Proteção de Dados Pessoais
Nos comprometemos a tratar os dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD), garantindo segurança, transparência e respeito à privacidade.

6. Modificações
Reservamo-nos o direito de alterar estes termos a qualquer momento. As alterações serão comunicadas na plataforma.

7. Contato
Dúvidas podem ser enviadas para suporte@meuestagio.com.br.
`;

export const TermosCondicoes = () => (
  <>
    <Header />
    <div className="min-h-screen bg-gray-900 pt-20 px-4 flex items-center justify-center">
      <div className="container mx-auto py-8 max-w-3xl flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Termos e Condições</h1>
        <div className="bg-gray-800 rounded-xl p-6 text-gray-200 whitespace-pre-line shadow-lg border border-gray-700 text-center">
          {termosConteudo}
        </div>
      </div>
    </div>
  </>
);

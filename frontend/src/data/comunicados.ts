// Interfaces
export interface Comunicado {
    id: string;
    titulo: string;
    conteudo: string;
    autor: {
        nome: string;
    };
    dataPublicacao: string;
    tempoRelativo: string;
    imagens?: string[];
}

// Dados mockados - em produção viriam de uma API
export const comunicadosMock: Comunicado[] = [
    {
        id: '1',
        titulo: 'Reunião Mensal - Todos os Estagiários',
        conteudo: 'Comunicamos que será realizada a reunião mensal de acompanhamento de estágio na próxima segunda-feira às 14h no auditório principal. Todos os estagiários dos três polos devem comparecer para apresentação dos relatórios de atividades e alinhamento das próximas diretrizes.',
        autor: {
            nome: 'Coordenação Geral'
        },
        dataPublicacao: '2024-01-15',
        tempoRelativo: '2 horas atrás',
        imagens: [
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop'
        ]
    },
    {
        id: '2',
        titulo: 'Manutenção do Sistema - Polo Volta Redonda',
        conteudo: 'O sistema de controle de ponto do Polo Volta Redonda passará por manutenção programada no próximo sábado das 8h às 12h. Durante este período, os estagiários deverão registrar presença manualmente com o supervisor responsável.',
        autor: {
            nome: 'Admin Volta Redonda'
        },
        dataPublicacao: '2024-01-14',
        tempoRelativo: '1 dia atrás'
    },
    {
        id: '3',
        titulo: 'Nova Política de Home Office para Estagiários',
        conteudo: 'A partir do próximo mês, será implementada a nova política de home office para estagiários. Estudantes poderão trabalhar remotamente até 1 dia por semana, mediante aprovação do supervisor de estágio e coordenação acadêmica.',
        autor: {
            nome: 'Coordenação Geral'
        },
        dataPublicacao: '2024-01-13',
        tempoRelativo: '2 dias atrás',
        imagens: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop'
        ]
    },
    {
        id: '4',
        titulo: 'Workshop de Capacitação - Polo Resende',
        conteudo: 'Será realizado workshop de capacitação técnica para estagiários do Polo Resende. O evento acontecerá nos dias 22 e 23 de janeiro na sala de treinamentos. Inscrições obrigatórias até 18/01.',
        autor: {
            nome: 'Admin Resende'
        },
        dataPublicacao: '2024-01-12',
        tempoRelativo: '3 dias atrás',
        imagens: [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop'
        ]
    },
    {
        id: '5',
        titulo: 'Treinamento de Segurança do Trabalho',
        conteudo: 'Todos os estagiários devem participar do treinamento obrigatório de segurança do trabalho. As sessões acontecerão durante toda a semana em cada polo. Coordenadores locais informarão horários específicos.',
        autor: {
            nome: 'Coordenação Geral'
        },
        dataPublicacao: '2024-01-11',
        tempoRelativo: '4 dias atrás',
        imagens: [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&h=600&fit=crop'
        ]
    },
    {
        id: '6',
        titulo: 'Avaliação Semestral - Polo Angra dos Reis',
        conteudo: 'Informamos que as avaliações semestrais dos estagiários do Polo Angra dos Reis serão realizadas entre os dias 25 e 29 de janeiro. Cada estagiário receberá agendamento individual por e-mail.',
        autor: {
            nome: 'Admin Angra dos Reis'
        },
        dataPublicacao: '2024-01-10',
        tempoRelativo: '5 dias atrás'
    },
    {
        id: '7',
        titulo: 'Novo Programa de Benefícios para Estagiários',
        conteudo: 'A partir de fevereiro, estará disponível o novo programa de benefícios para estagiários com vale-transporte, auxílio-alimentação e seguro contra acidentes. Todos os polos serão contemplados com as mesmas condições.',
        autor: {
            nome: 'Coordenação Geral'
        },
        dataPublicacao: '2024-01-09',
        tempoRelativo: '6 dias atrás'
    },
    {
        id: '8',
        titulo: 'Feira de Oportunidades - Polo Volta Redonda',
        conteudo: 'O Polo Volta Redonda realizará uma feira de oportunidades de emprego para estagiários formandos. O evento acontecerá no dia 2 de fevereiro com participação de empresas parceiras da região.',
        autor: {
            nome: 'Admin Volta Redonda'
        },
        dataPublicacao: '2024-01-08',
        tempoRelativo: '1 semana atrás',
        imagens: [
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop'
        ]
    }
];
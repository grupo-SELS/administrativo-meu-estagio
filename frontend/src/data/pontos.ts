export interface PontoRegistrado {
    id: string;
    nomeAluno: string;
    matricula: string;
    localEstagio: string;
    pontoEntrada: string;
    professorOrientador: string;
    faltasEstagio: number;
    polo: 'Volta Redonda' | 'Resende' | 'Angra dos Reis';
    dataRegistro: string;
}

export const pontosRegistradosMock: PontoRegistrado[] = [
    {
        id: '1',
        nomeAluno: 'Maxley Lima',
        matricula: '2021001',
        localEstagio: 'Hospital São João Batista',
        pontoEntrada: '9:00',
        professorOrientador: 'Dr. Ana Clara Silva',
        faltasEstagio: 2,
        polo: 'Volta Redonda',
        dataRegistro: '2024-01-15'
    },
    {
        id: '2',
        nomeAluno: 'Luiza Santos',
        matricula: '2021002',
        localEstagio: 'UBS Centro - Resende',
        pontoEntrada: '8:30',
        professorOrientador: 'Enf. Carlos Eduardo',
        faltasEstagio: 0,
        polo: 'Resende',
        dataRegistro: '2024-01-15'
    },
    {
        id: '3',
        nomeAluno: 'Pedro Oliveira',
        matricula: '2021003',
        localEstagio: 'Hospital do Retiro',
        pontoEntrada: '7:45',
        professorOrientador: 'Dr. Maria José',
        faltasEstagio: 1,
        polo: 'Volta Redonda',
        dataRegistro: '2024-01-15'
    },
    {
        id: '4',
        nomeAluno: 'Ana Paula Silva',
        matricula: '2021004',
        localEstagio: 'Hospital Geral de Angra',
        pontoEntrada: '8:00',
        professorOrientador: 'Enf. Roberto Lima',
        faltasEstagio: 3,
        polo: 'Angra dos Reis',
        dataRegistro: '2024-01-14'
    },
    {
        id: '5',
        nomeAluno: 'João Carlos Moreira',
        matricula: '2021005',
        localEstagio: 'CAPS - Centro de Atenção Psicossocial',
        pontoEntrada: '9:15',
        professorOrientador: 'Psic. Sandra Reis',
        faltasEstagio: 0,
        polo: 'Resende',
        dataRegistro: '2024-01-14'
    },
    {
        id: '6',
        nomeAluno: 'Fernanda Costa',
        matricula: '2021006',
        localEstagio: 'UPA Angra dos Reis',
        pontoEntrada: '8:45',
        professorOrientador: 'Dr. Paulo Henrique',
        faltasEstagio: 1,
        polo: 'Angra dos Reis',
        dataRegistro: '2024-01-14'
    },
    {
        id: '7',
        nomeAluno: 'Rafael Torres',
        matricula: '2021007',
        localEstagio: 'Hospital da Unimed',
        pontoEntrada: '8:15',
        professorOrientador: 'Enf. Juliana Martins',
        faltasEstagio: 0,
        polo: 'Volta Redonda',
        dataRegistro: '2024-01-13'
    },
    {
        id: '8',
        nomeAluno: 'Isabella Fernandes',
        matricula: '2021008',
        localEstagio: 'Clínica da Família - Resende',
        pontoEntrada: '9:30',
        professorOrientador: 'Dr. Fernando Alves',
        faltasEstagio: 2,
        polo: 'Resende',
        dataRegistro: '2024-01-13'
    },
    {
        id: '9',
        nomeAluno: 'Gabriel Rodrigues',
        matricula: '2021009',
        localEstagio: 'Hospital Naval de Angra',
        pontoEntrada: '7:30',
        professorOrientador: 'Enf. Claudia Santos',
        faltasEstagio: 0,
        polo: 'Angra dos Reis',
        dataRegistro: '2024-01-12'
    },
    {
        id: '10',
        nomeAluno: 'Camila Pereira',
        matricula: '2021010',
        localEstagio: 'Centro de Reabilitação',
        pontoEntrada: '8:00',
        professorOrientador: 'Fisio. Marcos Vinícius',
        faltasEstagio: 1,
        polo: 'Volta Redonda',
        dataRegistro: '2024-01-12'
    },
    {
        id: '11',
        nomeAluno: 'Leonardo Sousa',
        matricula: '2021011',
        localEstagio: 'Laboratório Municipal',
        pontoEntrada: '8:30',
        professorOrientador: 'Biom. Patrícia Lima',
        faltasEstagio: 0,
        polo: 'Resende',
        dataRegistro: '2024-01-11'
    },
    {
        id: '12',
        nomeAluno: 'Mariana Gomes',
        matricula: '2021012',
        localEstagio: 'Santa Casa de Misericórdia',
        pontoEntrada: '7:00',
        professorOrientador: 'Dr. André Luiz',
        faltasEstagio: 4,
        polo: 'Angra dos Reis',
        dataRegistro: '2024-01-11'
    }
];
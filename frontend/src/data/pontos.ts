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

export const pontosRegistradosMock: PontoRegistrado[] = [];
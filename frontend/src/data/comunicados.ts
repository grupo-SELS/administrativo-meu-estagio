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

export const comunicadosMock: Comunicado[] = [];

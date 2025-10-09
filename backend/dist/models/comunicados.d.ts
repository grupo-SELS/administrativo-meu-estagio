import { Timestamp, FieldValue } from 'firebase-admin/firestore';
export interface Comunicado {
    id: string;
    titulo: string;
    conteudo: string;
    autor: string;
    email?: string;
    polo?: string;
    categoria?: string;
    prioridade?: string;
    dataPublicacao: Timestamp | FieldValue;
    dataVencimento?: Timestamp;
    tags?: string[];
    imagens?: string[];
    visualizacoes?: number;
    ativo: boolean;
    criadoEm: Timestamp | FieldValue;
    atualizadoEm: Timestamp | FieldValue;
}
export interface CreateComunicadoDTO {
    titulo: string;
    conteudo: string;
    email?: string;
    polo?: string;
    categoria?: string;
    prioridade?: string;
    dataVencimento?: string;
    tags?: string[];
}
export interface UpdateComunicadoDTO {
    titulo?: string;
    conteudo?: string;
    email?: string;
    polo?: string;
    categoria?: string;
    prioridade?: string;
    dataVencimento?: string;
    tags?: string[];
}
export interface ComunicadoFilters {
    polo?: string;
    categoria?: string;
    prioridade?: string;
    limite?: number;
}
//# sourceMappingURL=comunicados.d.ts.map
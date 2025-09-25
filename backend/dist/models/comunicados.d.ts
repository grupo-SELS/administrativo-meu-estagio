import { Timestamp, FieldValue } from 'firebase-admin/firestore';
export interface Comunicado {
    id: string;
    title: string;
    message: string;
    type: 'comunicado';
    senderId: string;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
    scheduledDate?: Timestamp | null;
    targetPolos: string[];
    targetUserTypes: string[];
    autor: string;
    autorEmail?: string;
    categoria: string;
    polo: string;
    tags: string[];
    imagens: string[];
    status: string;
    ativo: boolean;
    prioridade: string;
    visualizacoes: number;
    dataPublicacao: string;
    imageUrl?: string | null;
}
export interface CreateComunicadoDTO {
    titulo: string;
    conteudo: string;
    email?: string;
    polo?: string;
    categoria?: string;
    status?: string;
    prioridade?: string;
    tags?: string[];
    imagens?: string[];
}
export interface UpdateComunicadoDTO {
    titulo?: string;
    conteudo?: string;
    email?: string;
    polo?: string;
    categoria?: string;
    status?: string;
    prioridade?: string;
    tags?: string[];
    imagens?: string[];
}
export interface ComunicadoFilters {
    polo?: string;
    categoria?: string;
    status?: string;
    prioridade?: string;
    limite?: number;
}

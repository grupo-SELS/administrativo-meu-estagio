"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indicesFirestore = exports.exemplosComunicados = void 0;
exports.exemplosComunicados = {
    "comunicado_001": {
        titulo: "Nova Oportunidade de Estágio em Enfermagem",
        conteudo: "O Hospital Municipal de Volta Redonda está oferecendo vagas para estágio em enfermagem. Os estudantes interessados devem estar cursando a partir do 6º período e ter disponibilidade para plantões noturnos.",
        autor: "Dr. Maria Silva",
        email: "maria.silva@hospital.vr.gov.br",
        polo: "Volta Redonda",
        categoria: "Oportunidade",
        status: "ativo",
        prioridade: "alta",
        dataPublicacao: "2024-01-15T10:30:00Z",
        dataVencimento: "2024-02-15T23:59:59Z",
        tags: ["enfermagem", "hospital", "noturno"],
        imagens: [
            "https://storage.googleapis.com/projeto-firebase.appspot.com/comunicados/img1.jpg",
            "https://storage.googleapis.com/projeto-firebase.appspot.com/comunicados/img2.jpg"
        ],
        visualizacoes: 156,
        ativo: true,
        criadoEm: "2024-01-15T10:30:00Z",
        atualizadoEm: "2024-01-15T10:30:00Z"
    },
    "comunicado_002": {
        titulo: "Mudança de Horário - Estágios de Fisioterapia",
        conteudo: "Informamos que a partir de segunda-feira (22/01) os horários dos estágios de fisioterapia serão alterados. Novo horário: 14h às 18h. Favor confirmar presença com seus supervisores.",
        autor: "Prof. João Santos",
        email: "joao.santos@faculdade.edu.br",
        polo: "Resende",
        categoria: "Aviso",
        status: "ativo",
        prioridade: "media",
        dataPublicacao: "2024-01-18T08:00:00Z",
        dataVencimento: "2024-01-22T23:59:59Z",
        tags: ["fisioterapia", "horario", "mudanca"],
        imagens: [],
        visualizacoes: 89,
        ativo: true,
        criadoEm: "2024-01-18T08:00:00Z",
        atualizadoEm: "2024-01-18T08:00:00Z"
    },
    "comunicado_003": {
        titulo: "Documentos Necessários - Estágio em Radiologia",
        conteudo: "Para iniciar o estágio em radiologia, os alunos devem apresentar: RG, CPF, comprovante de matrícula atualizado, exames médicos (hemograma completo, RX de tórax), cartão de vacina atualizado e termo de compromisso assinado.",
        autor: "Coordenação de Estágios",
        email: "estagios@faculdade.edu.br",
        polo: "Barra Mansa",
        categoria: "Documentos",
        status: "ativo",
        prioridade: "alta",
        dataPublicacao: "2024-01-20T14:15:00Z",
        dataVencimento: "2024-03-20T23:59:59Z",
        tags: ["radiologia", "documentos", "exames"],
        imagens: [
            "https://storage.googleapis.com/projeto-firebase.appspot.com/comunicados/docs_radiologia.pdf"
        ],
        visualizacoes: 234,
        ativo: true,
        criadoEm: "2024-01-20T14:15:00Z",
        atualizadoEm: "2024-01-20T14:15:00Z"
    }
};
exports.indicesFirestore = {
    compositeIndexes: [
        {
            collection: "comunicados",
            fields: [
                { fieldPath: "status", order: "ASCENDING" },
                { fieldPath: "dataPublicacao", order: "DESCENDING" }
            ]
        },
        {
            collection: "comunicados",
            fields: [
                { fieldPath: "polo", order: "ASCENDING" },
                { fieldPath: "ativo", order: "ASCENDING" },
                { fieldPath: "dataPublicacao", order: "DESCENDING" }
            ]
        },
        {
            collection: "comunicados",
            fields: [
                { fieldPath: "categoria", order: "ASCENDING" },
                { fieldPath: "prioridade", order: "ASCENDING" },
                { fieldPath: "dataPublicacao", order: "DESCENDING" }
            ]
        }
    ],
    arrayContainsIndexes: [
        {
            collection: "comunicados",
            field: "tags"
        }
    ]
};
//# sourceMappingURL=firestore-structure.js.map
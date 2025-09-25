import { useState } from "react";
import { Header } from "../components/Header";

// Exemplo de dados de faltas (substitua por fetch da API se necessário)
const faltasExemplo = [
    {
        id: 1,
        nomeAluno: "Ana Silva",
        localEstagio: "Hospital São João Batista",
        dataFalta: "2025-09-10",
        justificada: false,
        justificativa: ""
    },
    {
        id: 2,
        nomeAluno: "Carlos Oliveira",
        localEstagio: "UBS Centro - Resende",
        dataFalta: "2025-09-12",
        justificada: false,
        justificativa: ""
    },
    {
        id: 3,
        nomeAluno: "Maria Santos",
        localEstagio: "Hospital da Marinha",
        dataFalta: "2025-09-15",
        justificada: false,
        justificativa: ""
    },
    
];

type Falta = {
    id: number;
    nomeAluno: string;
    localEstagio: string;
    dataFalta: string;
    justificada: boolean;
    justificativa: string;
};

export const PontosFaltas = () => {
    const [faltas, setFaltas] = useState<Falta[]>(faltasExemplo);
    const [selectedFalta, setSelectedFalta] = useState<Falta | null>(null);
    const [justificativa, setJustificativa] = useState("");

    const handleCardClick = (falta: Falta) => {
        setSelectedFalta(falta);
        setJustificativa(falta.justificativa || "");
    };

    const handleClose = () => {
        setSelectedFalta(null);
        setJustificativa("");
    };

    const handleJustificar = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!selectedFalta) return;
        setFaltas((prev) =>
            prev.map((f) =>
                f.id === selectedFalta.id
                    ? { ...f, justificada: true, justificativa }
                    : f
            )
        );
        handleClose();
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-900 pt-20 pl-70">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-white mb-6">Faltas de Estágio</h1>
                                  <div className="max-h-[80vh] overflow-y-auto flex flex-col gap-4">
                                    {faltas.map((falta) => (
                                        <div
                                            key={falta.id}
                                            className={`bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg cursor-pointer hover:bg-gray-700 transition-all duration-200 ${falta.justificada ? 'opacity-60' : ''}`}
                                            onClick={() => handleCardClick(falta)}
                                        >
                                            <h2 className="text-xl font-semibold text-white mb-2">{falta.nomeAluno}</h2>
                                            <p className="text-gray-300 mb-1">Local: <span className="font-medium">{falta.localEstagio}</span></p>
                                            <p className="text-gray-400 mb-1">Data da falta: <span className="font-medium">{new Date(falta.dataFalta).toLocaleString()}</span></p>
                                            <p className={`text-sm font-medium inline-block ${falta.justificada ? 'text-blue-500' : 'text-yellow-400'}`}>{falta.justificada ? "Falta justificada" : "Falta não justificada"}</p>
                                        </div>
                                    ))}
                                </div>


                    {selectedFalta && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                                    title="Fechar"
                                >
                                    ×
                                </button>
                                <h2 className="text-2xl font-bold text-white mb-4">Justificar Falta</h2>
                                <form onSubmit={handleJustificar} className="space-y-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Nome do aluno</label>
                                        <input
                                            type="text"
                                            value={selectedFalta.nomeAluno}
                                            disabled
                                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Local de estágio</label>
                                        <input
                                            type="text"
                                            value={selectedFalta.localEstagio}
                                            disabled
                                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Data da falta</label>
                                                            <input
                                                                type="text"
                                                                value={new Date(selectedFalta.dataFalta).toLocaleString()}
                                                                disabled
                                                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                                                            />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Justificativa</label>
                                                            <textarea
                                                                value={justificativa}
                                                                onChange={(e) => setJustificativa(e.target.value)}
                                                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
                                                                placeholder="Descreva a justificativa para abonar a falta..."
                                                                required
                                                            />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                                    >
                                        Justificar
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';

import { apiService } from '../services/apiService';

interface Aluno {
    id: string;
    nome: string;
    matricula: string;
    [key: string]: any;
}

interface Estagio {
    id: string;
    local: string;
    horarios: string[];
    vagasDisponiveis: number;
    professor?: string;
}


const estagiosMock: Estagio[] = [
    { id: 'a', local: 'Hospital Municipal', horarios: ['08:00-12:00', '13:00-17:00'], vagasDisponiveis: 2 },
    { id: 'b', local: 'Clínica Saúde+', horarios: ['07:00-13:00'], vagasDisponiveis: 1 },
    { id: 'c', local: 'Centro Odontológico', horarios: ['14:00-18:00'], vagasDisponiveis: 3 },
];

export default function AgendamentoEstagio() {
    const [alunoSelecionado, setAlunoSelecionado] = useState<string | null>(null);
    const [estagioSelecionado, setEstagioSelecionado] = useState<string | null>(null);
    const [professor, setProfessor] = useState<string>('');
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [loadingAlunos, setLoadingAlunos] = useState(true);
    const [erroAlunos, setErroAlunos] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAlunos() {
            setLoadingAlunos(true);
            setErroAlunos(null);
            try {

                const response = await apiService.get<any>('/api/alunos');
                if (response && Array.isArray(response.alunos)) {
                    setAlunos(response.alunos);
                } else {
                    setErroAlunos('Nenhum aluno encontrado.');
                }
            } catch (err: any) {
                setErroAlunos('Erro ao buscar alunos.');
            } finally {
                setLoadingAlunos(false);
            }
        }
        fetchAlunos();
    }, []);

    return (
        <>
            <Header />
            <main className="bg-gray-900 min-h-screen pt-24 pl-0 pb-8 md:pl-70 lg:pl-80">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10">

                    <section className="md:w-2/5 w-full bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col">
                        <h2 className="text-2xl font-bold text-white mb-6">Alunos</h2>
                        {loadingAlunos ? (
                            <div className="text-gray-300">Carregando alunos...</div>
                        ) : erroAlunos ? (
                            <div className="text-red-400">{erroAlunos}</div>
                        ) : (
                            <ul className="flex-1 overflow-y-auto pr-2">
                                {alunos.map(aluno => (
                                    <li
                                        key={aluno.id}
                                        className={`mb-3 p-4 rounded-lg cursor-pointer border transition-all  ${alunoSelecionado === aluno.id ? 'bg-blue-700 text-white border-blue-400' : 'bg-gray-700 text-gray-200 border-gray-700 hover:bg-blue-800 hover:text-white'}`}
                                        onClick={() => setAlunoSelecionado(aluno.id)}
                                    >
                                        <div className="font-semibold text-base">{aluno.nome}</div>
                                        <div className="text-xs text-gray-300">Matrícula: {aluno.matricula}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Polo: <span className="text-gray-200">{aluno.polo || '-'}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>


                    <section className="md:w-2/5 w-full flex flex-col max-h-[70vh] overflow-y-auto bg-gray-800 rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Locais de Estágio com Vagas</h2>
                        <div className="flex flex-col gap-8">
                            {estagiosMock.map(estagio => (
                                <div
                                    key={estagio.id}
                                    className={`rounded-2xl p-6 shadow-lg border-1 transition-all cursor-pointer flex flex-col gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-700 ${estagioSelecionado === estagio.id ? 'border-blue-500 bg-blue-900' : 'border-gray-700 bg-gray-800 hover:border-blue-400'}`}
                                    onClick={() => setEstagioSelecionado(estagio.id)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-lg font-semibold text-white">{estagio.local}</div>
                                        <span className="px-3 py-1 rounded-full bg-blue-700 text-white text-xs font-bold">
                                            {estagio.vagasDisponiveis} vaga{estagio.vagasDisponiveis > 1 ? 's' : ''} disponível{estagio.vagasDisponiveis > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="text-gray-300 text-sm mb-1">Horários: {estagio.horarios.join(', ')}</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <label className="text-gray-200 text-sm">Professor:</label>
                                        <input
                                            type="text"
                                            className="rounded px-2 py-1 bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-400 text-sm"
                                            placeholder="Nome do professor"
                                            value={estagioSelecionado === estagio.id ? professor : ''}
                                            onChange={e => estagioSelecionado === estagio.id && setProfessor(e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

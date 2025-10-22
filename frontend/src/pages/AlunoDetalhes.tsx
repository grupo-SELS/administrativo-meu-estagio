import { Header } from "../components/Header";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface Student {
    id: number;
    name: string;
    matricula: string;
    localEstagio: string;
    professorOrientador: string;
    faltasEstagio: number;
    statusMatricula: 'Ativo' | 'Inativo' | 'Bloqueado';
    polo: string;
    email?: string;
    telefone?: string;
    turma?: string;
    supervisor?: string;
}

const mockStudents: Student[] = [];

export default function AlunoDetalhes() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);

    useEffect(() => {
        if (id) {
            const s = mockStudents.find(x => x.id === parseInt(id));
            if (s) setStudent(s);
            else navigate('/alunos');
        }
    }, [id, navigate]);

    if (!student) {
        return (
            <>
                <Header />
                <section className="p-4 sm:ml-64 mt-20">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-300 text-lg">Carregando...</div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <Header />
            <section className="p-4 sm:ml-64 mt-20">
                <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-gray-100 text-3xl font-bold">Detalhes do Aluno</h1>
                            <p className="text-gray-400">Visualize e edite informações relacionadas ao aluno</p>
                        </div>
                        <Link to="/alunos" className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Voltar</Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-900 p-4 rounded-lg">
                            <h2 className="text-gray-200 font-semibold">{student.name}</h2>
                            <p className="text-gray-400 text-sm">Matrícula: {student.matricula}</p>
                            <p className="text-gray-400 text-sm">Polo: {student.polo}</p>
                        </div>

                        <div className="bg-gray-900 p-4 rounded-lg">
                            <h3 className="text-gray-200 font-semibold mb-2">Estágio</h3>
                            <p className="text-gray-400 text-sm">Local: {student.localEstagio}</p>
                            <p className="text-gray-400 text-sm">Supervisor: {student.supervisor}</p>
                            <p className="text-gray-400 text-sm">Professor Orientador: {student.professorOrientador}</p>
                        </div>

                        <div className="bg-gray-900 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <h4 className="text-gray-200 font-semibold">Faltas de Estágio</h4>
                                <p className="text-gray-400 text-sm">Total: <span className="font-medium text-white">{student.faltasEstagio}</span></p>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    to={`/alunos/editar/${student.id}`}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                                >
                                    Editar Faltas de Estágio
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

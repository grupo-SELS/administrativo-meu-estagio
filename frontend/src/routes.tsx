import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { LoginPage } from './pages/Login';
import NotFound from './pages/404';
import { Notes } from './pages/Notes';
import GerenciamentoAlunos from './pages/GerenciamentoAlunos';
import { NotesCreate } from './pages/NotesCreate';
import { NotesEdit } from './pages/NotesEdit';
import { PontosRegistrados } from './pages/Pontos';
import { ProfileAluno } from './pages/ProfileAluno';
import AlunoEdit from './pages/AlunoEdit';
import { ProtectedRoute } from './components/ProtectedRoute';
import AlunoDetalhes from './pages/AlunoDetalhes';
import { AlunoCreate } from './pages/AlunoCreate';
import { PontosFaltas } from './pages/PontosFaltas';
import AgendamentoEstagio from './pages/AgendamentoEstagio';
import GerenciamentoProfessores from './pages/GerenciamentoProfessores';
import { TermosCondicoes } from './pages/TermosCondicoes';
import { PoliticaPrivacidade } from './pages/PoliticaPrivacidade';
import { NovoAgendamento } from './pages/NovoAgendamento';
import { ProfessorCreate } from './pages/ProfessoresCreate';
import ProfessorEdit from './pages/ProfessorEdit';

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<LoginPage />} />
                <Route path="/Home" element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                } />
                <Route path="/comunicados" element={
                    <ProtectedRoute>
                        <Notes />
                    </ProtectedRoute>
                } />
                <Route path='/alunos' element={
                    <ProtectedRoute>
                        <GerenciamentoAlunos />
                    </ProtectedRoute>
                } />
                <Route path='/agendamento-estagio' element={
                    <ProtectedRoute>
                        <AgendamentoEstagio />
                    </ProtectedRoute>
                } />
                <Route path='/novo-agendamento' element={
                    <ProtectedRoute>
                        <NovoAgendamento />
                    </ProtectedRoute>
                } />
                <Route path='/comunicados/create' element={
                    <ProtectedRoute>
                        <NotesCreate />
                    </ProtectedRoute>
                } />
                <Route path='/comunicados/edit/:id' element={
                    <ProtectedRoute>
                        <NotesEdit />
                    </ProtectedRoute>
                } />
                <Route path='/pontos' element={
                    <ProtectedRoute>
                        <PontosRegistrados />
                    </ProtectedRoute>
                } />
                <Route path='/alunos/perfil' element={
                    <ProtectedRoute>
                        <ProfileAluno />
                    </ProtectedRoute>
                } />
                <Route path='/alunos/editar/:id' element={
                    <ProtectedRoute>
                        <AlunoEdit />
                    </ProtectedRoute>
                } />
                <Route path='/alunos/detalhes/:id' element={
                    <ProtectedRoute>
                        <AlunoDetalhes />
                    </ProtectedRoute>
                } />
                <Route path='/alunos/create' element={
                    <ProtectedRoute>
                        <AlunoCreate />
                    </ProtectedRoute>
                }
                />
                <Route path='/professores' element={
                    <ProtectedRoute>
                        <GerenciamentoProfessores />
                    </ProtectedRoute>
                }
                />
                <Route path='/professores/create' element={
                    <ProtectedRoute>
                        <ProfessorCreate />
                    </ProtectedRoute>
                }
                />
                <Route path='/professores/editar/:id' element={
                    <ProtectedRoute>
                        <ProfessorEdit />
                    </ProtectedRoute>
                } />
                <Route path='/pontos/correcao' element={
                    <ProtectedRoute>
                        <PontosFaltas />
                    </ProtectedRoute>
                } />
                <Route path='/termos-condicoes' element={
                    <ProtectedRoute>
                        <TermosCondicoes />
                    </ProtectedRoute>
                } />
                <Route path='/politica-privacidade' element={
                    <ProtectedRoute>
                        <PoliticaPrivacidade />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
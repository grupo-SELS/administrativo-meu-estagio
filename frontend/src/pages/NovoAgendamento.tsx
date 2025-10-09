import { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { ToolbarProps, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

import { Header } from '../components/Header';
import { apiService } from '../services/apiService';
import { AutocompleteInput } from '../components/AutocompleteInput';
import '../styles/NovoAgendamento.css';


const LOCALES = {
  'pt-BR': ptBR,
} as const;

const CALENDAR_MESSAGES = {
  today: 'Hoje',
  previous: 'Anterior',
  next: 'Próximo',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  showMore: (total: number) => `+${total} mais`,
} as const;

const CALENDAR_HEIGHT = '80vh';
const CALENDAR_HEIGHT_MOBILE = '60vh';


interface Evento {
  title: string;
  start: Date;
  end: Date;
  desc?: string;
  id?: string;
}

interface FormularioAgendamento {
  localEstagio: string;
  area: string;
  vagasDisponiveis: number;
  horarioInicio: string;
  horarioFim: string;
  aluno: string;
  professor: string;
  observacoes: string;
  repeticao: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'dia-semana';
  diaSemana?: number; 
}

interface OpcaoRepeticao {
  valor: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'dia-semana';
  label: string;
}

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  polo?: string;
  [key: string]: any;
}

interface Professor {
  id: string;
  nome: string;
  matricula: string;
  polo?: string;
}


const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: LOCALES,
});

const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps<Evento, object>) => {
  const getViewButtonClass = (currentView: string) => {
    const baseClass = 'px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 flex-1 sm:flex-none';
    const activeClass = 'bg-blue-600 text-white';
    const inactiveClass = 'bg-gray-700 hover:bg-gray-600 text-white';
    
    return `${baseClass} ${view === currentView ? activeClass : inactiveClass}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-900 rounded-lg p-3 sm:p-4 mb-4 border border-gray-700 gap-3 sm:gap-0">

      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('PREV')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200"
            title="Anterior"
            aria-label="Mês anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => onNavigate('TODAY')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200"
            aria-label="Ir para hoje"
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => onNavigate('NEXT')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200"
            title="Próximo"
            aria-label="Próximo mês"
          >
            →
          </button>
        </div>
        <h2 className="text-white font-bold text-base sm:text-lg sm:hidden">{label}</h2>
      </div>


      <h2 className="text-white font-bold text-lg hidden sm:block">{label}</h2>


      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto" role="group" aria-label="Tipo de visualização">
        <button
          type="button"
          onClick={() => onView('month')}
          className={getViewButtonClass('month')}
          aria-label="Visualização mensal"
          aria-pressed={view === 'month'}
        >
          Mês
        </button>
        <button
          type="button"
          onClick={() => onView('week')}
          className={getViewButtonClass('week')}
          aria-label="Visualização semanal"
          aria-pressed={view === 'week'}
        >
          Semana
        </button>
        <button
          type="button"
          onClick={() => onView('day')}
          className={getViewButtonClass('day')}
          aria-label="Visualização diária"
          aria-pressed={view === 'day'}
        >
          Dia
        </button>
      </div>
    </div>
  );
};


const INITIAL_FORM_STATE: FormularioAgendamento = {
  localEstagio: '',
  area: '',
  vagasDisponiveis: 1,
  horarioInicio: '',
  horarioFim: '',
  aluno: '',
  professor: '',
  observacoes: '',
  repeticao: 'nenhuma',
  diaSemana: undefined,
};

const OPCOES_REPETICAO: OpcaoRepeticao[] = [
  { valor: 'nenhuma', label: 'Não repetir' },
  { valor: 'diaria', label: 'Repetir diariamente' },
  { valor: 'semanal', label: 'Repetir semanalmente' },
  { valor: 'mensal', label: 'Repetir mensalmente' },
  { valor: 'dia-semana', label: 'Repetir em dia da semana específico' },
];

const DIAS_SEMANA = [
  { valor: 0, label: 'Domingo' },
  { valor: 1, label: 'Segunda-feira' },
  { valor: 2, label: 'Terça-feira' },
  { valor: 3, label: 'Quarta-feira' },
  { valor: 4, label: 'Quinta-feira' },
  { valor: 5, label: 'Sexta-feira' },
  { valor: 6, label: 'Sábado' },
];

export const NovoAgendamento = () => {

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [formulario, setFormulario] = useState<FormularioAgendamento>(INITIAL_FORM_STATE);
  

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunoInputValue, setAlunoInputValue] = useState('');
  const [professorInputValue, setProfessorInputValue] = useState('');
  const [showRepeticaoOptions, setShowRepeticaoOptions] = useState(false);



  useEffect(() => {
    async function fetchAlunos() {
      try {
        const response = await apiService.get<any>('/api/alunos');
        if (response && Array.isArray(response.alunos)) {
          setAlunos(response.alunos);
        }
      } catch (err) {
        console.error('Erro ao buscar alunos:', err);
      }
    }
    fetchAlunos();
    

    setProfessores([
      { id: 'p1', nome: 'Maria Oliveira', matricula: 'PROF1234', polo: 'Volta Redonda' },
      { id: 'p2', nome: 'João Souza', matricula: 'PROF5678', polo: 'Resende' },
      { id: 'p3', nome: 'Ana Lima', matricula: 'PROF9101', polo: 'Angra dos Reis' },
      { id: 'p4', nome: 'Carlos Silva', matricula: 'PROF2222', polo: 'Volta Redonda' },
      { id: 'p5', nome: 'Fernanda Costa', matricula: 'PROF3333', polo: 'Resende' },
    ]);
  }, []);


  useEffect(() => {
    async function fetchAgendamentos() {
      try {
        const response = await apiService.listarAgendamentos();
        if (response && Array.isArray(response.agendamentos)) {
          const eventosCarregados: Evento[] = response.agendamentos.map((agendamento: any) => {
            const [horaInicio, minutoInicio] = agendamento.horarioInicio.split(':').map(Number);
            const [horaFim, minutoFim] = agendamento.horarioFim.split(':').map(Number);
            const dataAgendamento = new Date(agendamento.data + 'T00:00:00');

            return {
              title: `${agendamento.area} - ${agendamento.localEstagio}`,
              start: new Date(
                dataAgendamento.getFullYear(),
                dataAgendamento.getMonth(),
                dataAgendamento.getDate(),
                horaInicio,
                minutoInicio
              ),
              end: new Date(
                dataAgendamento.getFullYear(),
                dataAgendamento.getMonth(),
                dataAgendamento.getDate(),
                horaFim,
                minutoFim
              ),
              desc: `Aluno: ${agendamento.aluno} | Professor: ${agendamento.professor}${
                agendamento.observacoes ? `\nObs: ${agendamento.observacoes}` : ''
              }`,
              id: agendamento.id
            };
          });
          setEventos(eventosCarregados);
        }
      } catch (err) {
        console.error('Erro ao buscar agendamentos:', err);
      }
    }
    fetchAgendamentos();
  }, []);

  const handleSelectSlot = useCallback(({ start }: SlotInfo) => {
    setDataSelecionada(start);
  }, []);

  const handleSelectEvent = useCallback((event: Evento) => {
    const mensagem = `Evento: ${event.title}\n${event.desc || ''}`;
    alert(mensagem);
  }, []);

  const handleInputChange = useCallback((campo: keyof FormularioAgendamento, valor: string | number) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const limparFormulario = useCallback(() => {
    setFormulario(INITIAL_FORM_STATE);
    setDataSelecionada(null);
    setAlunoInputValue('');
    setProfessorInputValue('');
  }, []);
  

  const handleSelectAluno = useCallback((aluno: Aluno) => {
    setAlunoInputValue(aluno.nome);
    setFormulario(prev => ({ ...prev, aluno: aluno.nome }));
  }, []);
  

  const handleSelectProfessor = useCallback((professor: Professor) => {
    setProfessorInputValue(professor.nome);
    setFormulario(prev => ({ ...prev, professor: professor.nome }));
  }, []);

  const gerarEventosRecorrentes = useCallback(
    (eventoBase: Evento, repeticao: string, diaSemana?: number): Evento[] => {
      const eventos: Evento[] = [eventoBase];
      const dataInicial = new Date(eventoBase.start);
      const numeroRepeticoes = 12; 

      for (let i = 1; i < numeroRepeticoes; i++) {
        const novaData = new Date(dataInicial);

        switch (repeticao) {
          case 'diaria':
            novaData.setDate(dataInicial.getDate() + i);
            break;
          case 'semanal':
            novaData.setDate(dataInicial.getDate() + (i * 7));
            break;
          case 'mensal':
            novaData.setMonth(dataInicial.getMonth() + i);
            break;
          case 'dia-semana':
            if (diaSemana !== undefined) {
              const diasAte = (diaSemana - dataInicial.getDay() + 7) % 7 || 7;
              novaData.setDate(dataInicial.getDate() + diasAte + ((i - 1) * 7));
            }
            break;
        }

        const diferencaTempo = eventoBase.end.getTime() - eventoBase.start.getTime();
        const novoFim = new Date(novaData.getTime() + diferencaTempo);

        eventos.push({
          ...eventoBase,
          start: novaData,
          end: novoFim,
        });
      }

      return eventos;
    },
    []
  );

  const handleSubmitAgendamento = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const { localEstagio, area, horarioInicio, horarioFim, aluno, professor, observacoes, vagasDisponiveis } = formulario;


      if (!dataSelecionada) {
        alert('Por favor, selecione uma data no calendário.');
        return;
      }

      if (!localEstagio || !horarioInicio || !horarioFim) {
        alert('Preencha os campos obrigatórios: Local de Estágio, Horário Início e Horário Fim.');
        return;
      }

      if (!vagasDisponiveis || vagasDisponiveis < 1) {
        alert('A quantidade de vagas deve ser no mínimo 1.');
        return;
      }

      const [horaInicio, minutoInicio] = horarioInicio.split(':').map(Number);
      const [horaFim, minutoFim] = horarioFim.split(':').map(Number);

      const novoEvento: Evento = {
        title: `${area || 'Estágio'} - ${localEstagio}`,
        start: new Date(
          dataSelecionada.getFullYear(),
          dataSelecionada.getMonth(),
          dataSelecionada.getDate(),
          horaInicio,
          minutoInicio
        ),
        end: new Date(
          dataSelecionada.getFullYear(),
          dataSelecionada.getMonth(),
          dataSelecionada.getDate(),
          horaFim,
          minutoFim
        ),
        desc: `Aluno: ${aluno || 'Não atribuído'} | Professor: ${professor || 'Não atribuído'}${
          observacoes ? `\nObs: ${observacoes}` : ''
        }`,
      };


      const eventosParaAdicionar = formulario.repeticao !== 'nenhuma'
        ? gerarEventosRecorrentes(novoEvento, formulario.repeticao, formulario.diaSemana)
        : [novoEvento];

      try {
        for (const evento of eventosParaAdicionar) {
          const dataFormatada = evento.start.toISOString().split('T')[0];
          
          await apiService.criarAgendamento({
            localEstagio,
            area: area || 'Estágio',
            vagasDisponiveis: formulario.vagasDisponiveis,
            horarioInicio,
            horarioFim,
            aluno,
            professor,
            observacoes,
            data: dataFormatada,
            status: 'confirmado'
          });
        }

        setEventos((prev) => [...prev, ...eventosParaAdicionar]);
        
        limparFormulario();

        const mensagemRepeticao = formulario.repeticao !== 'nenhuma'
          ? ` (${eventosParaAdicionar.length} ocorrências criadas)`
          : '';
        alert(`Agendamento criado com sucesso!${mensagemRepeticao}`);
      } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        alert('Erro ao criar agendamento. Tente novamente.');
      }
    },
    [formulario, dataSelecionada, limparFormulario, gerarEventosRecorrentes]
  );


  const calendarComponents = useMemo(() => ({ toolbar: CustomToolbar }), []);
  const calendarStyle = useMemo(() => ({ height: '100%',  }), []);
  const formContainerStyle = useMemo(
    () => ({ 
      height: isMobile ? 'auto' : CALENDAR_HEIGHT, 
      maxHeight: isMobile ? '70vh' : CALENDAR_HEIGHT,
      overflowY: 'auto' as const,
      overflowX: 'visible' as const
    }),
    [isMobile]
  );

  return (
    <>
      <Header />
      <main className="bg-gray-900 min-h-screen pt-25 pl-0 pb-8 md:pl-70 lg:pl-80">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-6">Novo Agendamento</h1>

          <div className="flex flex-col lg:flex-row gap-6">

            <section className="lg:w-3/5 w-full" aria-label="Calendário de agendamentos">
              <div className="calendar-container calendar-dark p-2 sm:p-4 md:p-6" style={{ height: isMobile ? CALENDAR_HEIGHT_MOBILE : CALENDAR_HEIGHT }}>
                <Calendar
                  localizer={localizer}
                  events={eventos}
                  startAccessor="start"
                  endAccessor="end"
                  style={calendarStyle}
                  selectable
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  culture="pt-BR"
                  components={calendarComponents}
                  messages={CALENDAR_MESSAGES}
                />
              </div>
            </section>


            <section className="lg:w-2/5 w-full" aria-label="Formulário de agendamento">
              <div
                className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6 scrollbar-styled relative"
                style={formContainerStyle}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Detalhes do Agendamento</h2>

                {dataSelecionada && (
                  <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg" role="status">
                    <p className="text-blue-400 text-sm font-semibold">
                      Data selecionada: {format(dataSelecionada, 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmitAgendamento} className="space-y-4" noValidate>

                  <div>
                    <label htmlFor="localEstagio" className="block text-gray-300 text-sm font-semibold mb-2">
                      Local de Estágio *
                    </label>
                    <input
                      id="localEstagio"
                      type="text"
                      value={formulario.localEstagio}
                      onChange={(e) => handleInputChange('localEstagio', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Ex: Hospital Municipal"
                      required
                      aria-required="true"
                    />
                  </div>


                  <div>
                    <label htmlFor="area" className="block text-gray-300 text-sm font-semibold mb-2">
                      Área
                    </label>
                    <input
                      id="area"
                      type="text"
                      value={formulario.area}
                      onChange={(e) => handleInputChange('area', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Ex: UTI, Maternidade"
                    />
                  </div>

                  {/* Campo de Vagas Disponíveis */}
                  <div>
                    <label htmlFor="vagasDisponiveis" className="block text-gray-300 text-sm font-semibold mb-2">
                      Quantidade de Vagas Disponíveis *
                    </label>
                    <input
                      id="vagasDisponiveis"
                      type="number"
                      min="1"
                      max="100"
                      value={formulario.vagasDisponiveis}
                      onChange={(e) => handleInputChange('vagasDisponiveis', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Ex: 5"
                      required
                      aria-required="true"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Número de alunos que podem ser alocados neste estágio
                    </p>
                  </div>


                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="horarioInicio" className="block text-gray-300 text-sm font-semibold mb-2">
                        Horário Início *
                      </label>
                      <input
                        id="horarioInicio"
                        type="time"
                        value={formulario.horarioInicio}
                        onChange={(e) => handleInputChange('horarioInicio', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="horarioFim" className="block text-gray-300 text-sm font-semibold mb-2">
                        Horário Fim *
                      </label>
                      <input
                        id="horarioFim"
                        type="time"
                        value={formulario.horarioFim}
                        onChange={(e) => handleInputChange('horarioFim', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>


                  <AutocompleteInput
                    id="aluno"
                    label="Aluno"
                    placeholder="Digite o nome ou matrícula do aluno..."
                    value={alunoInputValue}
                    options={alunos}
                    onSelect={handleSelectAluno}
                    onChange={(value) => {
                      setAlunoInputValue(value);
                      handleInputChange('aluno', value);
                    }}
                  />


                  <AutocompleteInput
                    id="professor"
                    label="Professor Orientador"
                    placeholder="Digite o nome ou matrícula do professor..."
                    value={professorInputValue}
                    options={professores}
                    onSelect={handleSelectProfessor}
                    onChange={(value) => {
                      setProfessorInputValue(value);
                      handleInputChange('professor', value);
                    }}
                  />


                  <div>
                    <label htmlFor="observacoes" className="block text-gray-300 text-sm font-semibold mb-2">
                      Observações
                    </label>
                    <textarea
                      id="observacoes"
                      value={formulario.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>

                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-gray-300 text-sm font-semibold">
                        Repetição do Agendamento
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowRepeticaoOptions(!showRepeticaoOptions)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {showRepeticaoOptions ? 'Ocultar opções' : 'Configurar repetição'}
                      </button>
                    </div>

                    {showRepeticaoOptions && (
                      <div className="space-y-3 bg-gray-700/50 p-4 rounded-lg">
                        <div>
                          <label htmlFor="repeticao" className="block text-gray-400 text-xs font-medium mb-2">
                            Tipo de Repetição
                          </label>
                          <select
                            id="repeticao"
                            value={formulario.repeticao}
                            onChange={(e) => handleInputChange('repeticao', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                          >
                            {OPCOES_REPETICAO.map(opcao => (
                              <option key={opcao.valor} value={opcao.valor}>
                                {opcao.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {formulario.repeticao === 'dia-semana' && (
                          <div>
                            <label htmlFor="diaSemana" className="block text-gray-400 text-xs font-medium mb-2">
                              Dia da Semana
                            </label>
                            <select
                              id="diaSemana"
                              value={formulario.diaSemana ?? ''}
                              onChange={(e) => handleInputChange('diaSemana', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                            >
                              <option value="">Selecione o dia</option>
                              {DIAS_SEMANA.map(dia => (
                                <option key={dia.valor} value={dia.valor}>
                                  {dia.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {formulario.repeticao !== 'nenhuma' && (
                          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-blue-300 text-xs">
                                Serão criadas 12 ocorrências deste agendamento seguindo o padrão de repetição selecionado.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>


                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                      aria-label="Criar agendamento"
                    >
                      Criar Agendamento
                    </button>
                    <button
                      type="button"
                      onClick={limparFormulario}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                      aria-label="Limpar formulário"
                    >
                      Limpar
                    </button>
                  </div>


                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

import AlertCard from '../AlertCard';

const DocumentClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-600 dark:text-blue-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserCloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-red-600 dark:text-red-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632zM21 21l-6-6m0 0l-6-6m6 6l-6 6m6-6l6-6" />
    </svg>
);


const ClockAlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-yellow-600 dark:text-yellow-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-green-600 dark:text-green-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" />
  </svg>
);

/**
 * Props:
 * - alertsData: Um objeto com os valores para cada alerta.
 */
type AlertsSectionProps = {
  alertsData?: {
    pendingRequests?: number;
    absencesToday?: number;
    nearingHourLimit?: number;
    expiringContracts?: number;
  };
};

const AlertsSection: React.FC<AlertsSectionProps> = ({ alertsData }) => {
  const defaultData = {
    pendingRequests: 0,
    absencesToday: 0,
    nearingHourLimit: 0,
    expiringContracts: 0,
  };
  
  const data = { ...defaultData, ...alertsData };

  return (
    <section className="p-4 sm:p-6 lg:px-8 bg-gray-100 dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        <AlertCard
          title="Solicitações Pendentes"
          value={data.pendingRequests}
          icon={<DocumentClockIcon />}
          iconBgColor="bg-blue-100 dark:bg-blue-900/50"
          ctaText="Analisar solicitações"
          href="/pontos/correcao"
        />

        <AlertCard
          title="Ausências Hoje"
          value={data.absencesToday}
          icon={<UserCloseIcon />}
          iconBgColor="bg-red-100 dark:bg-red-900/50"
          ctaText="Ver ausentes"
          href="/pontos/correcao"
        />

        <AlertCard
          title="Próximos do Limite de Horas"
          value={data.nearingHourLimit}
          icon={<ClockAlertIcon />}
          iconBgColor="bg-yellow-100 dark:bg-yellow-900/50"
          ctaText="Verificar estagiários"
          href="/pontos/correcao"
        />

        <AlertCard
          title="Contratos a Expirar"
          value={data.expiringContracts}
          icon={<CalendarIcon />}
          iconBgColor="bg-green-100 dark:bg-green-900/50"
          ctaText="Gerenciar contratos"
          href="/"
        />

      </div>
    </section>
  );
};

export default AlertsSection;
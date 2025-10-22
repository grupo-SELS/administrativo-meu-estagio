interface AlertCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  ctaText: string;
  href: string;
  iconBgColor: string;
}

const AlertCard = ({ icon, title, value, ctaText, href, iconBgColor }: AlertCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white p-5 shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800">
      <div className="flex items-center">
        <div className={`rounded-md p-3 ${iconBgColor}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <a href={href} className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
          {ctaText}
        </a>
      </div>
    </div>
  );
};

export default AlertCard;
import { useEffect } from 'react';
import { IoCheckmarkCircle, IoCloseCircle, IoWarning, IoInformationCircle, IoClose } from 'react-icons/io5';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    id: string;
    title: string;
    message?: string;
    type: ToastType;
    onClose: (id: string) => void;
    duration?: number;
}

export function Toast({ id, title, message, type, onClose, duration = 5000 }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose, id]);

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600 border-green-500';
            case 'error':
                return 'bg-red-600 border-red-500';
            case 'warning':
                return 'bg-yellow-600 border-yellow-500';
            case 'info':
                return 'bg-blue-600 border-blue-500';
            default:
                return 'bg-gray-600 border-gray-500';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <IoCheckmarkCircle className="w-6 h-6 text-white" />;
            case 'error':
                return <IoCloseCircle className="w-6 h-6 text-white" />;
            case 'warning':
                return <IoWarning className="w-6 h-6 text-white" />;
            case 'info':
                return <IoInformationCircle className="w-6 h-6 text-white" />;
        }
    };

    return (
        <div
            className={`${getToastStyles()} border-l-4 rounded-lg shadow-2xl p-4 mb-3 flex items-center gap-3 min-w-[300px] max-w-[500px] animate-slide-in-right`}
            role="alert"
        >
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="flex-1">
                <p className="text-white text-sm font-bold">{title}</p>
                {message && <p className="text-white text-xs mt-1">{message}</p>}
            </div>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
                aria-label="Fechar"
            >
                <IoClose className="w-5 h-5" />
            </button>
        </div>
    );
}

import { IoWarning } from 'react-icons/io5';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    type = 'warning'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'text-red-500',
                    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                };
            case 'warning':
                return {
                    icon: 'text-yellow-500',
                    button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                };
            case 'info':
                return {
                    icon: 'text-blue-500',
                    button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-700 animate-scale-in">
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 ${styles.icon}`}>
                        <IoWarning className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-300 mb-6">
                            {message}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-4 py-2 ${styles.button} text-white rounded-lg transition-colors focus:outline-none focus:ring-2`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

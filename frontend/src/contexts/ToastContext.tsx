import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Toast } from '../components/Toast';
import type { ToastType } from '../components/Toast';

interface ToastMessage {
    id: string;
    title: string;
    message?: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (title: string, type: ToastType, message?: string) => void;
    showSuccess: (title: string, message?: string) => void;
    showError: (title: string, message?: string) => void;
    showWarning: (title: string, message?: string) => void;
    showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((title: string, type: ToastType, message?: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, title, message, type }]);
    }, []);

    const showSuccess = useCallback((title: string, message?: string) => {
        showToast(title, 'success', message);
    }, [showToast]);

    const showError = useCallback((title: string, message?: string) => {
        showToast(title, 'error', message);
    }, [showToast]);

    const showWarning = useCallback((title: string, message?: string) => {
        showToast(title, 'warning', message);
    }, [showToast]);

    const showInfo = useCallback((title: string, message?: string) => {
        showToast(title, 'info', message);
    }, [showToast]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
            {children}
            <div className="fixed top-4 right-4 z-[100000] flex flex-col items-end">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        id={toast.id}
                        title={toast.title}
                        message={toast.message}
                        type={toast.type}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

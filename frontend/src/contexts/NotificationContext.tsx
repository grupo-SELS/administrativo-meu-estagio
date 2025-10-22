import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Toast } from '../components/Toast';
import type { ToastType } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ConfirmData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface NotificationContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  showConfirm: (config: ConfirmData) => Promise<boolean>;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    config: ConfirmData;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showToast = (type: ToastType, title: string, message?: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastData = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showConfirm = (config: ConfirmData): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        config,
        resolve
      });
    });
  };

  const handleConfirm = () => {
    if (confirmModal) {
      confirmModal.resolve(true);
      setConfirmModal(null);
    }
  };

  const handleCancel = () => {
    if (confirmModal) {
      confirmModal.resolve(false);
      setConfirmModal(null);
    }
  };

  const success = (title: string, message?: string) => showToast('success', title, message);
  const error = (title: string, message?: string) => showToast('error', title, message);
  const warning = (title: string, message?: string) => showToast('warning', title, message);
  const info = (title: string, message?: string) => showToast('info', title, message);

  const value: NotificationContextType = {
    showToast,
    showConfirm,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={removeToast}
          />
        ))}
      </div>

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.config.title}
          message={confirmModal.config.message}
          confirmText={confirmModal.config.confirmText}
          cancelText={confirmModal.config.cancelText}
          type={confirmModal.config.type}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </NotificationContext.Provider>
  );
};
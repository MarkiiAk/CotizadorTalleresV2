import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning';
  title: string;
  message?: string;
  errors?: string[];
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  errors = [],
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900',
          border: 'border-green-200 dark:border-green-700',
          icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
          titleColor: 'text-green-800 dark:text-green-200',
          messageColor: 'text-green-600 dark:text-green-300'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900',
          border: 'border-red-200 dark:border-red-700',
          icon: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
          titleColor: 'text-red-800 dark:text-red-200',
          messageColor: 'text-red-600 dark:text-red-300'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900',
          border: 'border-yellow-200 dark:border-yellow-700',
          icon: <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
          titleColor: 'text-yellow-800 dark:text-yellow-200',
          messageColor: 'text-yellow-600 dark:text-yellow-300'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900',
          border: 'border-gray-200 dark:border-gray-700',
          icon: <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
          titleColor: 'text-gray-800 dark:text-gray-200',
          messageColor: 'text-gray-600 dark:text-gray-300'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`${styles.bg} ${styles.border} border-l-4 rounded-lg p-4 mb-3 shadow-lg transform transition-all duration-300 ease-in-out animate-slide-in-right`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-semibold ${styles.titleColor}`}>
            {title}
          </h4>
          {message && (
            <p className={`mt-1 text-sm ${styles.messageColor}`}>
              {message}
            </p>
          )}
          {errors.length > 0 && (
            <ul className={`mt-2 text-sm ${styles.messageColor} space-y-1`}>
              {errors.map((error, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-current rounded-full mr-2 flex-shrink-0"></span>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onClose(id)}
            className={`inline-flex rounded-md p-1.5 ${styles.messageColor} hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current transition-colors`}
          >
            <span className="sr-only">Cerrar</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook para manejar toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string, errors?: string[]) => {
    addToast({ type: 'error', title, message, errors, duration: 8000 });
  };

  const showWarning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  const clearAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    showSuccess,
    showError,
    showWarning,
    clearAll
  };
};

// Componente contenedor de toasts
export const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm space-y-3">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
} from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast, { ToastMessage, ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // ⚡ Bolt: Memoize the context value to prevent unnecessary re-renders
  // of consuming components when the provider's parent re-renders
  const value = useMemo(
    () => ({ showToast }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end pointer-events-none">
        {/* Helper container to ensure toasts are clickable but container passes through clicks */}
        <div className="pointer-events-auto">
          <AnimatePresence>
            {toasts.map((toast) => (
              <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-success-500 bg-success-500/10',
  error: 'border-error-500 bg-error-500/10',
  info: 'border-primary-500 bg-primary-500/10',
  warning: 'border-warning-500 bg-warning-500/10',
};

const iconColors = {
  success: 'text-success-500',
  error: 'text-error-500',
  info: 'text-primary-500',
  warning: 'text-warning-500',
};

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const addNotification = React.useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    setNotifications((prev) => [...prev, newNotification]);

    // Auto remove after duration
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const Icon = icons[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`p-4 rounded-xl border ${colors[notification.type]} backdrop-blur-md shadow-xl`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 ${iconColors[notification.type]} mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
          {notification.message && (
            <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function NotificationBell({ className }: { className?: string }) {
  const { notifications, addNotification } = useNotifications();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Уведомления"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-error-500 text-white text-xs flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-800/95 backdrop-blur-md border border-white/10 shadow-xl z-50 p-4">
            <h3 className="font-semibold mb-4">Уведомления</h3>
            {notifications.length === 0 ? (
              <p className="text-slate-400 text-sm">Нет уведомлений</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    <p className="text-sm font-medium">{notification.title}</p>
                    {notification.message && (
                      <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulated - in real app, fetch from API
  // This should be called whenever notifications are loaded or updated
  const updateUnreadCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, updateUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

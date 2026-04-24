'use client'
import { createContext, useState, useContext, useMemo, useCallback, ReactNode } from 'react';

// Define the shape of the user state
interface UserContextType {
  user: { role: string } | null;
  login: (role: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use the UserContext
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Context provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ role: string } | null>(null);

  const login = useCallback((role: string) => {
    setUser({ role });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

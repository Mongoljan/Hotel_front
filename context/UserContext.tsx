'use client'
import { createContext, useState, useContext, ReactNode } from 'react';

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

  const login = (role: string) => {
    setUser({ role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'admin' | 'customer' | null;

interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializamos leyendo el localStorage para mantener la sesión activa
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('orven_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, role: UserRole) => {
    const newUser = { email, role };
    setUser(newUser);
    localStorage.setItem('orven_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('orven_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Persona } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  currentRole: UserRole;
  personas: Persona[];
  isLoading: boolean;
  switchPersona: (role: UserRole) => void;
  hasPermission: (permissionCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(
    (localStorage.getItem('persona_role') as UserRole) || 'ADMIN'
  );
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPersonas = async () => {
    try {
      const res = await api.get('/auth/personas');
      setPersonas(res.data);
    } catch (err) {
      console.error('Failed to load demo personas', err);
    }
  };

  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
    fetchCurrentUser();
  }, [currentRole]);

  const switchPersona = (role: UserRole) => {
    localStorage.setItem('persona_role', role);
    setCurrentRole(role);
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (currentRole === 'ADMIN') return true;

    for (const role of user.roles) {
      if (role.permissions.some((p) => p.code === permissionCode)) {
        return true;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        personas,
        isLoading,
        switchPersona,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

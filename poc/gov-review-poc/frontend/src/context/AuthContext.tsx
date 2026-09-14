import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, LoginResponse } from '../types';

interface AuthContextType {
  currentUser: User | null;
  roleCode: 'PM' | 'TL' | null;
  assignedProjectId: number | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  roleCode: null,
  assignedProjectId: null,
  token: null,
  login: async () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roleCode, setRoleCode] = useState<'PM' | 'TL' | null>(null);
  const [assignedProjectId, setAssignedProjectId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('gov_poc_token');
    const savedUserId = localStorage.getItem('gov_poc_user_id');
    const savedRole = localStorage.getItem('gov_poc_role') as 'PM' | 'TL' | null;
    const savedProjId = localStorage.getItem('gov_poc_proj_id');

    if (savedToken && savedUserId && savedRole) {
      setToken(savedToken);
      setRoleCode(savedRole);
      setAssignedProjectId(savedProjId ? Number(savedProjId) : 1);
      
      // Fetch me
      api.get<User>('/auth/me')
        .then((res) => setCurrentUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.post<LoginResponse>('/auth/login', { username, password });
    const { user, role_code, assigned_project_id, token: resToken } = res.data;

    setCurrentUser(user);
    setRoleCode(role_code);
    setAssignedProjectId(assigned_project_id || 1);
    setToken(resToken);

    localStorage.setItem('gov_poc_token', resToken);
    localStorage.setItem('gov_poc_user_id', String(user.user_id));
    localStorage.setItem('gov_poc_role', role_code);
    localStorage.setItem('gov_poc_proj_id', String(assigned_project_id || 1));
  };

  const logout = () => {
    setCurrentUser(null);
    setRoleCode(null);
    setAssignedProjectId(null);
    setToken(null);
    localStorage.removeItem('gov_poc_token');
    localStorage.removeItem('gov_poc_user_id');
    localStorage.removeItem('gov_poc_role');
    localStorage.removeItem('gov_poc_proj_id');
  };

  return (
    <AuthContext.Provider value={{ currentUser, roleCode, assignedProjectId, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

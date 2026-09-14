import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  demoUsers: User[];
  switchUser: (user: User) => void;
  loading: boolean;
  refetchUsers: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  demoUsers: [],
  switchUser: () => {},
  loading: true,
  refetchUsers: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get<User[]>('/auth/demo-users');
      setDemoUsers(res.data);

      const savedUserId = localStorage.getItem('demo_user_id');
      if (savedUserId) {
        const found = res.data.find((u) => u.user_id === savedUserId);
        if (found) {
          setCurrentUser(found);
        } else if (res.data.length > 0) {
          setCurrentUser(res.data[0]);
          localStorage.setItem('demo_user_id', res.data[0].user_id);
        }
      } else if (res.data.length > 0) {
        // Default to Jordan Park (PM) or Admin
        const defaultUser = res.data.find(u => u.username === 'jordan_park') || res.data[0];
        setCurrentUser(defaultUser);
        localStorage.setItem('demo_user_id', defaultUser.user_id);
      }
    } catch (err) {
      console.error('Failed to load demo users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('demo_user_id', user.user_id);
  };

  return (
    <AuthContext.Provider value={{ currentUser, demoUsers, switchUser, loading, refetchUsers: fetchUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

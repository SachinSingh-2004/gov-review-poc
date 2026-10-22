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

const DEFAULT_DEMO_PERSONAS: Persona[] = [
  {
    role: 'ADMIN',
    description: 'Full System Administrator',
    username: 'admin',
    full_name: 'System Administrator',
    email: 'admin@rdgov.local',
    department: 'Governance & Quality',
  },
  {
    role: 'AUDITOR',
    description: 'Conducts audits and logs findings',
    username: 'auditor_jane',
    full_name: 'Jane Auditor',
    email: 'jane.auditor@rdgov.local',
    department: 'Independent Audit',
  },
  {
    role: 'AUDIT_MANAGER',
    description: 'Approves audits, assigns actions',
    username: 'audit_mgr_mark',
    full_name: 'Mark Manager',
    email: 'mark.mgr@rdgov.local',
    department: 'Audit Operations',
  },
  {
    role: 'PROJECT_OWNER',
    description: 'Manages projects and mitigations',
    username: 'proj_owner_sarah',
    full_name: 'Sarah Project Lead',
    email: 'sarah.lead@rdgov.local',
    department: 'Advanced Robotics R&D',
  },
  {
    role: 'ACTION_OWNER',
    description: 'Executes corrective actions',
    username: 'action_owner_alex',
    full_name: 'Alex Engineer',
    email: 'alex.eng@rdgov.local',
    department: 'Software Engineering',
  },
  {
    role: 'EXECUTIVE',
    description: 'Executive review & compliance',
    username: 'executive_david',
    full_name: 'David VP',
    email: 'david.vp@rdgov.local',
    department: 'Executive Board',
  },
  {
    role: 'VIEWER',
    description: 'Read-only access',
    username: 'viewer_sam',
    full_name: 'Sam Analyst',
    email: 'sam.analyst@rdgov.local',
    department: 'Compliance',
  },
];

const createFallbackUser = (role: UserRole): User => {
  const p = DEFAULT_DEMO_PERSONAS.find((item) => item.role === role) || DEFAULT_DEMO_PERSONAS[0];
  return {
    id: `user-${p.role.toLowerCase()}`,
    username: p.username,
    full_name: p.full_name,
    email: p.email,
    department: p.department,
    is_active: true,
    created_at: new Date().toISOString(),
    roles: [
      {
        id: `role-${p.role.toLowerCase()}`,
        name: p.role,
        description: p.description,
        permissions: [{ id: 'p-all', code: 'ALL', description: 'All Permissions' }],
      },
    ],
  };
};

const normalizeUser = (data: any, fallbackRole: UserRole): User => {
  if (!data || typeof data !== 'object') {
    return createFallbackUser(fallbackRole);
  }
  const p = DEFAULT_DEMO_PERSONAS.find((item) => item.role === fallbackRole) || DEFAULT_DEMO_PERSONAS[0];
  const fullName = data.full_name || data.display_name || data.name || p.full_name;
  const username = data.username || p.username;
  const email = data.email || p.email;
  const department = data.department || p.department;

  let roles: any[] = [];
  if (Array.isArray(data.roles) && data.roles.length > 0) {
    roles = data.roles.map((r: any) => ({
      id: String(r?.id || r?.role_id || '1'),
      name: (r?.name || r?.role_code || fallbackRole) as UserRole,
      description: r?.description || r?.role_name || p.description,
      permissions: Array.isArray(r?.permissions)
        ? r.permissions
        : [{ id: 'p-all', code: 'ALL', description: 'All Permissions' }],
    }));
  } else {
    roles = [
      {
        id: `role-${fallbackRole.toLowerCase()}`,
        name: fallbackRole,
        description: p.description,
        permissions: [{ id: 'p-all', code: 'ALL', description: 'All Permissions' }],
      },
    ];
  }

  return {
    id: String(data.id || data.user_id || `user-${fallbackRole.toLowerCase()}`),
    username,
    full_name: fullName,
    email,
    department,
    is_active: data.is_active ?? true,
    roles,
    created_at: data.created_at || new Date().toISOString(),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(
    (localStorage.getItem('persona_role') as UserRole) || 'ADMIN'
  );
  const [user, setUser] = useState<User | null>(() => createFallbackUser(currentRole));
  const [personas, setPersonas] = useState<Persona[]>(DEFAULT_DEMO_PERSONAS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPersonas = async () => {
    try {
      const res = await api.get('/auth/personas');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setPersonas(res.data);
      }
    } catch {
      // Keep default personas on network error
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        setUser(normalizeUser(res.data, currentRole));
      } else {
        setUser(createFallbackUser(currentRole));
      }
    } catch {
      setUser(createFallbackUser(currentRole));
    }
  };

  useEffect(() => {
    fetchPersonas();
    fetchCurrentUser();
  }, [currentRole]);

  const switchPersona = (role: UserRole) => {
    localStorage.setItem('persona_role', role);
    setCurrentRole(role);
    setUser(createFallbackUser(role));
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (currentRole === 'ADMIN') return true;
    if (!Array.isArray(user.roles)) return true;

    for (const role of user.roles) {
      if (Array.isArray(role?.permissions) && role.permissions.some((p) => p && p.code === permissionCode)) {
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

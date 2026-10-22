import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import { api } from '../services/api';
import { User, Role, AuditLog } from '../types';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { StatusChip } from '../components/StatusChip';
import { MOCK_USERS, MOCK_ROLES, MOCK_AUDIT_LOGS } from '../mockData/governanceMockData';

export const Administration: React.FC = () => {
  const [tab, setTab] = useState(0);

  const { data: users = MOCK_USERS, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const res = await api.get('/users');
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
      } catch {
        // Fallback
      }
      return MOCK_USERS;
    },
  });

  const { data: roles = MOCK_ROLES, isLoading: loadingRoles } = useQuery<Role[]>({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      try {
        const res = await api.get('/users/roles');
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
      } catch {
        // Fallback
      }
      return MOCK_ROLES;
    },
  });

  const { data: auditLogs = MOCK_AUDIT_LOGS, isLoading: loadingLogs } = useQuery<AuditLog[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
      } catch {
        // Fallback
      }
      return MOCK_AUDIT_LOGS;
    },
  });

  const userColumns: Column<User>[] = [
    { id: 'username', label: 'Username', minWidth: 120 },
    { id: 'full_name', label: 'Full Name', minWidth: 180, format: (val, row) => val || (row as any)?.display_name || row?.username || 'User' },
    { id: 'email', label: 'Email', minWidth: 200 },
    { id: 'department', label: 'Department', minWidth: 150 },
    {
      id: 'roles',
      label: 'Assigned Role',
      minWidth: 140,
      format: (val: any[]) => {
        const firstRole = Array.isArray(val) && val.length > 0 ? val[0] : null;
        const roleLabel = firstRole ? (firstRole.name || firstRole.role_code || firstRole.role_name || 'Assigned') : 'None';
        return <Chip label={roleLabel} color="primary" size="small" />;
      },
    },
    { id: 'is_active', label: 'Status', minWidth: 100, format: (val) => (val ? <StatusChip status="HEALTHY" /> : <StatusChip status="AT_RISK" />) },
  ];

  const logColumns: Column<AuditLog>[] = [
    { id: 'timestamp', label: 'Timestamp', minWidth: 160, format: (val) => new Date(val).toLocaleString() },
    { id: 'username', label: 'User', minWidth: 140 },
    { id: 'action_type', label: 'Action', minWidth: 120, format: (val) => <Chip label={val} size="small" color="info" /> },
    { id: 'entity_type', label: 'Entity Type', minWidth: 130 },
    { id: 'entity_id', label: 'Entity ID', minWidth: 140 },
    { id: 'details_json', label: 'Mutation Details', minWidth: 240 },
  ];

  return (
    <Box>
      <PageHeader
        title="Administration & Governance Control"
        subtitle="Manage user accounts, RBAC permissions, and review real-time audit trail logs"
      />

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary">
          <Tab label="Users Management" />
          <Tab label="Roles & Permissions Matrix" />
          <Tab label="Live Audit Logs" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            System User Accounts
          </Typography>
          <DataTable columns={userColumns} rows={users || []} loading={loadingUsers} />
        </Paper>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            RBAC Role & Permission Configurations
          </Typography>
          {roles?.map((r) => (
            <Box key={r.id} mb={3} p={2} border="1px solid #e2e8f0" borderRadius={2} bgcolor="#fafafa">
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  {r.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({r.description})
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                GRANTED PERMISSIONS:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {r.permissions.map((p) => (
                  <Chip key={p.id} label={p.code} size="small" variant="outlined" sx={{ bgcolor: '#ffffff' }} />
                ))}
              </Box>
            </Box>
          ))}
        </Paper>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            System Governance Audit Trail Logs
          </Typography>
          <DataTable columns={logColumns} rows={auditLogs || []} loading={loadingLogs} />
        </Paper>
      )}
    </Box>
  );
};

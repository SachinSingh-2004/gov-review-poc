import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { EntityModelInspector } from '../components/EntityModelInspector';
import api from '../api/client';
import { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get<AuditLog[]>('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box p={3}>
      <EntityModelInspector
        entityName="AUDIT LOG (IMMUTABLE AUDIT TRAIL)"
        tableName="audit_logs"
        primaryKey="log_id"
        foreignKeys={['user_id']}
        relationships={[
          'USER 1:N AUDIT_LOG',
          'Records all state-changing mutations (CREATE, UPDATE, STATUS_CHANGE, APPROVE, REJECT)',
          'Records SECURITY DENIED authorization attempts'
        ]}
        roleAccess="ADMIN, AUDIT_MANAGER, EXECUTIVE (Read-Only Authorized Scope)"
        relatedPage="System Audit Logs"
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon sx={{ color: '#38bdf8' }} /> Enterprise Audit Trail Logs
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            System activity log capturing mutations, state transitions, and authorization violations.
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
        <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#0f172a' }}>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Timestamp</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Action Type</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Entity Type</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Entity ID</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Operation Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((l) => (
              <TableRow key={l.log_id} hover sx={{ bgcolor: l.action_type === 'PERMISSION_DENIED' || l.action_type === 'DENIED' ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(l.timestamp).toLocaleString()}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{l.user?.full_name || l.user_id}</TableCell>
                <TableCell>
                  <Chip
                    label={l.action_type}
                    size="small"
                    color={
                      l.action_type === 'PERMISSION_DENIED' || l.action_type === 'DENIED' ? 'error' :
                      l.action_type === 'CREATE' ? 'success' :
                      l.action_type === 'COMPLETE_REVIEW' ? 'warning' : 'info'
                    }
                    sx={{ fontWeight: 700 }}
                  />
                </TableCell>
                <TableCell>{l.entity_type}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{l.entity_id}</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace' }}>{l.details_json}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

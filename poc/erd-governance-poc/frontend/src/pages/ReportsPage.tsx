import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import { StatusChip } from '../components/StatusChip';
import { EntityModelInspector } from '../components/EntityModelInspector';
import api from '../api/client';

export const ReportsPage: React.FC = () => {
  const [auditSummary, setAuditSummary] = useState<any[]>([]);
  const [overdueActions, setOverdueActions] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const audRes = await api.get<any[]>('/reports/audit-summary');
      setAuditSummary(audRes.data);

      const actRes = await api.get<any[]>('/reports/overdue-actions');
      setOverdueActions(actRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportSample = () => {
    alert('Exporting report data to CSV format...');
  };

  return (
    <Box p={3}>
      <EntityModelInspector
        entityName="REPORTS & GOVERNANCE SUMMARY"
        tableName="N/A (Generated dynamically from AUDIT, FINDING, ACTION, PROJECT)"
        primaryKey="N/A"
        foreignKeys={['audit_id', 'finding_id', 'action_id', 'project_id']}
        relationships={[
          'Generates Audit Closure & Summary report',
          'Generates Overdue Actions breakdown',
          'Generates Critical Findings report'
        ]}
        roleAccess="EXECUTIVE, AUDIT_MANAGER, PM, ADMIN"
        relatedPage="Reports Workspace"
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssessmentIcon sx={{ color: '#38bdf8' }} /> Enterprise Governance Reports
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Generated reports over live audit closures, finding severities, and action progress.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportSample} sx={{ color: '#38bdf8', borderColor: '#38bdf8' }}>
          Export Report
        </Button>
      </Box>

      <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8', mb: 2 }}>
          1. Audit Closure & Summary Report
        </Typography>
        <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
          <TableHead><TableRow sx={{ bgcolor: '#0f172a' }}><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Audit Code</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Title</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Project</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Total Findings</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Open Findings</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
          <TableBody>
            {auditSummary.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{item.audit_code}</TableCell>
                <TableCell>{item.audit_title}</TableCell>
                <TableCell>{item.project_name}</TableCell>
                <TableCell>{item.total_findings}</TableCell>
                <TableCell sx={{ color: item.open_findings > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{item.open_findings}</TableCell>
                <TableCell><StatusChip status={item.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#f59e0b', mb: 2 }}>
          2. Overdue Corrective Actions Report
        </Typography>
        <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
          <TableHead><TableRow sx={{ bgcolor: '#0f172a' }}><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Action Code</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Description</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Source Origin</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Owner</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Due Date</TableCell></TableRow></TableHead>
          <TableBody>
            {overdueActions.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{item.action_code}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.source}</TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell sx={{ color: '#ef4444', fontWeight: 700 }}>{item.due_date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
} from '@mui/material';
import { api } from '../services/api';
import { Audit } from '../types';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { DataTable, Column } from '../components/DataTable';
import { StatusChip } from '../components/StatusChip';
import { MOCK_AUDITS } from '../mockData/governanceMockData';

export const AuditDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: audits = MOCK_AUDITS, isLoading } = useQuery<Audit[]>({
    queryKey: ['audits'],
    queryFn: async () => {
      try {
        const res = await api.get('/audits');
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
      } catch {
        // Fallback
      }
      return MOCK_AUDITS;
    },
  });

  const auditList = Array.isArray(audits) ? audits : [];
  const totalAudits = auditList.length;
  const inProgress = auditList.filter((a) => a?.status === 'IN_PROGRESS' || a?.status === 'FIELDWORK').length;
  const attentionRequired = auditList.filter((a) => a?.status === 'ATTENTION').length;
  const closedAudits = auditList.filter((a) => a?.status === 'CLOSED').length;

  const columns: Column<Audit>[] = [
    { id: 'code', label: 'Audit Code', minWidth: 110 },
    { id: 'title', label: 'Audit Title', minWidth: 220 },
    { id: 'campaign_name', label: 'Campaign', minWidth: 180 },
    { id: 'lead_auditor_name', label: 'Lead Auditor', minWidth: 150 },
    { id: 'status', label: 'Status', minWidth: 120, format: (val) => <StatusChip status={val} /> },
    {
      id: 'closure_percentage',
      label: 'Closure Progress',
      minWidth: 160,
      format: (val) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box flexGrow={1}>
            <LinearProgress variant="determinate" value={val} sx={{ height: 8, borderRadius: 4 }} />
          </Box>
          <Typography variant="caption" fontWeight={700}>
            {val}%
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Audit Dashboard"
        subtitle="Operational governance metrics for active and planned quality audits"
        action={
          <Button variant="contained" color="primary" onClick={() => navigate('/audits')}>
            Manage Audits
          </Button>
        }
      />

      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Audits" value={totalAudits} subtitle="All Governance Audits" color="#0f172a" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="In Fieldwork / Active" value={inProgress} subtitle="Currently Underway" color="#0ea5e9" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Needs Attention" value={attentionRequired} subtitle="Escalated Audit Status" color="#ed6c02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Closed Audits" value={closedAudits} subtitle="Fully Verified" color="#2e7d32" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Audit Execution Status & Closure Progress
        </Typography>
        <DataTable
          columns={columns}
          rows={audits || []}
          loading={isLoading}
          onRowClick={(row) => navigate('/audits')}
        />
      </Paper>
    </Box>
  );
};

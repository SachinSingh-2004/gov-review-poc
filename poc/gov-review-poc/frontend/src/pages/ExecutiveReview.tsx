import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import { BusinessCenter as ExecutiveIcon, TrendingUp as TrendIcon } from '@mui/icons-material';

import { api } from '../services/api';
import { ExecutiveSummary } from '../types';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';

export const ExecutiveReview: React.FC = () => {
  const navigate = useNavigate();

  const { data: execSummary } = useQuery<ExecutiveSummary>({
    queryKey: ['executive-summary'],
    queryFn: async () => (await api.get('/executive/summary')).data,
  });

  return (
    <Box>
      <PageHeader
        title="Executive Governance Review"
        subtitle="Strategic decision support dashboard for executive leadership and VP Quality"
        action={
          <Button variant="outlined" color="primary" onClick={() => navigate('/reports')}>
            Export Board Report (PDF)
          </Button>
        }
      />

      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Overall Governance Health Score"
            value={execSummary ? `${execSummary.overall_governance_score}%` : '91.4%'}
            subtitle="Weighted Compliance Index"
            icon={<ExecutiveIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Action Closure Rate"
            value={execSummary ? `${execSummary.action_closure_rate}%` : '85%'}
            subtitle="CAPA Resolution Speed"
            icon={<TrendIcon />}
            color="#0ea5e9"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="High-Priority Action Items"
            value={execSummary ? execSummary.high_priority_items_count : 0}
            subtitle="Critical & Overdue Escalations"
            color="#d32f2f"
            onClick={() => navigate('/findings?severity=CRITICAL')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Executive Drill-Down"
            value="Level 4"
            subtitle="KPI -> Project -> Audit -> Action"
            color="#0f172a"
            onClick={() => navigate('/projects')}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Executive Governance Drill-down Hierarchy
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Box p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0" textAlign="center" onClick={() => navigate('/portfolio')} sx={{ cursor: 'pointer' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>STEP 1</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="#0ea5e9">Portfolio Health</Typography>
              <Typography variant="caption" display="block">Inspect high-level project status</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0" textAlign="center" onClick={() => navigate('/audits')} sx={{ cursor: 'pointer' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>STEP 2</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="#0ea5e9">Audit Coverage</Typography>
              <Typography variant="caption" display="block">Review campaign audit fieldwork</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0" textAlign="center" onClick={() => navigate('/findings')} sx={{ cursor: 'pointer' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>STEP 3</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="#0ea5e9">Audit Findings</Typography>
              <Typography variant="caption" display="block">Examine critical non-conformances</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0" textAlign="center" onClick={() => navigate('/actions')} sx={{ cursor: 'pointer' }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>STEP 4</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="#0ea5e9">Action Remediations</Typography>
              <Typography variant="caption" display="block">Verify evidence & CAPA closure</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Executive Governance Health Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Audit Status Distribution</Typography>
            {execSummary && Object.entries(execSummary.audit_status_distribution).map(([k, v]) => (
              <Box key={k} display="flex" justifyContent="space-between" py={0.8} borderBottom="1px dashed #e2e8f0">
                <Typography variant="body2">{k}</Typography>
                <Typography variant="body2" fontWeight={700}>{v}</Typography>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Finding Severity Distribution</Typography>
            {execSummary && Object.entries(execSummary.finding_severity_distribution).map(([k, v]) => (
              <Box key={k} display="flex" justifyContent="space-between" py={0.8} borderBottom="1px dashed #e2e8f0">
                <Typography variant="body2">{k}</Typography>
                <Typography variant="body2" fontWeight={700}>{v}</Typography>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Project Health Distribution</Typography>
            {execSummary && Object.entries(execSummary.project_health_distribution).map(([k, v]) => (
              <Box key={k} display="flex" justifyContent="space-between" py={0.8} borderBottom="1px dashed #e2e8f0">
                <Typography variant="body2">{k}</Typography>
                <Typography variant="body2" fontWeight={700}>{v}</Typography>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Grid,
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import { SmartToy as AutonomousIcon, Shield as SafetyIcon } from '@mui/icons-material';

import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';

export const AutonomousDashboard: React.FC = () => {
  const { data: autoData, isLoading } = useQuery({
    queryKey: ['autonomous-summary'],
    queryFn: async () => {
      try {
        const res = await api.get('/autonomous/summary');
        return res.data;
      } catch {
        return null;
      }
    },
  });

  return (
    <Box>
      <PageHeader
        title="Autonomous Systems Governance Dashboard"
        subtitle="Specialized governance metrics for autonomous robotics, AI platform safety, and control systems"
      />

      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Target Autonomous Area"
            value={autoData ? autoData.project_name : 'Autonomous Platform'}
            subtitle="AI & Automation"
            icon={<AutonomousIcon />}
            color="#0ea5e9"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Safety Performance Score"
            value={autoData ? `${autoData.performance_score}%` : '88.5%'}
            subtitle="ISO 26262 / IEC 61508"
            icon={<SafetyIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Area Health Status"
            value={autoData ? autoData.health_status : 'ATTENTION'}
            subtitle="Current Health Index"
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Active Milestones"
            value={autoData ? autoData.milestones.length : 0}
            subtitle="Tracked Safety Goals"
            color="#0f172a"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Autonomous Safety & Risk Controls
            </Typography>
            {autoData?.risks?.map((r: any, idx: number) => (
              <Box key={idx} mb={2} p={1.5} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={600}>
                    {r.title}
                  </Typography>
                  <Chip label={r.level} color={r.level === 'HIGH' ? 'error' : 'warning'} size="small" />
                </Box>
                <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                  Mitigation Plan: {r.plan}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Autonomous Milestones & Target Dates
            </Typography>
            {autoData?.milestones?.map((m: any, idx: number) => (
              <Box key={idx} mb={2} p={1.5} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={600}>
                    {m.title}
                  </Typography>
                  <Chip label={m.status} color="info" size="small" />
                </Box>
                <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                  Target Date: {m.target_date}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

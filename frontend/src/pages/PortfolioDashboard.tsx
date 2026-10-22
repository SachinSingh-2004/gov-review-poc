import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Grid,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import {
  AccountTree as ProjectIcon,
  CheckCircle as HealthyIcon,
  Warning as AttentionIcon,
  Error as RiskIcon,
} from '@mui/icons-material';

import { api } from '../services/api';
import { PortfolioSummary } from '../types';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';

const DEFAULT_PORTFOLIO_SUMMARY: PortfolioSummary = {
  total_projects: 6,
  healthy_projects: 4,
  attention_projects: 1,
  at_risk_projects: 1,
  open_findings: 7,
  critical_findings: 2,
  overdue_actions: 3,
  audit_completion_rate: 85,
};

export const PortfolioDashboard: React.FC = () => {
  const { data: summary = DEFAULT_PORTFOLIO_SUMMARY } = useQuery<PortfolioSummary>({
    queryKey: ['portfolio-summary'],
    queryFn: async () => {
      try {
        const res = await api.get('/portfolio/summary');
        if (res.data && typeof res.data.total_projects === 'number') {
          return res.data;
        }
      } catch {
        // Fallback
      }
      return DEFAULT_PORTFOLIO_SUMMARY;
    },
  });

  return (
    <Box>
      <PageHeader
        title="Portfolio Health & Risk Dashboard"
        subtitle="High-level aggregated governance health across all active R&D product lines"
      />

      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total R&D Projects"
            value={summary ? summary.total_projects : 0}
            subtitle="Active Initiatives"
            icon={<ProjectIcon />}
            color="#0f172a"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Healthy Projects"
            value={summary ? summary.healthy_projects : 0}
            subtitle="Compliant & On Track"
            icon={<HealthyIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Projects Needing Attention"
            value={summary ? summary.attention_projects : 0}
            subtitle="Moderate Risk Triggers"
            icon={<AttentionIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Projects At Risk"
            value={summary ? summary.at_risk_projects : 0}
            subtitle="Critical Open Escalations"
            icon={<RiskIcon />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Portfolio Governance Indicators
            </Typography>
            <Box display="flex" justifyContent="space-between" py={1.5} borderBottom="1px solid #f1f5f9">
              <Typography variant="body2" color="text.secondary">Total Open Findings</Typography>
              <Typography variant="body1" fontWeight={700}>{summary?.open_findings || 0}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" py={1.5} borderBottom="1px solid #f1f5f9">
              <Typography variant="body2" color="text.secondary">Critical Findings Impacting Portfolio</Typography>
              <Typography variant="body1" fontWeight={700} color="error.main">{summary?.critical_findings || 0}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" py={1.5} borderBottom="1px solid #f1f5f9">
              <Typography variant="body2" color="text.secondary">Overdue Actions Needing Remediation</Typography>
              <Typography variant="body1" fontWeight={700} color="error.main">{summary?.overdue_actions || 0}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" py={1.5}>
              <Typography variant="body2" color="text.secondary">Overall Audit Completion Rate</Typography>
              <Typography variant="body1" fontWeight={700} color="success.main">{summary?.audit_completion_rate || 0}%</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Portfolio Executive Recommendations
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Prioritize closure of <strong>{summary?.critical_findings || 0} critical findings</strong> impacting medical device certification timelines.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Conduct corrective review on <strong>{summary?.overdue_actions || 0} overdue actions</strong> assigned to software and hardware engineering leads.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Ensure high audit closure rate ({summary?.audit_completion_rate || 0}%) is maintained for Q3 ISO 13485 pre-audit signoff.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

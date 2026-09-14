import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import { StatCard } from '../components/StatCard';
import { StatusChip } from '../components/StatusChip';
import { EntityModelInspector } from '../components/EntityModelInspector';
import api from '../api/client';
import { ExecutiveSummary, Project, Finding, Action } from '../types';
import { useNavigate } from 'react-router-dom';

export const ExecutiveDashboard: React.FC = () => {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [criticalFindings, setCriticalFindings] = useState<Finding[]>([]);
  const [overdueActions, setOverdueActions] = useState<Action[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  const fetchExecutiveData = async () => {
    try {
      const sumRes = await api.get<ExecutiveSummary>('/reports/executive-summary');
      setSummary(sumRes.data);

      const projRes = await api.get<Project[]>('/projects');
      setProjects(projRes.data);

      const findRes = await api.get<Finding[]>('/findings?status_filter=OPEN');
      setCriticalFindings(findRes.data.filter(f => f.severity === 'CRITICAL'));

      const actRes = await api.get<Action[]>('/actions?status_filter=OVERDUE');
      setOverdueActions(actRes.data);
    } catch (err) {
      console.error('Failed to load executive summary', err);
    }
  };

  return (
    <Box p={3}>
      <EntityModelInspector
        entityName="EXECUTIVE GOVERNANCE VIEW (LIVE AGGREGATION)"
        tableName="N/A (Derived from PROJECT, RISK, FINDING, ACTION, REVIEW)"
        primaryKey="Dynamic Aggregation"
        foreignKeys={['project_id', 'finding_id', 'action_id', 'review_id']}
        relationships={[
          'Aggregates PROJECT health counts',
          'Aggregates active AUDIT findings',
          'Calculates OVERDUE actions by current date',
          'Summarizes open high-level RISKS'
        ]}
        roleAccess="EXECUTIVE, ADMIN, VIEWER (Read-Only Authorized Scope)"
        relatedPage="Executive Dashboard"
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
            <DashboardIcon sx={{ color: '#38bdf8' }} /> Executive Governance Overview
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Real-time R&D portfolio health, quality compliance, and critical action tracking.
          </Typography>
        </Box>
        <Button variant="outlined" size="small" onClick={fetchExecutiveData} sx={{ color: '#38bdf8', borderColor: '#38bdf8' }}>
          Refresh Metrics
        </Button>
      </Box>

      {summary && (
        <Grid container spacing={2.5} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active R&D Projects"
              value={summary.projects.total}
              subtitle={`${summary.projects.green} Green | ${summary.projects.amber} Amber | ${summary.projects.red} Red`}
              icon={<FolderSpecialIcon />}
              color="#0284c7"
              onClick={() => navigate('/projects')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Critical Audit Findings"
              value={summary.audits.critical_findings}
              subtitle={`${summary.audits.open_findings} Total Open Findings`}
              icon={<WarningAmberIcon />}
              color="#ef4444"
              onClick={() => navigate('/audits')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Overdue Actions"
              value={summary.actions.overdue}
              subtitle={`${summary.actions.pending_review} Pending Review`}
              icon={<AssignmentLateIcon />}
              color="#f59e0b"
              onClick={() => navigate('/actions')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Critical Open Risks"
              value={summary.governance.critical_risks}
              subtitle={`${summary.governance.pending_decisions} Pending Leadership Decisions`}
              icon={<VerifiedUserIcon />}
              color="#10b981"
              onClick={() => navigate('/governance-review')}
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2 }}>
              R&D Portfolio Health Status
            </Typography>
            <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#0f172a' }}>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Project Code</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Project Name</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Technology Center</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Phase</TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Health</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((p) => (
                  <TableRow
                    key={p.project_id}
                    hover
                    onClick={() => navigate(`/projects/${p.project_id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{p.code}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.technology_center?.name || 'N/A'}</TableCell>
                    <TableCell>{p.current_phase?.name || 'N/A'}</TableCell>
                    <TableCell><StatusChip status={p.overall_health_status} type="health" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef4444', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon /> Critical Open Findings
            </Typography>
            {criticalFindings.map((f) => (
              <Box key={f.finding_id} p={1.5} mb={1.5} sx={{ bgcolor: '#0f172a', borderRadius: 1.5, borderLeft: '4px solid #ef4444' }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    {f.code}: {f.title}
                  </Typography>
                  <StatusChip status={f.severity} type="severity" />
                </Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                  Owner: {f.owner?.full_name || 'Unassigned'} | Due: {f.due_date}
                </Typography>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f59e0b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentLateIcon /> Overdue Corrective Actions
            </Typography>
            {overdueActions.map((a) => (
              <Box key={a.action_id} p={1.5} mb={1.5} sx={{ bgcolor: '#0f172a', borderRadius: 1.5, borderLeft: '4px solid #f59e0b' }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    {a.code}: {a.description}
                  </Typography>
                  <StatusChip status={a.status} />
                </Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                  Owner: {a.owner?.full_name || 'Unassigned'} | Target: {a.due_date}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

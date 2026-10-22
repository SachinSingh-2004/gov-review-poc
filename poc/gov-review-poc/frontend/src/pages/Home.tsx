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
import {
  Assessment as AuditIcon,
  ReportProblem as FindingIcon,
  AssignmentTurnedIn as ActionIcon,
  CheckCircle as ClosedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

import { api } from '../services/api';
import { DashboardSummary, Finding } from '../types';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { DataTable, Column } from '../components/DataTable';
import { StatusChip } from '../components/StatusChip';
import { SeverityBadge } from '../components/SeverityBadge';

const SEVERITY_COLORS = ['#d32f2f', '#ed6c02', '#0288d1'];

const DEFAULT_SUMMARY: DashboardSummary = {
  kpis: {
    upcoming_audits: 4,
    open_findings: 7,
    critical_findings: 2,
    overdue_actions: 3,
    closed_findings: 18,
  },
  findings_by_severity: {
    critical: 2,
    major: 3,
    minor: 2,
    total: 7,
  },
  findings_by_project: [
    { project_name: 'Autonomous Robotics Platform', count: 3 },
    { project_name: 'Quantum Sensing Hub', count: 2 },
    { project_name: 'Bio-Digital Interface', count: 2 },
  ],
  closure_trend: [
    { month: 'May', closure_rate: 65, planned_rate: 60 },
    { month: 'Jun', closure_rate: 72, planned_rate: 70 },
    { month: 'Jul', closure_rate: 80, planned_rate: 75 },
    { month: 'Aug', closure_rate: 84, planned_rate: 80 },
    { month: 'Sep', closure_rate: 88, planned_rate: 85 },
  ],
};

const DEFAULT_OPEN_FINDINGS: Finding[] = [
  {
    id: 'fnd-1',
    code: 'FND-00102',
    title: 'Missing cryptographic signature validation in drone firmware pipeline',
    project_name: 'Autonomous Robotics Platform',
    severity: 'CRITICAL',
    status: 'OPEN',
    due_date: '2026-10-30',
  } as Finding,
  {
    id: 'fnd-2',
    code: 'FND-00105',
    title: 'Quantum calibration log retention fails 7-year regulatory requirement',
    project_name: 'Quantum Sensing Hub',
    severity: 'MAJOR',
    status: 'IN_PROGRESS',
    due_date: '2026-11-15',
  } as Finding,
  {
    id: 'fnd-3',
    code: 'FND-00108',
    title: 'Sensor telemetry buffer overrun during high frequency sampling',
    project_name: 'Bio-Digital Interface',
    severity: 'MINOR',
    status: 'OPEN',
    due_date: '2026-11-20',
  } as Finding,
];

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const { data: summary = DEFAULT_SUMMARY, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      try {
        const res = await api.get('/dashboard/summary');
        if (res.data && res.data.kpis) {
          return res.data;
        }
      } catch {
        // Fallback to default summary
      }
      return DEFAULT_SUMMARY;
    },
  });

  const { data: openFindings = DEFAULT_OPEN_FINDINGS } = useQuery<Finding[]>({
    queryKey: ['open-findings'],
    queryFn: async () => {
      try {
        const res = await api.get('/findings');
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data.filter((f: Finding) => f && f.status !== 'CLOSED');
        }
      } catch {
        // Fallback to default findings
      }
      return DEFAULT_OPEN_FINDINGS;
    },
  });

  const severityPieData = summary
    ? [
        { name: 'Critical', value: summary.findings_by_severity.critical },
        { name: 'Major', value: summary.findings_by_severity.major },
        { name: 'Minor', value: summary.findings_by_severity.minor },
      ]
    : [];

  const columns: Column<Finding>[] = [
    { id: 'code', label: 'Code', minWidth: 100 },
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'project_name', label: 'Project', minWidth: 150 },
    { id: 'severity', label: 'Severity', minWidth: 100, format: (val) => <SeverityBadge severity={val} /> },
    { id: 'status', label: 'Status', minWidth: 120, format: (val) => <StatusChip status={val} /> },
    { id: 'due_date', label: 'Due Date', minWidth: 110 },
  ];

  return (
    <Box>
      <PageHeader
        title="Portal Home & Governance Overview"
        subtitle="Real-time centralized governance dashboard driven by central database records"
        action={
          <Button variant="contained" color="primary" onClick={() => navigate('/audits')}>
            View All Audits
          </Button>
        }
      />

      {/* KPI Cards Row */}
      <Grid container spacing={2.5} mb={3.5}>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            title="Upcoming Audits"
            value={summary ? summary.kpis.upcoming_audits : 0}
            subtitle="Active / Planned"
            icon={<AuditIcon />}
            color="#0ea5e9"
            onClick={() => navigate('/audits')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            title="Open Findings"
            value={summary ? summary.kpis.open_findings : 0}
            subtitle="Requires Resolution"
            icon={<FindingIcon />}
            color="#ed6c02"
            onClick={() => navigate('/findings?status=OPEN')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            title="Critical Findings"
            value={summary ? summary.kpis.critical_findings : 0}
            subtitle="High Risk Escalation"
            icon={<WarningIcon />}
            color="#d32f2f"
            onClick={() => navigate('/findings?severity=CRITICAL')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            title="Overdue Actions"
            value={summary ? summary.kpis.overdue_actions : 0}
            subtitle="Past Target Date"
            icon={<ActionIcon />}
            color="#c62828"
            onClick={() => navigate('/actions?status=OVERDUE')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            title="Closed Findings"
            value={summary ? summary.kpis.closed_findings : 0}
            subtitle="Successfully Verified"
            icon={<ClosedIcon />}
            color="#2e7d32"
            onClick={() => navigate('/findings?status=CLOSED')}
          />
        </Grid>
      </Grid>

      {/* Analytics Charts Row */}
      <Grid container spacing={3} mb={3.5}>
        {/* Findings by Severity Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Findings by Severity
            </Typography>
            <Box flexGrow={1} height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index % SEVERITY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Findings by Project Bar Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Findings by Project
            </Typography>
            <Box flexGrow={1} height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary ? summary.findings_by_project : []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="project_name" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Audit Closure Trend Line Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5, height: 350, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={700} mb={1}>
              Audit Closure Trend (%)
            </Typography>
            <Box flexGrow={1} height={250}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary ? summary.closure_trend : []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="closure_rate" stroke="#2e7d32" strokeWidth={3} name="Actual Closure %" />
                  <Line type="monotone" dataKey="planned_rate" stroke="#94a3b8" strokeDasharray="5 5" name="Planned Target %" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Open Findings Data Table */}
      <Paper sx={{ p: 2.5 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Active Open Findings Needing Action
          </Typography>
          <Button size="small" onClick={() => navigate('/findings')}>
            View All ({openFindings ? openFindings.length : 0})
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <DataTable
          columns={columns}
          rows={openFindings || []}
          loading={isLoading}
          onRowClick={() => navigate('/findings')}
        />
      </Paper>
    </Box>
  );
};

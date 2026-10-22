import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Tabs,
  Tab,
  Chip,
  Alert,
  AlertTitle,
  LinearProgress,
  Card,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  TableChart as TableIcon,
  Badge as WorkloadIcon,
  WarningAmber as ConflictIcon,
  EventRepeat as RecurrenceIcon,
} from '@mui/icons-material';

import { api } from '../services/api';
import { Audit, Campaign, User, AuditType, RecurrencePattern, AuditConflictCheckResponse } from '../types';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { StatusChip } from '../components/StatusChip';
import { useAuth } from '../context/AuthContext';

export const Audits: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<number>(0);

  const [openCreate, setOpenCreate] = useState(false);
  const [conflictCheck, setConflictCheck] = useState<AuditConflictCheckResponse | null>(null);

  const [formData, setFormData] = useState({
    code: `AUD-00${Math.floor(Math.random() * 900 + 100)}`,
    title: '',
    campaign_id: '',
    lead_auditor_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'PLANNED',
    audit_type: 'PROCESS' as AuditType,
    recurrence_pattern: 'NONE' as RecurrencePattern,
    scope_description: '',
    estimated_hours: 40,
    milestone_id: '',
  });

  const { data: audits, isLoading } = useQuery<Audit[]>({
    queryKey: ['audits'],
    queryFn: async () => (await api.get('/audits')).data,
  });

  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => (await api.get('/campaigns')).data,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data,
  });

  // Check schedule conflicts
  const handleCheckConflicts = async (auditorId: string, sDate: string, eDate: string) => {
    if (!auditorId || !sDate || !eDate) return;
    try {
      const res = await api.post('/audits/schedule/check-conflicts', {
        lead_auditor_id: auditorId,
        start_date: sDate,
        end_date: eDate,
      });
      setConflictCheck(res.data);
    } catch (err) {
      console.error('Failed to check schedule conflicts', err);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      return (await api.post('/audits', payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setOpenCreate(false);
      setConflictCheck(null);
      setFormData({
        code: `AUD-00${Math.floor(Math.random() * 900 + 100)}`,
        title: '',
        campaign_id: '',
        lead_auditor_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'PLANNED',
        audit_type: 'PROCESS',
        recurrence_pattern: 'NONE',
        scope_description: '',
        estimated_hours: 40,
        milestone_id: '',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getAuditTypeColor = (type?: AuditType) => {
    switch (type) {
      case 'SOFTWARE_SAFETY': return { bg: '#e0f2fe', color: '#0369a1' };
      case 'DESIGN_CONTROL': return { bg: '#fef3c7', color: '#b45309' };
      case 'CYBERSECURITY': return { bg: '#f3e8ff', color: '#6b21a8' };
      case 'VENDOR': return { bg: '#dcfce7', color: '#15803d' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const columns: Column<Audit>[] = [
    { id: 'code', label: 'Code', minWidth: 100 },
    { id: 'title', label: 'Audit Title', minWidth: 200 },
    {
      id: 'audit_type',
      label: 'Audit Type',
      minWidth: 140,
      format: (val, row) => {
        const style = getAuditTypeColor(row.audit_type);
        return (
          <Chip
            label={(val || 'PROCESS').replace('_', ' ')}
            size="small"
            sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: '0.72rem' }}
          />
        );
      },
    },
    { id: 'campaign_name', label: 'Campaign', minWidth: 160 },
    { id: 'project_name', label: 'Project', minWidth: 150 },
    { id: 'lead_auditor_name', label: 'Lead Auditor', minWidth: 140 },
    { id: 'start_date', label: 'Start', minWidth: 100 },
    { id: 'end_date', label: 'End', minWidth: 100 },
    {
      id: 'closure_percentage',
      label: 'Closure Progress',
      minWidth: 140,
      format: (val) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress variant="determinate" value={val || 0} color="primary" sx={{ height: 6, borderRadius: 3 }} />
          </Box>
          <Typography variant="caption" fontWeight={600}>{Math.round(val || 0)}%</Typography>
        </Box>
      ),
    },
    { id: 'status', label: 'Status', minWidth: 120, format: (val) => <StatusChip status={val} /> },
  ];

  // Group audits by Auditor for Workload Matrix
  const auditorsList = users?.filter(u => u.roles.some(r => r.name === 'AUDITOR' || r.name === 'AUDIT_MANAGER' || r.name === 'ADMIN')) || [];

  return (
    <Box>
      <PageHeader
        title="Quality & Governance Audits"
        subtitle="Schedule, track, and manage quality compliance audits across enterprise R&D projects"
        action={
          hasPermission('audit.create') ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
              Schedule New Audit
            </Button>
          ) : undefined
        }
      />

      {/* Multi-Tab Navigation */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<TableIcon />} iconPosition="start" label="Audit Directory" />
          <Tab icon={<CalendarIcon />} iconPosition="start" label="Gantt Schedule & Timeline" />
          <Tab icon={<WorkloadIcon />} iconPosition="start" label="Auditor Workload Matrix" />
        </Tabs>
      </Paper>

      {/* Tab 0: Directory */}
      {activeTab === 0 && (
        <Paper sx={{ p: 2.5 }}>
          <DataTable columns={columns} rows={audits || []} loading={isLoading} />
        </Paper>
      )}

      {/* Tab 1: Gantt Schedule & Timeline */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Enterprise Audit Schedule Timeline
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label="Planned" size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1' }} />
              <Chip label="In Progress" size="small" sx={{ bgcolor: '#fef3c7', color: '#b45309' }} />
              <Chip label="Fieldwork" size="small" sx={{ bgcolor: '#f3e8ff', color: '#6b21a8' }} />
              <Chip label="Closed" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d' }} />
            </Box>
          </Box>

          <Grid container spacing={2}>
            {audits?.map((audit) => {
              const style = getAuditTypeColor(audit.audit_type);
              return (
                <Grid item xs={12} key={audit.id}>
                  <Card variant="outlined" sx={{ p: 2, '&:hover': { boxShadow: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            [{audit.code}] {audit.title}
                          </Typography>
                          <Chip label={audit.audit_type || 'PROCESS'} size="small" sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700 }} />
                          {audit.recurrence_pattern && audit.recurrence_pattern !== 'NONE' && (
                            <Chip icon={<RecurrenceIcon sx={{ fontSize: 14 }} />} label={audit.recurrence_pattern} size="small" variant="outlined" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Campaign: <strong>{audit.campaign_name}</strong> | Project: <strong>{audit.project_name}</strong> | Lead: <strong>{audit.lead_auditor_name}</strong>
                        </Typography>
                      </Box>
                      <StatusChip status={audit.status} />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Timeline: {audit.start_date} → {audit.end_date} ({audit.estimated_hours || 40} Est. Hours)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '40%' }}>
                        <Typography variant="caption" color="text.secondary">Closure:</Typography>
                        <LinearProgress variant="determinate" value={audit.closure_percentage || 0} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                        <Typography variant="caption" fontWeight={700}>{Math.round(audit.closure_percentage || 0)}%</Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Tab 2: Auditor Workload Matrix */}
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Lead Auditor Resource Allocation & Workload Matrix
          </Typography>
          <Grid container spacing={3}>
            {auditorsList.map((auditor) => {
              const assignedAudits = audits?.filter(a => a.lead_auditor_id === auditor.id) || [];
              const totalHours = assignedAudits.reduce((acc, a) => acc + (a.estimated_hours || 40), 0);
              const activeCount = assignedAudits.filter(a => a.status !== 'CLOSED').length;
              const hasHighWorkload = totalHours > 100;

              return (
                <Grid item xs={12} md={6} key={auditor.id}>
                  <Card variant="outlined" sx={{ p: 2.5, borderColor: hasHighWorkload ? 'warning.main' : 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                        {auditor.full_name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {auditor.full_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {auditor.department} • {auditor.email}
                        </Typography>
                      </Box>
                      {hasHighWorkload && (
                        <Chip icon={<ConflictIcon />} label="High Workload" color="warning" size="small" />
                      )}
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'grey.50' }}>
                          <Typography variant="caption" color="text.secondary">Active Audits</Typography>
                          <Typography variant="h6" fontWeight={700}>{activeCount}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'grey.50' }}>
                          <Typography variant="caption" color="text.secondary">Total Est. Workload</Typography>
                          <Typography variant="h6" fontWeight={700}>{totalHours} hrs</Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      ASSIGNED AUDITS ({assignedAudits.length})
                    </Typography>
                    {assignedAudits.map((a) => (
                      <Box key={a.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px dashed #e2e8f0' }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: '65%' }}>
                          [{a.code}] {a.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.start_date} to {a.end_date}
                        </Typography>
                      </Box>
                    ))}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Schedule Audit Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight={700}>Schedule New R&D Governance Audit</DialogTitle>
          <DialogContent dividers>
            {conflictCheck?.has_conflict && (
              <Alert severity="warning" icon={<ConflictIcon />} sx={{ mb: 3 }}>
                <AlertTitle fontWeight={700}>Auditor Schedule Conflict Warning</AlertTitle>
                The selected Lead Auditor is already assigned to {conflictCheck.conflict_count} overlapping audit(s):
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {conflictCheck.overlapping_audits.map(c => (
                    <li key={c.id}>
                      <strong>[{c.code}] {c.title}</strong> ({c.start_date} to {c.end_date})
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Audit Code"
                  fullWidth
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Audit Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Associated Campaign"
                  fullWidth
                  required
                  value={formData.campaign_id}
                  onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                >
                  {campaigns?.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Lead Auditor"
                  fullWidth
                  required
                  value={formData.lead_auditor_id}
                  onChange={(e) => {
                    const auditorId = e.target.value;
                    setFormData({ ...formData, lead_auditor_id: auditorId });
                    handleCheckConflicts(auditorId, formData.start_date, formData.end_date);
                  }}
                >
                  {users?.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.full_name} ({u.department})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Start Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.start_date}
                  onChange={(e) => {
                    const sDate = e.target.value;
                    setFormData({ ...formData, start_date: sDate });
                    handleCheckConflicts(formData.lead_auditor_id, sDate, formData.end_date);
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="End Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_date}
                  onChange={(e) => {
                    const eDate = e.target.value;
                    setFormData({ ...formData, end_date: eDate });
                    handleCheckConflicts(formData.lead_auditor_id, formData.start_date, eDate);
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Audit Type"
                  fullWidth
                  value={formData.audit_type}
                  onChange={(e) => setFormData({ ...formData, audit_type: e.target.value as AuditType })}
                >
                  <MenuItem value="PROCESS">QMS Process Audit</MenuItem>
                  <MenuItem value="DESIGN_CONTROL">Design Control Compliance</MenuItem>
                  <MenuItem value="SOFTWARE_SAFETY">Software Safety Architecture</MenuItem>
                  <MenuItem value="CYBERSECURITY">Cybersecurity & ISO 62443</MenuItem>
                  <MenuItem value="VENDOR">Supplier / Vendor Quality</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Recurrence Schedule"
                  fullWidth
                  value={formData.recurrence_pattern}
                  onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value as RecurrencePattern })}
                >
                  <MenuItem value="NONE">One-Time Audit (No Recurrence)</MenuItem>
                  <MenuItem value="QUARTERLY">Quarterly Recurrence</MenuItem>
                  <MenuItem value="SEMI_ANNUAL">Semi-Annual Recurrence</MenuItem>
                  <MenuItem value="ANNUAL">Annual Recurrence</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  type="number"
                  label="Est. Workload Hours"
                  fullWidth
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  label="Scope Description & Boundaries"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Detail audit scope, regulatory standards (ISO 13485, IEC 62443), and expected deliverables..."
                  value={formData.scope_description}
                  onChange={(e) => setFormData({ ...formData, scope_description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              Confirm Schedule
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

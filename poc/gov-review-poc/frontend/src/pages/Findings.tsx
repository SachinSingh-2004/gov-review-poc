import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
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
  Chip,
} from '@mui/material';
import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material';

import { api } from '../services/api';
import { Finding, Audit, User } from '../types';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { StatusChip } from '../components/StatusChip';
import { SeverityBadge } from '../components/SeverityBadge';
import { EvidenceUploader } from '../components/EvidenceUploader';
import { useAuth } from '../context/AuthContext';

export const Findings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSeverity = searchParams.get('severity') || 'ALL';
  const initialStatus = searchParams.get('status') || 'ALL';

  const [severityFilter, setSeverityFilter] = useState(initialSeverity);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [openCreate, setOpenCreate] = useState(false);
  const [formData, setFormData] = useState({
    code: `FND-00${Math.floor(Math.random() * 900 + 100)}`,
    audit_id: '',
    title: '',
    description: '',
    severity: 'MAJOR',
    owner_id: '',
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'OPEN',
  });

  const { data: findings, isLoading } = useQuery<Finding[]>({
    queryKey: ['findings'],
    queryFn: async () => (await api.get('/findings')).data,
  });

  const { data: audits } = useQuery<Audit[]>({
    queryKey: ['audits'],
    queryFn: async () => (await api.get('/audits')).data,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      return (await api.post('/findings', payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setOpenCreate(false);
      setFormData({
        code: `FND-00${Math.floor(Math.random() * 900 + 100)}`,
        audit_id: '',
        title: '',
        description: '',
        severity: 'MAJOR',
        owner_id: '',
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'OPEN',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredFindings = (findings || []).filter((f) => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    return true;
  });

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const columns: Column<Finding>[] = [
    { id: 'code', label: 'Finding Code', minWidth: 110 },
    { id: 'title', label: 'Finding Description / Title', minWidth: 220 },
    { id: 'audit_title', label: 'Associated Audit', minWidth: 170 },
    { id: 'project_name', label: 'Project', minWidth: 140 },
    { id: 'severity', label: 'Severity', minWidth: 110, format: (val) => <SeverityBadge severity={val} /> },
    { id: 'owner_name', label: 'Owner', minWidth: 130 },
    { id: 'status', label: 'Status', minWidth: 120, format: (val) => <StatusChip status={val} /> },
    {
      id: 'actions',
      label: 'Evidence / Details',
      minWidth: 150,
      format: (_, row) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setSelectedFinding(row);
            setOpenDetail(true);
          }}
        >
          View Evidence
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Audit Findings Management"
        subtitle="Track non-conformances, quality gaps, and audit findings across all R&D projects"
        action={
          hasPermission('finding.create') ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
              Record New Finding
            </Button>
          ) : undefined
        }
      />

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <FilterIcon color="action" />
          <Typography variant="body2" fontWeight={700}>
            Filters:
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Typography variant="caption" sx={{ alignSelf: 'center', mr: 1, fontWeight: 600 }}>
            Severity:
          </Typography>
          {['ALL', 'CRITICAL', 'MAJOR', 'MINOR'].map((sev) => (
            <Chip
              key={sev}
              label={sev}
              size="small"
              onClick={() => setSeverityFilter(sev)}
              color={severityFilter === sev ? 'primary' : 'default'}
              variant={severityFilter === sev ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>
        <Box display="flex" gap={1} ml={{ md: 2 }}>
          <Typography variant="caption" sx={{ alignSelf: 'center', mr: 1, fontWeight: 600 }}>
            Status:
          </Typography>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'].map((st) => (
            <Chip
              key={st}
              label={st.replace('_', ' ')}
              size="small"
              onClick={() => setStatusFilter(st)}
              color={statusFilter === st ? 'primary' : 'default'}
              variant={statusFilter === st ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <DataTable columns={columns} rows={filteredFindings} loading={isLoading} />
      </Paper>

      {/* Record Finding Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight={700}>Record New Governance Audit Finding</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Finding Code"
                  fullWidth
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Finding Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Select Parent Audit"
                  fullWidth
                  required
                  value={formData.audit_id}
                  onChange={(e) => setFormData({ ...formData, audit_id: e.target.value })}
                >
                  {audits?.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.code} — {a.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Severity Level"
                  fullWidth
                  required
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <MenuItem value="CRITICAL">Critical (High Escalation)</MenuItem>
                  <MenuItem value="MAJOR">Major (Process Deviation)</MenuItem>
                  <MenuItem value="MINOR">Minor (Documentation)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Assign Finding Owner"
                  fullWidth
                  required
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
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
                  label="Target Resolution Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Detailed Non-Conformance Description"
                  multiline
                  rows={3}
                  fullWidth
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              Submit Finding
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Finding Evidence & Detail Dialog */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        {selectedFinding && (
          <Box>
            <DialogTitle fontWeight={700}>
              [{selectedFinding.code}] {selectedFinding.title}
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  NON-CONFORMANCE DESCRIPTION
                </Typography>
                <Typography variant="body1" mt={0.5}>
                  {selectedFinding.description || 'No additional description provided.'}
                </Typography>
              </Box>
              <Box mb={2} display="flex" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">SEVERITY</Typography>
                  <SeverityBadge severity={selectedFinding.severity} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">STATUS</Typography>
                  <StatusChip status={selectedFinding.status} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">OWNER</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedFinding.owner_name || 'Unassigned'}</Typography>
                </Box>
              </Box>

              {/* Evidence Uploader Component for Finding */}
              <EvidenceUploader entityType="FINDING" entityId={selectedFinding.id} />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setOpenDetail(false)}>Close</Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

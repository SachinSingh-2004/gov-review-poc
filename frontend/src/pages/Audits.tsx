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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

import { api } from '../services/api';
import { Audit, Campaign, User } from '../types';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { StatusChip } from '../components/StatusChip';
import { useAuth } from '../context/AuthContext';

export const Audits: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [openCreate, setOpenCreate] = useState(false);
  const [formData, setFormData] = useState({
    code: `AUD-00${Math.floor(Math.random() * 900 + 100)}`,
    title: '',
    campaign_id: '',
    lead_auditor_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'PLANNED',
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

  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      return (await api.post('/audits', payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setOpenCreate(false);
      setFormData({
        code: `AUD-00${Math.floor(Math.random() * 900 + 100)}`,
        title: '',
        campaign_id: '',
        lead_auditor_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'PLANNED',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const columns: Column<Audit>[] = [
    { id: 'code', label: 'Code', minWidth: 100 },
    { id: 'title', label: 'Audit Title', minWidth: 220 },
    { id: 'campaign_name', label: 'Associated Campaign', minWidth: 180 },
    { id: 'project_name', label: 'Project', minWidth: 160 },
    { id: 'lead_auditor_name', label: 'Lead Auditor', minWidth: 150 },
    { id: 'start_date', label: 'Start Date', minWidth: 110 },
    { id: 'end_date', label: 'End Date', minWidth: 110 },
    { id: 'status', label: 'Status', minWidth: 120, format: (val) => <StatusChip status={val} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Quality & Governance Audits"
        subtitle="Manage and track quality compliance audits across enterprise R&D projects"
        action={
          hasPermission('audit.create') ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
              Create New Audit
            </Button>
          ) : undefined
        }
      />

      <Paper sx={{ p: 2.5 }}>
        <DataTable columns={columns} rows={audits || []} loading={isLoading} />
      </Paper>

      {/* Create Audit Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight={700}>Create New Governance Audit</DialogTitle>
          <DialogContent dividers>
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
                  label="Select Campaign"
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
                  onChange={(e) => setFormData({ ...formData, lead_auditor_id: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="End Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              Create Audit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

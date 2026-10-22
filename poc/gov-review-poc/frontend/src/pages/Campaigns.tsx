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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

import { api } from '../services/api';
import { Campaign, Project, User } from '../types';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { StatusChip } from '../components/StatusChip';
import { useAuth } from '../context/AuthContext';

export const Campaigns: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();

  const [openCreate, setOpenCreate] = useState(false);
  const [formData, setFormData] = useState({
    code: `CMP-2026-Q${Math.floor(Math.random() * 4 + 1)}`,
    name: '',
    project_id: '',
    description: '',
    owner_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    status: 'PLANNED',
  });

  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => (await api.get('/campaigns')).data,
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      return (await api.post('/campaigns', payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setOpenCreate(false);
      setFormData({
        code: `CMP-2026-Q${Math.floor(Math.random() * 4 + 1)}`,
        name: '',
        project_id: '',
        description: '',
        owner_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        status: 'PLANNED',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const columns: Column<Campaign>[] = [
    { id: 'code', label: 'Campaign Code', minWidth: 120 },
    { id: 'name', label: 'Campaign Name', minWidth: 220 },
    { id: 'project_name', label: 'Target Project', minWidth: 180 },
    { id: 'owner_name', label: 'Campaign Owner', minWidth: 150 },
    { id: 'start_date', label: 'Start Date', minWidth: 110 },
    { id: 'end_date', label: 'End Date', minWidth: 110 },
    { id: 'status', label: 'Status', minWidth: 120, format: (val) => <StatusChip status={val} /> },
    { id: 'audit_count', label: 'Connected Audits', minWidth: 130 },
  ];

  return (
    <Box>
      <PageHeader
        title="Audit & Governance Campaigns"
        subtitle="Strategic governance campaigns organizing targeted compliance audits for R&D initiatives"
        action={
          hasPermission('campaign.create') ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
              Create New Campaign
            </Button>
          ) : undefined
        }
      />

      <Paper sx={{ p: 2.5 }}>
        <DataTable columns={columns} rows={campaigns || []} loading={isLoading} />
      </Paper>

      {/* Create Campaign Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle fontWeight={700}>Create New Governance Campaign</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Campaign Code"
                  fullWidth
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Campaign Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Target Project"
                  fullWidth
                  required
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                >
                  {projects?.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Campaign Owner"
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
                  label="Campaign Start Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Campaign End Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Strategic Objective / Description"
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
              Create Campaign
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

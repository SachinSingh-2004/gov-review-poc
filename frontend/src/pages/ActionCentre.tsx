import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Typography,
} from '@mui/material';
import { Add as AddIcon, CheckCircle as CompleteIcon } from '@mui/icons-material';

import { api } from '../services/api';
import { ActionItem, Finding, User } from '../types';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { StatusChip } from '../components/StatusChip';
import { EvidenceUploader } from '../components/EvidenceUploader';
import { useAuth } from '../context/AuthContext';
import { MOCK_ACTIONS, MOCK_FINDINGS, MOCK_USERS } from '../mockData/governanceMockData';

export const ActionCentre: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const queryClient = useQueryClient();
  const { user, currentRole, hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  const [updateStatus, setUpdateStatus] = useState<string>('COMPLETED');
  const [evidenceSummary, setEvidenceSummary] = useState<string>('');

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newActionData, setNewActionData] = useState({
    code: `ACT-00${Math.floor(Math.random() * 900 + 100)}`,
    finding_id: '',
    description: '',
    owner_id: '',
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'OPEN',
  });

  const { data: actions = MOCK_ACTIONS, isLoading } = useQuery<ActionItem[]>({
    queryKey: ['actions'],
    queryFn: async () => {
      try {
        const res = await api.get('/actions');
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
      } catch {
        // Fallback
      }
      return MOCK_ACTIONS;
    },
  });

  const { data: findings = MOCK_FINDINGS } = useQuery<Finding[]>({
    queryKey: ['findings'],
    queryFn: async () => {
      try {
        const res = await api.get('/findings');
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
      } catch {
        // Fallback
      }
      return MOCK_FINDINGS;
    },
  });

  const { data: users = MOCK_USERS } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await api.get('/users');
        if (Array.isArray(res.data) && res.data.length > 0) {
          return res.data;
        }
      } catch {
        // Fallback
      }
      return MOCK_USERS;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return (await api.put(`/actions/${id}`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setOpenUpdateModal(false);
      setSelectedAction(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof newActionData) => {
      return (await api.post('/actions', payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setOpenCreateModal(false);
      setNewActionData({
        code: `ACT-00${Math.floor(Math.random() * 900 + 100)}`,
        finding_id: '',
        description: '',
        owner_id: '',
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'OPEN',
      });
    },
  });

  const handleActionClick = (action: ActionItem) => {
    setSelectedAction(action);
    setUpdateStatus(action.status === 'OPEN' ? 'IN_PROGRESS' : 'COMPLETED');
    setEvidenceSummary(action.evidence_summary || '');
    setOpenUpdateModal(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAction) return;
    updateMutation.mutate({
      id: selectedAction.id,
      payload: {
        status: updateStatus,
        evidence_summary: evidenceSummary,
      },
    });
  };

  // Tab filtering logic
  const getFilteredActions = () => {
    const list = Array.isArray(actions) ? actions : [];
    switch (activeTab) {
      case 1: // My Actions
        return list.filter((a) => a && (a.owner_id === user?.id || currentRole === 'ACTION_OWNER'));
      case 2: // Open Actions
        return list.filter((a) => a && a.status === 'OPEN');
      case 3: // In Progress
        return list.filter((a) => a && a.status === 'IN_PROGRESS');
      case 4: // Overdue
        return list.filter((a) => a && a.status === 'OVERDUE');
      case 5: // Completed / Closed
        return list.filter((a) => a && (a.status === 'COMPLETED' || a.status === 'CLOSED'));
      case 0:
      default:
        if (initialStatus === 'OVERDUE') return list.filter((a) => a && a.status === 'OVERDUE');
        return list.filter(Boolean);
    }
  };

  const columns: Column<ActionItem>[] = [
    { id: 'code', label: 'Action Code', minWidth: 110 },
    { id: 'description', label: 'Action Description', minWidth: 260 },
    { id: 'finding_title', label: 'Parent Finding', minWidth: 200 },
    { id: 'project_name', label: 'Project', minWidth: 150 },
    { id: 'owner_name', label: 'Owner', minWidth: 150 },
    { id: 'due_date', label: 'Target Due Date', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 120, format: (val) => <StatusChip status={val} /> },
    {
      id: 'actions',
      label: 'Update Status',
      minWidth: 130,
      format: (_, row) => (
        <Button size="small" variant="outlined" color="primary" onClick={() => handleActionClick(row)}>
          Update / Progress
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Action Centre"
        subtitle="Centralized management of corrective and preventive actions (CAPA) with evidence submission"
        action={
          hasPermission('action.create') ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreateModal(true)}>
              Assign New Action
            </Button>
          ) : undefined
        }
      />

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="All Actions" />
          <Tab label="My Actions" />
          <Tab label="Open" />
          <Tab label="In Progress" />
          <Tab label="Overdue" />
          <Tab label="Completed / Closed" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2.5 }}>
        <DataTable columns={columns} rows={getFilteredActions()} loading={isLoading} />
      </Paper>

      {/* Action Status Update & Evidence Submission Modal */}
      <Dialog open={openUpdateModal} onClose={() => setOpenUpdateModal(false)} maxWidth="sm" fullWidth>
        {selectedAction && (
          <form onSubmit={handleUpdateSubmit}>
            <DialogTitle fontWeight={700}>
              Update Action Status & Evidence — {selectedAction.code}
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                  ACTION DESCRIPTION
                </Typography>
                <Typography variant="body1" fontWeight={600} mt={0.5}>
                  {selectedAction.description}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Update Status"
                    fullWidth
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                  >
                    <MenuItem value="OPEN">Open (Not Started)</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed (Pending Approval)</MenuItem>
                    <MenuItem value="CLOSED">Closed (Approved)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Evidence Summary & Completion Notes"
                    multiline
                    rows={4}
                    fullWidth
                    required={updateStatus === 'COMPLETED'}
                    placeholder="Enter evidence details, documentation links, or validation test results..."
                    value={evidenceSummary}
                    onChange={(e) => setEvidenceSummary(e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* Phase 2B: Evidence & Verification File Uploads */}
              <EvidenceUploader entityType="ACTION" entityId={selectedAction.id} />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setOpenUpdateModal(false)}>Cancel</Button>
              <Button type="submit" variant="contained" color="success" startIcon={<CompleteIcon />}>
                Submit Status Update
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Create Action Modal */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="md" fullWidth>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newActionData); }}>
          <DialogTitle fontWeight={700}>Assign New Corrective Action</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Action Code"
                  fullWidth
                  required
                  value={newActionData.code}
                  onChange={(e) => setNewActionData({ ...newActionData, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  select
                  label="Parent Finding"
                  fullWidth
                  required
                  value={newActionData.finding_id}
                  onChange={(e) => setNewActionData({ ...newActionData, finding_id: e.target.value })}
                >
                  {findings?.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.code} — {f.title} ({f.severity})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Action Requirement / Task Description"
                  multiline
                  rows={2}
                  fullWidth
                  required
                  value={newActionData.description}
                  onChange={(e) => setNewActionData({ ...newActionData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Action Owner"
                  fullWidth
                  required
                  value={newActionData.owner_id}
                  onChange={(e) => setNewActionData({ ...newActionData, owner_id: e.target.value })}
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
                  label="Target Completion Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newActionData.due_date}
                  onChange={(e) => setNewActionData({ ...newActionData, due_date: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Assign Action
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import { StatusChip } from '../components/StatusChip';
import { EntityModelInspector } from '../components/EntityModelInspector';
import api from '../api/client';
import { Action, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ActionCentre: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Evidence upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');

  useEffect(() => {
    fetchActions();
  }, [tabValue, currentUser]);

  const fetchActions = async () => {
    try {
      let url = '/actions';
      if (tabValue === 0) url = '/actions?my_actions_only=true';
      else if (tabValue === 2) url = '/actions?status_filter=OVERDUE';
      else if (tabValue === 3) url = '/actions?status_filter=PENDING_REVIEW';
      else if (tabValue === 4) url = '/actions?status_filter=COMPLETED';

      const res = await api.get<Action[]>(url);
      setActions(res.data);
    } catch (err) {
      console.error('Failed to load actions', err);
    }
  };

  const handleUploadEvidence = async () => {
    if (!selectedAction || !uploadFileName) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await api.post('/evidence', {
        action_id: selectedAction.action_id,
        file_name: uploadFileName,
        file_type: 'document'
      });
      setSuccessMessage(`Evidence file '${uploadFileName}' uploaded successfully! Action submitted for review.`);
      setUploadModalOpen(false);
      setUploadFileName('');
      fetchActions();
      const updated = await api.get<Action>(`/actions/${selectedAction.action_id}`);
      setSelectedAction(updated.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to upload evidence');
    }
  };

  const handleApproveAction = async (action: Action) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // If evidence exists, review evidence
    if (action.evidence_list && action.evidence_list.length > 0) {
      const pendingEv = action.evidence_list.find(e => e.review_status === 'PENDING') || action.evidence_list[0];
      try {
        await api.put(`/evidence/${pendingEv.evidence_id}/review`, {
          review_status: 'APPROVED',
          comments: 'Approved by authorized reviewer.'
        });
        setSuccessMessage(`Action ${action.code} evidence approved and marked COMPLETED!`);
        fetchActions();
        const updated = await api.get<Action>(`/actions/${action.action_id}`);
        setSelectedAction(updated.data);
      } catch (err: any) {
        setErrorMessage(err.response?.data?.detail || 'Action Approval Denied');
      }
    } else {
      // Update action directly
      try {
        await api.put(`/actions/${action.action_id}`, {
          status: 'COMPLETED',
          review_status: 'APPROVED'
        });
        setSuccessMessage(`Action ${action.code} marked COMPLETED!`);
        fetchActions();
        const updated = await api.get<Action>(`/actions/${action.action_id}`);
        setSelectedAction(updated.data);
      } catch (err: any) {
        setErrorMessage(err.response?.data?.detail || 'Action Approval Denied');
      }
    }
  };

  return (
    <Box p={3}>
      <EntityModelInspector
        entityName="ACTION CENTRE (UNIFIED ACTION ENTITY)"
        tableName="actions, evidence, findings, governance_reviews"
        primaryKey="action_id"
        foreignKeys={['finding_id (nullable)', 'governance_review_id (nullable)', 'owner_id', 'reviewer_id']}
        relationships={[
          'Multi-source: Action originates from FINDING or GOVERNANCE_REVIEW',
          'ACTION 1:N EVIDENCE',
          'Enforces self-approval restriction (Owner cannot approve own action)'
        ]}
        roleAccess="ACTION_OWNER (Assigned), AUDITOR, TC_MANAGER, ADMIN (Full)"
        relatedPage="Action Centre Workspace"
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TaskAltIcon sx={{ color: '#38bdf8' }} /> Enterprise Action Centre
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Unified workspace over corrective audit actions and governance review actions.
          </Typography>
        </Box>
      </Box>

      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: '1px solid #334155', '& .MuiTab-root': { color: '#94a3b8', fontWeight: 600 } }}
        >
          <Tab label="My Actions" />
          <Tab label="All Actions" />
          <Tab label="Overdue" />
          <Tab label="Pending Review" />
          <Tab label="Completed" />
        </Tabs>

        <Box p={2}>
          <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#0f172a' }}>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Source Origin</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Owner</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Due Date</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Review Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actions.map((act) => (
                <TableRow
                  key={act.action_id}
                  hover
                  onClick={() => setSelectedAction(act)}
                  sx={{ cursor: 'pointer', bgcolor: selectedAction?.action_id === act.action_id ? '#334155' : 'transparent' }}
                >
                  <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{act.code}</TableCell>
                  <TableCell>
                    {act.finding ? (
                      <Chip
                        icon={<LinkIcon sx={{ fontSize: '0.9rem !important' }} />}
                        label={`Finding: ${act.finding.code}`}
                        size="small"
                        onClick={(e) => { e.stopPropagation(); navigate('/audits'); }}
                        sx={{ bgcolor: '#0f172a', color: '#38bdf8', cursor: 'pointer' }}
                      />
                    ) : act.governance_review ? (
                      <Chip
                        icon={<LinkIcon sx={{ fontSize: '0.9rem !important' }} />}
                        label={`Gov Review: ${act.governance_review.review_number}`}
                        size="small"
                        onClick={(e) => { e.stopPropagation(); navigate('/governance-review'); }}
                        sx={{ bgcolor: '#0f172a', color: '#fbbf24', cursor: 'pointer' }}
                      />
                    ) : (
                      'Direct'
                    )}
                  </TableCell>
                  <TableCell>{act.description}</TableCell>
                  <TableCell>{act.owner?.full_name || 'N/A'}</TableCell>
                  <TableCell>{act.due_date}</TableCell>
                  <TableCell><StatusChip status={act.status} /></TableCell>
                  <TableCell><StatusChip status={act.review_status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Selected Action Inspector Panel */}
      {selectedAction && (
        <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #0284c7', borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                Action Inspector: [{selectedAction.code}]
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                {selectedAction.description}
              </Typography>
            </Box>
            <Box display="flex" gap={1.5}>
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => setUploadModalOpen(true)}
                sx={{ color: '#38bdf8', borderColor: '#38bdf8' }}
              >
                Upload Evidence
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleApproveAction(selectedAction)}
                sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
              >
                Approve & Complete
              </Button>
            </Box>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#94a3b8', mb: 1 }}>
            Uploaded Evidence Documents ({selectedAction.evidence_list?.length || 0})
          </Typography>
          {selectedAction.evidence_list?.map((ev) => (
            <Box key={ev.evidence_id} p={1.5} mb={1} sx={{ bgcolor: '#0f172a', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  {ev.file_name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Uploaded by {ev.uploaded_by?.full_name} | Status: {ev.review_status}
                </Typography>
              </Box>
              <StatusChip status={ev.review_status} />
            </Box>
          ))}
        </Paper>
      )}

      {/* Upload Evidence Dialog */}
      <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1e293b', color: '#f8fafc', fontWeight: 700 }}>Upload Evidence File</DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e293b' }}>
          <TextField
            label="File Name (e.g. Test_Log_v1.pdf)"
            fullWidth
            margin="dense"
            value={uploadFileName}
            onChange={(e) => setUploadFileName(e.target.value)}
            sx={{ input: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1e293b', p: 2 }}>
          <Button onClick={() => setUploadModalOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleUploadEvidence} variant="contained" sx={{ bgcolor: '#0284c7' }}>Upload File</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

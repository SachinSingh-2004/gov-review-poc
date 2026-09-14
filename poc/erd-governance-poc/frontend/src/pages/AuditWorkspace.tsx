import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import { StatusChip } from '../components/StatusChip';
import { EntityModelInspector } from '../components/EntityModelInspector';
import api from '../api/client';
import { Audit, Finding, Action, Evidence, User } from '../types';
import { useAuth } from '../context/AuthContext';

export const AuditWorkspace: React.FC = () => {
  const { currentUser } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  // New Finding Dialog state
  const [createFindingOpen, setCreateFindingOpen] = useState(false);
  const [newFindingTitle, setNewFindingTitle] = useState('');
  const [newFindingDesc, setNewFindingDesc] = useState('');
  const [newFindingSeverity, setNewFindingSeverity] = useState('MAJOR');
  const [newFindingOwner, setNewFindingOwner] = useState('');
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchAudits();
    fetchUsers();
  }, []);

  const fetchAudits = async () => {
    try {
      const res = await api.get<Audit[]>('/audits');
      setAudits(res.data);
      if (res.data.length > 0 && !selectedAudit) {
        loadAuditDetails(res.data[0].audit_id);
      }
    } catch (err) {
      console.error('Failed to fetch audits', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>('/users');
      setDemoUsers(res.data);
      if (res.data.length > 0) setNewFindingOwner(res.data[0].user_id);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const loadAuditDetails = async (auditId: string) => {
    try {
      const res = await api.get<Audit>(`/audits/${auditId}`);
      setSelectedAudit(res.data);
      setSelectedFinding(null);
      setSelectedAction(null);
    } catch (err) {
      console.error('Failed to load audit details', err);
    }
  };

  const loadFindingDetails = async (findingId: string) => {
    try {
      const res = await api.get<Finding>(`/findings/${findingId}`);
      setSelectedFinding(res.data);
    } catch (err) {
      console.error('Failed to load finding details', err);
    }
  };

  const loadActionDetails = async (actionId: string) => {
    try {
      const res = await api.get<Action>(`/actions/${actionId}`);
      setSelectedAction(res.data);
    } catch (err) {
      console.error('Failed to load action details', err);
    }
  };

  const handleCreateFindingSubmit = async () => {
    if (!selectedAudit) return;
    try {
      await api.post('/findings', {
        audit_id: selectedAudit.audit_id,
        code: `FND-${Math.floor(100 + Math.random() * 900)}`,
        title: newFindingTitle,
        description: newFindingDesc,
        severity: newFindingSeverity,
        owner_id: newFindingOwner,
        due_date: '2026-10-30'
      });
      setCreateFindingOpen(false);
      setNewFindingTitle('');
      setNewFindingDesc('');
      loadAuditDetails(selectedAudit.audit_id);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create finding');
    }
  };

  return (
    <Box p={3}>
      <EntityModelInspector
        entityName="AUDIT -> FINDING -> ACTION -> EVIDENCE"
        tableName="audits, findings, actions, evidence, audit_participants"
        primaryKey="audit_id, finding_id, action_id, evidence_id"
        foreignKeys={['project_id', 'lead_auditor_id', 'audit_id', 'finding_id', 'action_id']}
        relationships={[
          'PROJECT 1:N AUDIT',
          'AUDIT 1:N FINDING',
          'FINDING 1:N ACTION',
          'ACTION 1:N EVIDENCE',
          'AUDIT N:M USER via AUDIT_PARTICIPANT'
        ]}
        roleAccess="AUDITOR, AUDIT_MANAGER (Full), PM / TECH_LEAD (Read-Only Authorized Scope)"
        relatedPage="Audit Workspace"
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedUserIcon sx={{ color: '#38bdf8' }} /> Audit & Compliance Workspace
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Browse quality audits, non-conformance findings, corrective actions, and evidence verification.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Audit List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8', mb: 2 }}>
              Quality & Safety Audits
            </Typography>
            {audits.map((a) => {
              const isSelected = selectedAudit?.audit_id === a.audit_id;
              return (
                <Box
                  key={a.audit_id}
                  p={2}
                  mb={1.5}
                  onClick={() => loadAuditDetails(a.audit_id)}
                  sx={{
                    bgcolor: isSelected ? '#0284c7' : '#0f172a',
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: isSelected ? '#0284c7' : '#1e293b' }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                      {a.code}
                    </Typography>
                    <StatusChip status={a.status} />
                  </Box>
                  <Typography variant="body2" sx={{ color: isSelected ? '#e0f2fe' : '#cbd5e1', fontWeight: 600 }}>
                    {a.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isSelected ? '#bae6fd' : '#64748b', display: 'block', mt: 0.5 }}>
                    Project: {a.project?.name || 'N/A'} | Auditor: {a.lead_auditor?.full_name || 'N/A'}
                  </Typography>
                </Box>
              );
            })}
          </Paper>
        </Grid>

        {/* Right Column: Audit Detail & Hierarchy Navigation */}
        <Grid item xs={12} md={8}>
          {selectedAudit ? (
            <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    [{selectedAudit.code}] {selectedAudit.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Type: {selectedAudit.audit_type} | Target Project: {selectedAudit.project?.name}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => setCreateFindingOpen(true)}
                  sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
                >
                  New Finding
                </Button>
              </Box>

              <Box display="flex" gap={2} mb={3}>
                <Chip label={`Lead Auditor: ${selectedAudit.lead_auditor?.full_name}`} size="small" sx={{ bgcolor: '#0f172a', color: '#cbd5e1' }} />
                <Chip label={`Dates: ${selectedAudit.start_date} to ${selectedAudit.end_date}`} size="small" sx={{ bgcolor: '#0f172a', color: '#cbd5e1' }} />
                <Chip label={`Participants: ${selectedAudit.participants?.length || 0}`} size="small" sx={{ bgcolor: '#0f172a', color: '#cbd5e1' }} />
              </Box>

              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8', mb: 1.5 }}>
                Audit Findings ({selectedAudit.findings?.length || 0})
              </Typography>

              <Table size="small" sx={{ mb: 3, '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#0f172a' }}>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Finding Code</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Severity</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Owner</TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedAudit.findings?.map((f) => (
                    <TableRow
                      key={f.finding_id}
                      hover
                      onClick={() => loadFindingDetails(f.finding_id)}
                      sx={{ cursor: 'pointer', bgcolor: selectedFinding?.finding_id === f.finding_id ? '#334155' : 'transparent' }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{f.code}</TableCell>
                      <TableCell>{f.title}</TableCell>
                      <TableCell><StatusChip status={f.severity} type="severity" /></TableCell>
                      <TableCell>{f.owner?.full_name || 'N/A'}</TableCell>
                      <TableCell><StatusChip status={f.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Finding Detail Sub-Panel */}
              {selectedFinding && (
                <Paper sx={{ p: 2.5, backgroundColor: '#0f172a', border: '1px solid #0284c7', borderRadius: 2, mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8', mb: 1 }}>
                    Finding Detail: [{selectedFinding.code}] {selectedFinding.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                    {selectedFinding.description}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc', mb: 1 }}>
                    Corrective Actions ({selectedFinding.actions?.length || 0})
                  </Typography>

                  {selectedFinding.actions?.map((act) => (
                    <Box
                      key={act.action_id}
                      p={1.5}
                      mb={1}
                      onClick={() => loadActionDetails(act.action_id)}
                      sx={{
                        bgcolor: selectedAction?.action_id === act.action_id ? '#1e293b' : '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 1,
                        cursor: 'pointer'
                      }}
                    >
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                          {act.code}: {act.description}
                        </Typography>
                        <StatusChip status={act.status} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                        Owner: {act.owner?.full_name} | Review: {act.review_status} | Due: {act.due_date}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              )}

              {/* Action Detail & Evidence Sub-Panel */}
              {selectedAction && (
                <Paper sx={{ p: 2.5, backgroundColor: '#0f172a', border: '1px solid #10b981', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#10b981', mb: 1 }}>
                    Action & Evidence Inspector: [{selectedAction.code}]
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 2 }}>
                    {selectedAction.description}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc', mb: 1 }}>
                    Attached Evidence ({selectedAction.evidence_list?.length || 0})
                  </Typography>

                  {selectedAction.evidence_list?.map((ev) => (
                    <Box key={ev.evidence_id} p={1.5} sx={{ bgcolor: '#1e293b', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DescriptionIcon sx={{ color: '#38bdf8' }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                            {ev.file_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                            Uploaded by {ev.uploaded_by?.full_name} on {new Date(ev.uploaded_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <StatusChip status={ev.review_status} />
                    </Box>
                  ))}
                </Paper>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#1e293b', color: '#94a3b8' }}>
              Select an audit from the left list to view details and findings.
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* New Finding Dialog */}
      <Dialog open={createFindingOpen} onClose={() => setCreateFindingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1e293b', color: '#f8fafc', fontWeight: 700 }}>Create New Audit Finding</DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e293b' }}>
          <TextField
            label="Finding Title"
            fullWidth
            margin="dense"
            value={newFindingTitle}
            onChange={(e) => setNewFindingTitle(e.target.value)}
            sx={{ input: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            margin="dense"
            value={newFindingDesc}
            onChange={(e) => setNewFindingDesc(e.target.value)}
            sx={{ textarea: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          />
          <TextField
            select
            label="Severity"
            fullWidth
            margin="dense"
            value={newFindingSeverity}
            onChange={(e) => setNewFindingSeverity(e.target.value)}
            sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          >
            <MenuItem value="CRITICAL">CRITICAL</MenuItem>
            <MenuItem value="MAJOR">MAJOR</MenuItem>
            <MenuItem value="MINOR">MINOR</MenuItem>
          </TextField>
          <TextField
            select
            label="Accountable Owner"
            fullWidth
            margin="dense"
            value={newFindingOwner}
            onChange={(e) => setNewFindingOwner(e.target.value)}
            sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          >
            {demoUsers.map((u) => (
              <MenuItem key={u.user_id} value={u.user_id}>{u.full_name} ({u.roles[0]?.name})</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1e293b', p: 2 }}>
          <Button onClick={() => setCreateFindingOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleCreateFindingSubmit} variant="contained" sx={{ bgcolor: '#0284c7' }}>Create Finding</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

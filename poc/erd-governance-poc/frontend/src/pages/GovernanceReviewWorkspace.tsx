import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, TextField, MenuItem, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow,
  Alert, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { StatusChip } from '../components/StatusChip';
import { EntityModelInspector } from '../components/EntityModelInspector';
import api from '../api/client';
import { GovernanceReview, Project, Finding, Risk, Action, User } from '../types';
import { useAuth } from '../context/AuthContext';

export const GovernanceReviewWorkspace: React.FC = () => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<GovernanceReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<GovernanceReview | null>(null);
  const [projectContext, setProjectContext] = useState<Project | null>(null);
  const [openRisks, setOpenRisks] = useState<Risk[]>([]);
  const [openFindings, setOpenFindings] = useState<Finding[]>([]);
  const [tabValue, setTabValue] = useState(0);

  // PM Update State
  const [pmChanged, setPmChanged] = useState('');
  const [pmSupport, setPmSupport] = useState('');
  const [pmDecisions, setPmDecisions] = useState('');
  const [pmExecActions, setPmExecActions] = useState('');

  // Assessment State
  const [assDeliveryHealth, setAssDeliveryHealth] = useState('AMBER');
  const [assEngineeringHealth, setAssEngineeringHealth] = useState('GREEN');
  const [assDeliveryScore, setAssDeliveryScore] = useState(3);
  const [assEngineeringScore, setAssEngineeringScore] = useState(4);
  const [assComments, setAssComments] = useState('');

  // Dialog States
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decTitle, setDecTitle] = useState('');
  const [decDesc, setDecDesc] = useState('');
  const [decOwner, setDecOwner] = useState('');

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actCode, setActCode] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actOwner, setActOwner] = useState('');

  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetchReviews();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>('/users');
      setDemoUsers(res.data);
      if (res.data.length > 0) {
        setDecOwner(res.data[0].user_id);
        setActOwner(res.data[0].user_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get<GovernanceReview[]>('/governance-reviews');
      setReviews(res.data);
      if (res.data.length > 0 && !selectedReview) {
        loadReviewDetails(res.data[0].review_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadReviewDetails = async (reviewId: string) => {
    try {
      const res = await api.get<GovernanceReview>(`/governance-reviews/${reviewId}`);
      setSelectedReview(res.data);

      if (res.data.pm_update) {
        setPmChanged(res.data.pm_update.what_changed || '');
        setPmSupport(res.data.pm_update.support_required || '');
        setPmDecisions(res.data.pm_update.pending_decisions || '');
        setPmExecActions(res.data.pm_update.executive_actions || '');
      }

      if (res.data.assessment) {
        setAssDeliveryHealth(res.data.assessment.delivery_health || 'AMBER');
        setAssEngineeringHealth(res.data.assessment.engineering_health || 'GREEN');
        setAssDeliveryScore(res.data.assessment.delivery_score || 3);
        setAssEngineeringScore(res.data.assessment.engineering_score || 4);
        setAssComments(res.data.assessment.comments || '');
      }

      if (res.data.project_id) {
        const prjRes = await api.get<Project>(`/projects/${res.data.project_id}`);
        setProjectContext(prjRes.data);

        const rkRes = await api.get<Risk[]>(`/risks?project_id=${res.data.project_id}`);
        setOpenRisks(rkRes.data.filter(r => r.status === 'OPEN'));

        const fndRes = await api.get<Finding[]>(`/findings?project_id=${res.data.project_id}`);
        setOpenFindings(fndRes.data.filter(f => f.status !== 'CLOSED'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePMUpdate = async () => {
    if (!selectedReview) return;
    setAlertMsg(null);
    try {
      await api.post(`/governance-reviews/${selectedReview.review_id}/pm-update`, {
        what_changed: pmChanged,
        support_required: pmSupport,
        pending_decisions: pmDecisions,
        executive_actions: pmExecActions
      });
      setAlertMsg({ type: 'success', msg: 'PM Update saved successfully!' });
      loadReviewDetails(selectedReview.review_id);
    } catch (err: any) {
      setAlertMsg({ type: 'error', msg: err.response?.data?.detail || 'Failed to save PM update' });
    }
  };

  const handleSaveAssessment = async () => {
    if (!selectedReview) return;
    setAlertMsg(null);
    try {
      await api.post(`/governance-reviews/${selectedReview.review_id}/assessment`, {
        delivery_health: assDeliveryHealth,
        engineering_health: assEngineeringHealth,
        delivery_score: Number(assDeliveryScore),
        engineering_score: Number(assEngineeringScore),
        overall_score: Math.round((Number(assDeliveryScore) + Number(assEngineeringScore)) / 2),
        comments: assComments
      });
      setAlertMsg({ type: 'success', msg: 'TC Assessment saved! Overall Review Health updated.' });
      loadReviewDetails(selectedReview.review_id);
    } catch (err: any) {
      setAlertMsg({ type: 'error', msg: err.response?.data?.detail || 'Failed to save assessment' });
    }
  };

  const handleCreateDecision = async () => {
    if (!selectedReview || !decTitle) return;
    try {
      await api.post(`/governance-reviews/${selectedReview.review_id}/decisions`, {
        title: decTitle,
        description: decDesc,
        owner_id: decOwner,
        due_date: '2026-09-30',
        status: 'PENDING'
      });
      setDecisionModalOpen(false);
      setDecTitle('');
      setDecDesc('');
      loadReviewDetails(selectedReview.review_id);
    } catch (err: any) {
      setAlertMsg({ type: 'error', msg: err.response?.data?.detail || 'Failed to create decision' });
    }
  };

  const handleCreateGovAction = async () => {
    if (!selectedReview || !actDesc) return;
    try {
      await api.post(`/governance-reviews/${selectedReview.review_id}/actions`, {
        code: actCode || `GOV-ACT-${Math.floor(100 + Math.random() * 900)}`,
        description: actDesc,
        owner_id: actOwner,
        due_date: '2026-09-30',
        priority: 'HIGH'
      });
      setActionModalOpen(false);
      setActDesc('');
      loadReviewDetails(selectedReview.review_id);
    } catch (err: any) {
      setAlertMsg({ type: 'error', msg: err.response?.data?.detail || 'Failed to create governance action' });
    }
  };

  const handleCompleteReview = async () => {
    if (!selectedReview) return;
    setAlertMsg(null);
    try {
      await api.put(`/governance-reviews/${selectedReview.review_id}/complete`);
      setAlertMsg({ type: 'success', msg: 'Governance Review marked COMPLETED! Project overall health updated.' });
      fetchReviews();
      loadReviewDetails(selectedReview.review_id);
    } catch (err: any) {
      setAlertMsg({ type: 'error', msg: err.response?.data?.detail || 'Failed to complete review' });
    }
  };

  return (
    <Box p={3}>
      <EntityModelInspector
        entityName="GOVERNANCE REVIEW WORKFLOW"
        tableName="governance_reviews, pm_updates, governance_assessments, governance_decisions, actions"
        primaryKey="review_id, update_id, assessment_id, decision_id, action_id"
        foreignKeys={['project_id', 'previous_review_id', 'technology_center_manager_id', 'submitted_by_id', 'assessed_by_id']}
        relationships={[
          'GOVERNANCE_REVIEW 1:0..1 PM_UPDATE',
          'GOVERNANCE_REVIEW 1:0..1 GOVERNANCE_ASSESSMENT',
          'GOVERNANCE_REVIEW 1:N GOVERNANCE_DECISION',
          'GOVERNANCE_REVIEW 1:N ACTION (Governance generated)',
          'GOVERNANCE_REVIEW 1:0..1 GOVERNANCE_REVIEW (previous_review self-reference)'
        ]}
        roleAccess="TC_MANAGER (Complete Review), PM (Submit Update), EXECUTIVE, ADMIN"
        relatedPage="Governance Review Workspace"
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
            <GavelIcon sx={{ color: '#38bdf8' }} /> R&D Governance Gate Review Workspace
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Structured stage-gate review flow: Health &rarr; PM Update &rarr; TC Assessment &rarr; Decisions &rarr; Actions &rarr; Complete.
          </Typography>
        </Box>
      </Box>

      {alertMsg && (
        <Alert severity={alertMsg.type} onClose={() => setAlertMsg(null)} sx={{ mb: 3 }}>
          {alertMsg.msg}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Reviews List & Previous Review History */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8', mb: 2 }}>
              Governance Reviews
            </Typography>
            {reviews.map((r) => {
              const isSelected = selectedReview?.review_id === r.review_id;
              return (
                <Box
                  key={r.review_id}
                  p={2}
                  mb={1.5}
                  onClick={() => loadReviewDetails(r.review_id)}
                  sx={{
                    bgcolor: isSelected ? '#0284c7' : '#0f172a',
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#ffffff' }}>
                      {r.review_number}
                    </Typography>
                    <StatusChip status={r.review_status} />
                  </Box>
                  <Typography variant="body2" sx={{ color: isSelected ? '#e0f2fe' : '#cbd5e1', fontWeight: 600 }}>
                    Project: {r.project?.name || 'N/A'}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Typography variant="caption" sx={{ color: isSelected ? '#bae6fd' : '#64748b' }}>
                      Date: {r.review_date}
                    </Typography>
                    <StatusChip status={r.overall_health_status} type="health" />
                  </Box>
                  {r.previous_review_id && (
                    <Box mt={1} pt={1} sx={{ borderTop: '1px dashed #334155', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <HistoryIcon sx={{ fontSize: '0.85rem', color: '#fbbf24' }} />
                      <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 600 }}>
                        Prior Review Self-Reference Linked
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Paper>
        </Grid>

        {/* Right Column: Interactive Step-by-Step Review Workspace */}
        <Grid item xs={12} md={8}>
          {selectedReview ? (
            <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
              {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                    Review: {selectedReview.review_number}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Project: {selectedReview.project?.name} | Manager: {selectedReview.technology_center_manager?.full_name}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <StatusChip status={selectedReview.overall_health_status} type="health" size="medium" />
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleCompleteReview}
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                  >
                    Complete Review
                  </Button>
                </Box>
              </Box>

              {/* Navigation Tabs */}
              <Tabs
                value={tabValue}
                onChange={(_, val) => setTabValue(val)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ borderBottom: '1px solid #334155', mb: 3, '& .MuiTab-root': { color: '#94a3b8', fontWeight: 600 } }}
              >
                <Tab label="1. Project Health Context" />
                <Tab label="2. PM Update" />
                <Tab label="3. TC Assessment" />
                <Tab label={`4. Leadership Decisions (${selectedReview.decisions?.length || 0})`} />
                <Tab label={`5. Governance Actions (${selectedReview.governance_actions?.length || 0})`} />
              </Tabs>

              {/* Tab 1: Live Derived Project Health */}
              {tabValue === 0 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8', mb: 2 }}>
                    Live Project Health Context (Derived from Entities)
                  </Typography>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ bgcolor: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}>
                        <CardContent><Typography variant="caption" sx={{ color: '#94a3b8' }}>Open Risks</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: '#ef4444' }}>{openRisks.length}</Typography></CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ bgcolor: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}>
                        <CardContent><Typography variant="caption" sx={{ color: '#94a3b8' }}>Open Audit Findings</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b' }}>{openFindings.length}</Typography></CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ bgcolor: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}>
                        <CardContent><Typography variant="caption" sx={{ color: '#94a3b8' }}>Current Phase</Typography><Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8' }}>{projectContext?.current_phase?.name}</Typography></CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card sx={{ bgcolor: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}>
                        <CardContent><Typography variant="caption" sx={{ color: '#94a3b8' }}>Review Status</Typography><Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#10b981' }}>{selectedReview.review_status}</Typography></CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {selectedReview.previous_review_id && (
                    <Alert severity="info" sx={{ bgcolor: '#0f172a', color: '#cbd5e1', border: '1px solid #0284c7' }}>
                      Prior Review Link: REV-AUTO-2026-06 (June Review) - Previous Overall Health: GREEN.
                    </Alert>
                  )}
                </Box>
              )}

              {/* Tab 2: PM Update */}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8', mb: 2 }}>
                    PM Update Submission (Project Manager)
                  </Typography>
                  <TextField label="What Changed Since Last Review?" fullWidth multiline rows={2} margin="dense" value={pmChanged} onChange={(e) => setPmChanged(e.target.value)} sx={{ textarea: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />
                  <TextField label="Support Required from Leadership" fullWidth multiline rows={2} margin="dense" value={pmSupport} onChange={(e) => setPmSupport(e.target.value)} sx={{ textarea: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />
                  <TextField label="Pending Key Decisions" fullWidth multiline rows={2} margin="dense" value={pmDecisions} onChange={(e) => setPmDecisions(e.target.value)} sx={{ textarea: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />
                  <TextField label="Executive Actions Required" fullWidth multiline rows={2} margin="dense" value={pmExecActions} onChange={(e) => setPmExecActions(e.target.value)} sx={{ textarea: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />

                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button variant="contained" onClick={handleSavePMUpdate} sx={{ bgcolor: '#0284c7' }}>
                      Save PM Update
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Tab 3: Technology Center Assessment */}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8', mb: 2 }}>
                    Technology Center Manager Assessment
                  </Typography>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <TextField select label="Delivery Health" fullWidth value={assDeliveryHealth} onChange={(e) => setAssDeliveryHealth(e.target.value)} sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}>
                        <MenuItem value="GREEN">GREEN</MenuItem><MenuItem value="AMBER">AMBER</MenuItem><MenuItem value="RED">RED</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField select label="Engineering Health" fullWidth value={assEngineeringHealth} onChange={(e) => setAssEngineeringHealth(e.target.value)} sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}>
                        <MenuItem value="GREEN">GREEN</MenuItem><MenuItem value="AMBER">AMBER</MenuItem><MenuItem value="RED">RED</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="Delivery Score (1-5)" type="number" fullWidth value={assDeliveryScore} onChange={(e) => setAssDeliveryScore(Number(e.target.value))} sx={{ input: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField label="Engineering Score (1-5)" type="number" fullWidth value={assEngineeringScore} onChange={(e) => setAssEngineeringScore(Number(e.target.value))} sx={{ input: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />
                    </Grid>
                  </Grid>
                  <TextField label="Assessment Comments & Rationale" fullWidth multiline rows={3} value={assComments} onChange={(e) => setAssComments(e.target.value)} sx={{ textarea: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />

                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button variant="contained" onClick={handleSaveAssessment} sx={{ bgcolor: '#0284c7' }}>
                      Save Assessment
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Tab 4: Leadership Decisions */}
              {tabValue === 3 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                      Leadership Decisions & Directives
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => setDecisionModalOpen(true)} sx={{ bgcolor: '#0284c7' }}>
                      Add Decision
                    </Button>
                  </Box>

                  <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
                    <TableHead><TableRow sx={{ bgcolor: '#0f172a' }}><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Decision Title</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Description</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Owner</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
                    <TableBody>
                      {selectedReview.decisions?.map((d) => (
                        <TableRow key={d.decision_id}>
                          <TableCell sx={{ fontWeight: 700, color: '#f8fafc' }}>{d.title}</TableCell>
                          <TableCell>{d.description}</TableCell>
                          <TableCell>{d.owner?.full_name}</TableCell>
                          <TableCell><StatusChip status={d.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {/* Tab 5: Governance Actions */}
              {tabValue === 4 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                      Governance Actions Generated
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => setActionModalOpen(true)} sx={{ bgcolor: '#0284c7' }}>
                      Add Governance Action
                    </Button>
                  </Box>

                  <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
                    <TableHead><TableRow sx={{ bgcolor: '#0f172a' }}><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Action Code</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Description</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Owner</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
                    <TableBody>
                      {selectedReview.governance_actions?.map((act) => (
                        <TableRow key={act.action_id}>
                          <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{act.code}</TableCell>
                          <TableCell>{act.description}</TableCell>
                          <TableCell>{act.owner?.full_name}</TableCell>
                          <TableCell><StatusChip status={act.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: '#1e293b', color: '#94a3b8' }}>
              Select a governance review to begin review workflow.
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Decision Modal */}
      <Dialog open={decisionModalOpen} onClose={() => setDecisionModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1e293b', color: '#f8fafc', fontWeight: 700 }}>Create Leadership Decision</DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e293b' }}>
          <TextField label="Decision Title" fullWidth margin="dense" value={decTitle} onChange={(e) => setDecTitle(e.target.value)} sx={{ input: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />
          <TextField label="Description" fullWidth multiline rows={2} margin="dense" value={decDesc} onChange={(e) => setDecDesc(e.target.value)} sx={{ textarea: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />
          <TextField select label="Decision Owner" fullWidth margin="dense" value={decOwner} onChange={(e) => setDecOwner(e.target.value)} sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}>
            {demoUsers.map(u => <MenuItem key={u.user_id} value={u.user_id}>{u.full_name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1e293b', p: 2 }}>
          <Button onClick={() => setDecisionModalOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleCreateDecision} variant="contained" sx={{ bgcolor: '#0284c7' }}>Create Decision</Button>
        </DialogActions>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onClose={() => setActionModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1e293b', color: '#f8fafc', fontWeight: 700 }}>Create Governance Action</DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e293b' }}>
          <TextField label="Action Code (e.g. GOV-ACT-003)" fullWidth margin="dense" value={actCode} onChange={(e) => setActCode(e.target.value)} sx={{ input: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />
          <TextField label="Description" fullWidth multiline rows={2} margin="dense" value={actDesc} onChange={(e) => setActDesc(e.target.value)} sx={{ textarea: { color: '#f8fafc' }, label: { color: '#94a3b8' } }} />
          <TextField select label="Assignee Owner" fullWidth margin="dense" value={actOwner} onChange={(e) => setActOwner(e.target.value)} sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}>
            {demoUsers.map(u => <MenuItem key={u.user_id} value={u.user_id}>{u.full_name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1e293b', p: 2 }}>
          <Button onClick={() => setActionModalOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleCreateGovAction} variant="contained" sx={{ bgcolor: '#0284c7' }}>Create Action</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

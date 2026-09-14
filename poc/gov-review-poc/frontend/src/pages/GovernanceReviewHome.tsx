import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, Button, TextField,
  MenuItem, Alert, Table, TableBody, TableCell, TableHead, TableRow,
  AppBar, Toolbar, Divider, Select, FormControl, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { GovernanceReview, ProjectHealth, TechnicalAssessment, Audit, Risk, Project } from '../types';

export const GovernanceReviewHome: React.FC = () => {
  const { currentUser, roleCode, logout } = useAuth();

  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(1);
  const [project, setProject] = useState<Project | null>(null);

  const [review, setReview] = useState<GovernanceReview | null>(null);
  const [health, setHealth] = useState<ProjectHealth | null>(null);
  const [assessment, setAssessment] = useState<TechnicalAssessment | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);

  // PM Project Health Edit State
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [editSchedHealth, setEditSchedHealth] = useState<string>('GREEN');
  const [editBudgetStatus, setEditBudgetStatus] = useState<string>('GREEN');
  const [editOverallHealth, setEditOverallHealth] = useState<string>('AMBER');

  // TL Technical Assessment Edit State
  const [isEditingAssessment, setIsEditingAssessment] = useState(false);
  const [editScore, setEditScore] = useState<number>(4);
  const [editTechHealth, setEditTechHealth] = useState<string>('AMBER');
  const [editComments, setEditComments] = useState<string>('');

  // Dialog Modals
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [newAuditName, setNewAuditName] = useState('');
  const [newAuditType, setNewAuditType] = useState('Quality');

  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [newRiskTitle, setNewRiskTitle] = useState('');
  const [newRiskImpact, setNewRiskImpact] = useState('MEDIUM');

  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isTL = roleCode === 'TL';
  const isPM = roleCode === 'PM';

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectData(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchAssignedProjects = async () => {
    try {
      const res = await api.get<Project[]>('/users/me/projects');
      setMyProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProjectId(res.data[0].project_id);
      }
    } catch (err) {
      console.error('Failed to fetch assigned projects', err);
    }
  };

  const loadProjectData = async (projId: number) => {
    setIsEditingHealth(false);
    setIsEditingAssessment(false);
    try {
      const projRes = await api.get<Project>(`/projects/${projId}`);
      setProject(projRes.data);

      const revRes = await api.get<GovernanceReview[]>(`/projects/${projId}/governance-reviews`);
      if (revRes.data.length > 0) {
        const activeRev = revRes.data[0];
        setReview(activeRev);

        const healthRes = await api.get<ProjectHealth>(`/governance-reviews/${activeRev.governance_review_id}/health`);
        setHealth(healthRes.data);
        setEditSchedHealth(healthRes.data.schedule_health);
        setEditBudgetStatus(healthRes.data.budget_status);
        setEditOverallHealth(healthRes.data.overall_health);

        const assRes = await api.get<TechnicalAssessment>(`/governance-reviews/${activeRev.governance_review_id}/technical-assessment`);
        setAssessment(assRes.data);
        setEditScore(assRes.data.technical_readiness_score);
        setEditTechHealth(assRes.data.technical_health);
        setEditComments(assRes.data.comments || '');
      }

      const audRes = await api.get<Audit[]>(`/projects/${projId}/audits`);
      setAudits(audRes.data);

      const rkRes = await api.get<Risk[]>(`/projects/${projId}/risks`);
      setRisks(rkRes.data);
    } catch (err) {
      console.error('Failed to load project data', err);
    }
  };

  const handleSaveHealth = async () => {
    if (!review) return;
    setAlertMessage(null);
    try {
      const res = await api.put<ProjectHealth>(`/governance-reviews/${review.governance_review_id}/health`, {
        schedule_health: editSchedHealth,
        budget_status: editBudgetStatus,
        overall_health: editOverallHealth
      });
      setHealth(res.data);
      setIsEditingHealth(false);
      setAlertMessage({ type: 'success', text: 'Project Health updated and saved to database!' });
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update Project Health.' });
    }
  };

  const handleSaveAssessment = async () => {
    if (!review) return;
    setAlertMessage(null);
    try {
      const res = await api.put<TechnicalAssessment>(`/governance-reviews/${review.governance_review_id}/technical-assessment`, {
        technical_readiness_score: Number(editScore),
        technical_health: editTechHealth,
        comments: editComments
      });
      setAssessment(res.data);
      setIsEditingAssessment(false);
      setAlertMessage({ type: 'success', text: 'Technical Assessment updated and saved to database!' });
      loadProjectData(selectedProjectId);
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update Technical Assessment.' });
    }
  };

  const handleCreateAudit = async () => {
    if (!newAuditName) return;
    try {
      await api.post(`/projects/${selectedProjectId}/audits`, {
        audit_name: newAuditName,
        audit_type: newAuditType,
        audit_status: 'IN_PROGRESS',
        planned_date: '2026-10-15'
      });
      setAuditModalOpen(false);
      setNewAuditName('');
      loadProjectData(selectedProjectId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create audit');
    }
  };

  const handleCreateRisk = async () => {
    if (!newRiskTitle) return;
    try {
      await api.post(`/projects/${selectedProjectId}/risks`, {
        title: newRiskTitle,
        status: 'OPEN',
        impact: newRiskImpact,
        probability: 'MEDIUM'
      });
      setRiskModalOpen(false);
      setNewRiskTitle('');
      loadProjectData(selectedProjectId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create risk');
    }
  };

  return (
    <Box minHeight="100vh" sx={{ bgcolor: '#0f172a', color: '#f8fafc' }}>
      {/* Top Header */}
      <AppBar position="static" sx={{ background: '#1e293b', borderBottom: '1px solid #334155', elevation: 0 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <GavelIcon sx={{ color: '#38bdf8' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8' }}>
              Governance Review Portal
            </Typography>
            <Chip label="Demo Environment — Not for Production" color="warning" size="small" sx={{ fontWeight: 700 }} />
          </Box>

          {currentUser && (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                User: <strong>{currentUser.display_name}</strong>
              </Typography>
              <Chip
                label={roleCode === 'PM' ? 'Project Manager (PM)' : 'Technical Lead (TL)'}
                color={roleCode === 'PM' ? 'primary' : 'success'}
                sx={{ fontWeight: 700 }}
              />

              {/* Dynamic Project Dropdown */}
              <Box display="flex" alignItems="center" gap={1}>
                <FolderSpecialIcon sx={{ color: '#38bdf8', fontSize: 20 }} />
                <FormControl size="small" sx={{ minWidth: 240 }}>
                  <Select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                    sx={{
                      color: '#f8fafc',
                      backgroundColor: '#0f172a',
                      borderRadius: 1,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      '& .MuiSelect-icon': { color: '#94a3b8' }
                    }}
                  >
                    {myProjects.map((p) => (
                      <MenuItem key={p.project_id} value={p.project_id}>
                        {p.project_code}: {p.project_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{ textTransform: 'none', ml: 1 }}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box p={3} maxWidth={1280} mx="auto">
        {alertMessage && (
          <Alert severity={alertMessage.type} onClose={() => setAlertMessage(null)} sx={{ mb: 3 }}>
            {alertMessage.text}
          </Alert>
        )}

        {/* Project & Review Header */}
        <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ color: '#38bdf8', letterSpacing: 1.2, fontWeight: 700 }}>
                ACTIVE PROJECT GOVERNANCE REVIEW
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', mt: 0.5 }}>
                [{project?.project_code}] {project?.project_name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Review Number: <strong>{review?.review_number}</strong> | Date: <strong>{review?.review_date}</strong> | Status: <strong>{review?.review_status}</strong>
              </Typography>
            </Box>
            <Chip
              label={`Overall Health: ${health?.overall_health || 'AMBER'}`}
              color={health?.overall_health === 'GREEN' ? 'success' : health?.overall_health === 'RED' ? 'error' : 'warning'}
              sx={{ fontWeight: 800, fontSize: '0.9rem', p: 1 }}
            />
          </Box>
        </Paper>

        <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8', mb: 1 }}>
          PRIMARY GOVERNANCE REVIEW COMPONENTS
        </Typography>

        <Alert severity={isPM ? 'info' : 'success'} icon={false} sx={{ mb: 3, bgcolor: '#1e293b', color: '#cbd5e1', border: `1px solid ${isPM ? '#0284c7' : '#10b981'}` }}>
          {isPM ? (
            <Typography variant="body2">
              <strong>Role Context — Project Manager (PM):</strong> You have edit rights for <strong>Project Health</strong> (Schedule, Budget, Overall). <em>Technical Assessment</em> is read-only (managed by Technical Lead).
            </Typography>
          ) : (
            <Typography variant="body2">
              <strong>Role Context — Technical Lead (TL):</strong> You have edit rights for <strong>Technical Assessment</strong> (Readiness Score, Technical Health, Comments). <em>Project Health</em> is read-only (managed by Project Manager).
            </Typography>
          )}
        </Alert>

        <Grid container spacing={3} mb={4}>
          {/* Card 1: Project Health (PM Edit Enabled, TL View Only) */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  Project Health (PM Managed)
                </Typography>

                {!isPM ? (
                  <Chip
                    icon={<LockIcon sx={{ fontSize: '0.9rem !important' }} />}
                    label="View Only for TL"
                    size="small"
                    sx={{ bgcolor: '#334155', color: '#cbd5e1', fontWeight: 700 }}
                  />
                ) : !isEditingHealth ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditingHealth(true)}
                    sx={{ color: '#38bdf8', borderColor: '#38bdf8' }}
                  >
                    Edit Health
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveHealth}
                    sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
                  >
                    Save
                  </Button>
                )}
              </Box>

              {!isPM || !isEditingHealth ? (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box p={1.5} sx={{ bgcolor: '#0f172a', borderRadius: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Schedule Health</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: health?.schedule_health === 'GREEN' ? '#10b981' : health?.schedule_health === 'RED' ? '#ef4444' : '#f59e0b' }}>
                        {health?.schedule_health}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box p={1.5} sx={{ bgcolor: '#0f172a', borderRadius: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Budget Status</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: health?.budget_status === 'GREEN' ? '#10b981' : health?.budget_status === 'RED' ? '#ef4444' : '#f59e0b' }}>
                        {health?.budget_status}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box p={1.5} sx={{ bgcolor: '#0f172a', borderRadius: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Open Risks</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                        {health?.open_risk_count}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box p={1.5} sx={{ bgcolor: '#0f172a', borderRadius: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Open Findings</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ef4444' }}>
                        {health?.open_finding_count}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Box>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <TextField
                        select
                        label="Schedule Health"
                        fullWidth
                        size="small"
                        value={editSchedHealth}
                        onChange={(e) => setEditSchedHealth(e.target.value)}
                        sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
                      >
                        <MenuItem value="GREEN">GREEN</MenuItem>
                        <MenuItem value="AMBER">AMBER</MenuItem>
                        <MenuItem value="RED">RED</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        select
                        label="Budget Status"
                        fullWidth
                        size="small"
                        value={editBudgetStatus}
                        onChange={(e) => setEditBudgetStatus(e.target.value)}
                        sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
                      >
                        <MenuItem value="GREEN">GREEN</MenuItem>
                        <MenuItem value="AMBER">AMBER</MenuItem>
                        <MenuItem value="RED">RED</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Overall Project Health"
                        fullWidth
                        size="small"
                        value={editOverallHealth}
                        onChange={(e) => setEditOverallHealth(e.target.value)}
                        sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
                      >
                        <MenuItem value="GREEN">GREEN</MenuItem>
                        <MenuItem value="AMBER">AMBER</MenuItem>
                        <MenuItem value="RED">RED</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Card 2: Technical Assessment (TL Edit Enabled, PM View Only) */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  Technical Assessment (TL Managed)
                </Typography>

                {!isTL ? (
                  <Chip
                    icon={<LockIcon sx={{ fontSize: '0.9rem !important' }} />}
                    label="View Only for PM"
                    size="small"
                    sx={{ bgcolor: '#334155', color: '#cbd5e1', fontWeight: 700 }}
                  />
                ) : !isEditingAssessment ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditingAssessment(true)}
                    sx={{ color: '#10b981', borderColor: '#10b981' }}
                  >
                    Edit Assessment
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveAssessment}
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                  >
                    Save
                  </Button>
                )}
              </Box>

              {!isTL || !isEditingAssessment ? (

                <Box>
                  <Box display="flex" gap={2} mb={2}>
                    <Box p={1.5} flexGrow={1} sx={{ bgcolor: '#0f172a', borderRadius: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Readiness Score</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                        {assessment?.technical_readiness_score} / 5
                      </Typography>
                    </Box>
                    <Box p={1.5} flexGrow={1} sx={{ bgcolor: '#0f172a', borderRadius: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Technical Health</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: assessment?.technical_health === 'GREEN' ? '#10b981' : assessment?.technical_health === 'RED' ? '#ef4444' : '#f59e0b' }}>
                        {assessment?.technical_health}
                      </Typography>
                    </Box>
                  </Box>

                  <Box p={2} sx={{ bgcolor: '#0f172a', borderRadius: 1.5, mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>Comments</Typography>
                    <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                      "{assessment?.comments}"
                    </Typography>
                  </Box>

                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Assessed By: Arjun Mehta (Technical Lead)
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <TextField
                        select
                        label="Readiness Score"
                        fullWidth
                        size="small"
                        value={editScore}
                        onChange={(e) => setEditScore(Number(e.target.value))}
                        sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
                      >
                        {[1, 2, 3, 4, 5].map(s => <MenuItem key={s} value={s}>{s} / 5</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        select
                        label="Technical Health"
                        fullWidth
                        size="small"
                        value={editTechHealth}
                        onChange={(e) => setEditTechHealth(e.target.value)}
                        sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
                      >
                        <MenuItem value="GREEN">GREEN</MenuItem>
                        <MenuItem value="AMBER">AMBER</MenuItem>
                        <MenuItem value="RED">RED</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  <TextField
                    label="Comments"
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    value={editComments}
                    onChange={(e) => setEditComments(e.target.value)}
                    sx={{ textarea: { color: '#f8fafc' }, label: { color: '#94a3b8' }, mb: 2 }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#334155' }} />

        {/* SUPPORTING PROJECT CONTEXT */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8', mb: 2 }}>
          SUPPORTING PROJECT CONTEXT (DYNAMIC & PERSISTENT)
        </Typography>

        <Grid container spacing={3}>
          {/* Audits & Findings */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  Project Audits & Findings ({audits.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => setAuditModalOpen(true)}
                  sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
                >
                  New Audit
                </Button>
              </Box>

              {audits.map((a) => (
                <Box key={a.audit_id} mb={2.5} p={2} sx={{ bgcolor: '#0f172a', borderRadius: 1.5 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                      {a.audit_name} ({a.audit_type})
                    </Typography>
                    <Chip label={a.audit_status} size="small" color={a.audit_status === 'CLOSED' ? 'success' : 'info'} />
                  </Box>

                  <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1', fontSize: '0.75rem' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#64748b' }}>Ref</TableCell>
                        <TableCell sx={{ color: '#64748b' }}>Title</TableCell>
                        <TableCell sx={{ color: '#64748b' }}>Severity</TableCell>
                        <TableCell sx={{ color: '#64748b' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {a.findings?.map((f) => (
                        <TableRow key={f.finding_id}>
                          <TableCell sx={{ fontWeight: 700, color: '#cbd5e1' }}>{f.finding_reference}</TableCell>
                          <TableCell>{f.title}</TableCell>
                          <TableCell sx={{ color: f.severity === 'CRITICAL' ? '#ef4444' : f.severity === 'MAJOR' ? '#f59e0b' : '#38bdf8' }}>{f.severity}</TableCell>
                          <TableCell sx={{ color: f.status === 'OPEN' ? '#ef4444' : '#10b981' }}>{f.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Project Risks */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  Project Risks ({risks.length})
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => setRiskModalOpen(true)}
                  sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
                >
                  New Risk
                </Button>
              </Box>

              {risks.map((r) => (
                <Box key={r.risk_id} p={2} mb={1.5} sx={{ bgcolor: '#0f172a', borderRadius: 1.5, borderLeft: `4px solid ${r.impact === 'HIGH' ? '#ef4444' : '#f59e0b'}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    {r.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                    Status: {r.status} | Impact: <strong>{r.impact}</strong> | Probability: <strong>{r.probability}</strong>
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* New Audit Modal */}
      <Dialog open={auditModalOpen} onClose={() => setAuditModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1e293b', color: '#f8fafc', fontWeight: 700 }}>Create New Audit</DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e293b' }}>
          <TextField
            label="Audit Name"
            fullWidth
            margin="dense"
            value={newAuditName}
            onChange={(e) => setNewAuditName(e.target.value)}
            sx={{ input: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          />
          <TextField
            select
            label="Audit Type"
            fullWidth
            margin="dense"
            value={newAuditType}
            onChange={(e) => setNewAuditType(e.target.value)}
            sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          >
            <MenuItem value="Quality">Quality</MenuItem>
            <MenuItem value="Safety">Safety</MenuItem>
            <MenuItem value="Design Control">Design Control</MenuItem>
            <MenuItem value="Cybersecurity">Cybersecurity</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1e293b', p: 2 }}>
          <Button onClick={() => setAuditModalOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleCreateAudit} variant="contained" sx={{ bgcolor: '#0284c7' }}>Create Audit</Button>
        </DialogActions>
      </Dialog>

      {/* New Risk Modal */}
      <Dialog open={riskModalOpen} onClose={() => setRiskModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1e293b', color: '#f8fafc', fontWeight: 700 }}>Create New Risk</DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e293b' }}>
          <TextField
            label="Risk Title"
            fullWidth
            margin="dense"
            value={newRiskTitle}
            onChange={(e) => setNewRiskTitle(e.target.value)}
            sx={{ input: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          />
          <TextField
            select
            label="Impact Level"
            fullWidth
            margin="dense"
            value={newRiskImpact}
            onChange={(e) => setNewRiskImpact(e.target.value)}
            sx={{ select: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          >
            <MenuItem value="HIGH">HIGH</MenuItem>
            <MenuItem value="MEDIUM">MEDIUM</MenuItem>
            <MenuItem value="LOW">LOW</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1e293b', p: 2 }}>
          <Button onClick={() => setRiskModalOpen(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button onClick={handleCreateRisk} variant="contained" sx={{ bgcolor: '#0284c7' }}>Create Risk</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

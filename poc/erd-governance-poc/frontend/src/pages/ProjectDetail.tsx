import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Grid, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button
} from '@mui/material';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import LinkIcon from '@mui/icons-material/Link';
import { StatusChip } from '../components/StatusChip';
import { EntityModelInspector } from '../components/EntityModelInspector';
import api from '../api/client';
import { Project, Audit, Risk, Issue, Dependency, Milestone, GovernanceReview } from '../types';
import { useParams, useNavigate } from 'react-router-dom';

export const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tabValue, setTabValue] = useState(0);

  const [audits, setAudits] = useState<Audit[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [reviews, setReviews] = useState<GovernanceReview[]>([]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails(projectId);
    }
  }, [projectId]);

  const fetchProjectDetails = async (id: string) => {
    try {
      const prjRes = await api.get<Project>(`/projects/${id}`);
      setProject(prjRes.data);

      const audRes = await api.get<Audit[]>(`/audits?project_id=${id}`);
      setAudits(audRes.data);

      const rkRes = await api.get<Risk[]>(`/risks?project_id=${id}`);
      setRisks(rkRes.data);

      const issRes = await api.get<Issue[]>(`/issues?project_id=${id}`);
      setIssues(issRes.data);

      const depRes = await api.get<Dependency[]>(`/dependencies?project_id=${id}`);
      setDependencies(depRes.data);

      const msRes = await api.get<Milestone[]>(`/milestones?project_id=${id}`);
      setMilestones(msRes.data);

      const revRes = await api.get<GovernanceReview[]>(`/governance-reviews?project_id=${id}`);
      setReviews(revRes.data);
    } catch (err) {
      console.error('Failed to load project detail', err);
    }
  };

  if (!project) {
    return <Box p={3} sx={{ color: '#94a3b8' }}>Loading project details...</Box>;
  }

  return (
    <Box p={3}>
      <EntityModelInspector
        entityName="PROJECT DETAIL HUB"
        tableName="projects"
        primaryKey="project_id"
        foreignKeys={['portfolio_id', 'technology_center_id', 'current_phase_id', 'project_manager_id', 'technical_lead_id']}
        relationships={[
          'PROJECT 1:N AUDIT',
          'PROJECT 1:N RISK',
          'PROJECT 1:N ISSUE',
          'PROJECT 1:N MILESTONE',
          'PROJECT 1:N GOVERNANCE_REVIEW',
          'PROJECT project-to-project DEPENDENCY'
        ]}
        roleAccess="PM, TECH_LEAD, AUDITOR, TC_MANAGER, EXECUTIVE, ADMIN"
        relatedPage="Project Detail Workspace"
      />

      <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <FolderSpecialIcon sx={{ color: '#38bdf8', fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                [{project.code}] {project.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                {project.description}
              </Typography>
            </Box>
          </Box>
          <StatusChip status={project.overall_health_status} type="health" size="medium" />
        </Box>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Portfolio</Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>{project.portfolio?.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Technology Center</Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>{project.technology_center?.name}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Project Manager</Typography>
            <Typography variant="body2" sx={{ color: '#38bdf8', fontWeight: 600 }}>{project.project_manager?.full_name}</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>Technical Lead</Typography>
            <Typography variant="body2" sx={{ color: '#38bdf8', fontWeight: 600 }}>{project.technical_lead?.full_name}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: '1px solid #334155', '& .MuiTab-root': { color: '#94a3b8', fontWeight: 600 } }}
        >
          <Tab label={`Governance Reviews (${reviews.length})`} />
          <Tab label={`Audits (${audits.length})`} />
          <Tab label={`Risks (${risks.length})`} />
          <Tab label={`Issues (${issues.length})`} />
          <Tab label={`Dependencies (${dependencies.length})`} />
          <Tab label={`Milestones (${milestones.length})`} />
        </Tabs>

        <Box p={3}>
          {tabValue === 0 && (
            <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
              <TableHead><TableRow sx={{ bgcolor: '#0f172a' }}><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Review Number</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Date</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Review Health</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>TC Manager</TableCell></TableRow></TableHead>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r.review_id} hover onClick={() => navigate('/governance-review')} sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{r.review_number}</TableCell>
                    <TableCell>{r.review_date}</TableCell>
                    <TableCell><StatusChip status={r.review_status} /></TableCell>
                    <TableCell><StatusChip status={r.overall_health_status} type="health" /></TableCell>
                    <TableCell>{r.technology_center_manager?.full_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tabValue === 1 && (
            <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
              <TableHead><TableRow sx={{ bgcolor: '#0f172a' }}><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Audit Code</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Title</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Type</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Auditor</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {audits.map((a) => (
                  <TableRow key={a.audit_id} hover onClick={() => navigate('/audits')} sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{a.code}</TableCell>
                    <TableCell>{a.title}</TableCell>
                    <TableCell>{a.audit_type}</TableCell>
                    <TableCell>{a.lead_auditor?.full_name}</TableCell>
                    <TableCell><StatusChip status={a.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tabValue === 2 && (
            <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
              <TableHead><TableRow sx={{ bgcolor: '#0f172a' }}><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Risk Title</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Risk Level</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Mitigation Plan</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {risks.map((rk) => (
                  <TableRow key={rk.risk_id}>
                    <TableCell sx={{ fontWeight: 700, color: '#f8fafc' }}>{rk.title}</TableCell>
                    <TableCell><StatusChip status={rk.risk_level} type="severity" /></TableCell>
                    <TableCell>{rk.mitigation_plan}</TableCell>
                    <TableCell><StatusChip status={rk.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tabValue === 3 && (
            <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
              <TableHead><TableRow sx={{ bgcolor: '#0f172a' }}><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Issue Title</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Severity</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Resolution Plan</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {issues.map((iss) => (
                  <TableRow key={iss.issue_id}>
                    <TableCell sx={{ fontWeight: 700, color: '#f8fafc' }}>{iss.title}</TableCell>
                    <TableCell><StatusChip status={iss.severity} type="severity" /></TableCell>
                    <TableCell>{iss.resolution_plan}</TableCell>
                    <TableCell><StatusChip status={iss.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tabValue === 4 && (
            <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
              <TableHead><TableRow sx={{ bgcolor: '#0f172a' }}><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Source Project</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Target Project</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Description</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Type</TableCell></TableRow></TableHead>
              <TableBody>
                {dependencies.map((dep) => (
                  <TableRow key={dep.dependency_id}>
                    <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{dep.source_project?.name}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#fbbf24' }}>{dep.target_project?.name}</TableCell>
                    <TableCell>{dep.description}</TableCell>
                    <TableCell><Chip label={dep.dependency_type} size="small" sx={{ bgcolor: '#0f172a', color: '#94a3b8' }} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {tabValue === 5 && (
            <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
              <TableHead><TableRow sx={{ bgcolor: '#0f172a' }}><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Milestone Title</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Target Date</TableCell><TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {milestones.map((ms) => (
                  <TableRow key={ms.milestone_id}>
                    <TableCell sx={{ fontWeight: 700, color: '#f8fafc' }}>{ms.title}</TableCell>
                    <TableCell>{ms.target_date}</TableCell>
                    <TableCell><StatusChip status={ms.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

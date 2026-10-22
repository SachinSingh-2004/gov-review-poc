import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Warning as WarningIcon, Flag as MilestoneIcon } from '@mui/icons-material';

import { api } from '../services/api';
import { Project } from '../types';
import { PageHeader } from '../components/PageHeader';
import { DataTable, Column } from '../components/DataTable';
import { StatusChip } from '../components/StatusChip';

export const Projects: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | false>(false);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const res = await api.get('/projects');
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
  });

  const columns: Column<Project>[] = [
    { id: 'code', label: 'Project Code', minWidth: 120 },
    { id: 'name', label: 'Project Name', minWidth: 200 },
    { id: 'owner_name', label: 'Project Owner', minWidth: 150 },
    { id: 'health_status', label: 'Health Status', minWidth: 130, format: (val) => <StatusChip status={val} /> },
    { id: 'campaign_count', label: 'Campaigns', minWidth: 100 },
    { id: 'open_findings_count', label: 'Open Findings', minWidth: 120 },
    { id: 'critical_findings_count', label: 'Critical Findings', minWidth: 130 },
    { id: 'overdue_actions_count', label: 'Overdue Actions', minWidth: 130 },
  ];

  return (
    <Box>
      <PageHeader
        title="R&D Governance Projects"
        subtitle="Overview of enterprise R&D projects, aggregated governance health, risks, and milestones"
      />

      <Paper sx={{ p: 2.5, mb: 3 }}>
        <DataTable
          columns={columns}
          rows={Array.isArray(projects) ? projects : []}
          loading={isLoading}
          onRowClick={(row) => setExpandedId(expandedId === row.id ? false : row.id)}
        />
      </Paper>

      {/* Project Drill-down Accordions */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        Project Risk & Milestone Details
      </Typography>

      {Array.isArray(projects) && projects.map((proj) => (
        <Accordion
          key={proj.id}
          expanded={expandedId === proj.id}
          onChange={() => setExpandedId(expandedId === proj.id ? false : proj.id)}
          sx={{ mb: 1.5, border: '1px solid #e2e8f0', borderRadius: '8px !important' }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {proj.code} — {proj.name}
                </Typography>
                <StatusChip status={proj.health_status} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Owner: {proj.owner_name}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary" mb={2}>
              {proj.description}
            </Typography>

            <Grid container spacing={3}>
              {/* Risks Section */}
              <Grid item xs={12} md={6}>
                <Box bgcolor="#fff7ed" p={2} borderRadius={2} border="1px solid #ffedd5">
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <WarningIcon sx={{ color: '#c2410c' }} />
                    <Typography variant="subtitle2" fontWeight={700} color="#9a3412">
                      Identified Project Risks
                    </Typography>
                  </Box>
                  {proj.risks && proj.risks.length > 0 ? (
                    proj.risks.map((r) => (
                      <Box key={r.id} mb={1} p={1} bgcolor="#ffffff" borderRadius={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {r.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Level: <strong>{r.risk_level}</strong> | Mitigation: {r.mitigation_plan}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No high risk items recorded.
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Milestones Section */}
              <Grid item xs={12} md={6}>
                <Box bgcolor="#f0f9ff" p={2} borderRadius={2} border="1px solid #bae6fd">
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <MilestoneIcon sx={{ color: '#0284c7' }} />
                    <Typography variant="subtitle2" fontWeight={700} color="#0369a1">
                      Project Governance Milestones
                    </Typography>
                  </Box>
                  {proj.milestones && proj.milestones.length > 0 ? (
                    proj.milestones.map((m) => (
                      <Box key={m.id} mb={1} p={1} bgcolor="#ffffff" borderRadius={1} display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {m.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Target Date: {m.target_date}
                          </Typography>
                        </Box>
                        <Chip label={m.status} size="small" />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No milestones configured.
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

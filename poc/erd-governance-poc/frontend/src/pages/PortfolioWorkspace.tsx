import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { StatusChip } from '../components/StatusChip';
import { EntityModelInspector } from '../components/EntityModelInspector';
import api from '../api/client';
import { Portfolio, Project, TechnologyCenter } from '../types';
import { useNavigate } from 'react-router-dom';

export const PortfolioWorkspace: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [techCenters, setTechCenters] = useState<TechnologyCenter[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await api.get<Portfolio[]>('/portfolios');
      setPortfolios(pRes.data);

      const tcRes = await api.get<TechnologyCenter[]>('/technology-centers');
      setTechCenters(tcRes.data);

      const prjRes = await api.get<Project[]>('/projects');
      setProjects(prjRes.data);
    } catch (err) {
      console.error('Failed to fetch portfolio data', err);
    }
  };

  return (
    <Box p={3}>
      <EntityModelInspector
        entityName="PORTFOLIO -> PROJECT -> TECHNOLOGY_CENTER"
        tableName="portfolios, projects, technology_centers, project_phases"
        primaryKey="portfolio_id, project_id, technology_center_id, phase_id"
        foreignKeys={['portfolio_id', 'technology_center_id', 'current_phase_id', 'project_manager_id', 'technical_lead_id']}
        relationships={[
          'PORTFOLIO 1:N PROJECT',
          'TECHNOLOGY_CENTER 1:N PROJECT',
          'PROJECT_PHASE 1:N PROJECT',
          'PROJECT_MANAGER and TECHNICAL_LEAD exist as USER references (No separate TL/PM tables)'
        ]}
        roleAccess="PROJECT_MANAGER (Assigned), AUDITOR, TC_MANAGER, EXECUTIVE, ADMIN"
        relatedPage="Portfolio Workspace"
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon sx={{ color: '#38bdf8' }} /> Portfolios & R&D Projects
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            High-level portfolio structure, technology domain centers, and managed R&D projects.
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ color: '#38bdf8', fontWeight: 700, mb: 2 }}>
        Portfolios
      </Typography>

      <Grid container spacing={2.5} mb={4}>
        {portfolios.map((port) => {
          const portProjects = projects.filter((p) => p.portfolio_id === port.portfolio_id);
          return (
            <Grid item xs={12} md={6} key={port.portfolio_id}>
              <Paper sx={{ p: 3, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                    [{port.code}] {port.name}
                  </Typography>
                  <Chip label={`${portProjects.length} Projects`} color="primary" size="small" />
                </Box>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                  {port.description}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Typography variant="h6" sx={{ color: '#38bdf8', fontWeight: 700, mb: 2 }}>
        All R&D Projects
      </Typography>

      <Paper sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2 }}>
        <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1' } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#0f172a' }}>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Code</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Project Name</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Technology Center</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Project Manager</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Technical Lead</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Current Phase</TableCell>
              <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Overall Health</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((prj) => (
              <TableRow
                key={prj.project_id}
                hover
                onClick={() => navigate(`/projects/${prj.project_id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ fontWeight: 700, color: '#38bdf8' }}>{prj.code}</TableCell>
                <TableCell>{prj.name}</TableCell>
                <TableCell>{prj.technology_center?.name || 'N/A'}</TableCell>
                <TableCell>{prj.project_manager?.full_name || 'N/A'}</TableCell>
                <TableCell>{prj.technical_lead?.full_name || 'N/A'}</TableCell>
                <TableCell>{prj.current_phase?.name || 'N/A'}</TableCell>
                <TableCell><StatusChip status={prj.overall_health_status} type="health" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

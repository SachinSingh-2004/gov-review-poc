import React from 'react';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import GavelIcon from '@mui/icons-material/Gavel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Executive View', icon: <DashboardIcon />, path: '/' },
  { text: 'Action Centre', icon: <TaskAltIcon />, path: '/actions' },
  { text: 'Audit Workspace', icon: <VerifiedUserIcon />, path: '/audits' },
  { text: 'Portfolios & Projects', icon: <FolderIcon />, path: '/projects' },
  { text: 'Governance Review', icon: <GavelIcon />, path: '/governance-review' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'ERD Explorer', icon: <AccountTreeIcon />, path: '/erd-explorer' },
  { text: 'Audit Logs', icon: <HistoryIcon />, path: '/audit-logs' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0f172a',
          color: '#cbd5e1',
          borderRight: '1px solid #1e293b',
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #1e293b' }}>
        <Typography variant="overline" sx={{ color: '#38bdf8', letterSpacing: 1.2, fontWeight: 700 }}>
          R&D Governance Portal
        </Typography>
        <Typography variant="caption" display="block" sx={{ color: '#64748b' }}>
          ERD Validation POC
        </Typography>
      </Box>

      <List sx={{ mt: 1 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItemButton
              key={item.text}
              selected={isSelected}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1.5,
                '&.Mui-selected': {
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  '& .MuiListItemIcon-root': { color: '#ffffff' },
                  '&:hover': { backgroundColor: '#0369a1' },
                },
                '&:hover': {
                  backgroundColor: '#1e293b',
                },
              }}
            >
              <ListItemIcon sx={{ color: isSelected ? '#ffffff' : '#94a3b8', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isSelected ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #1e293b' }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
          Strict ERD Compliance Mode
        </Typography>
      </Box>
    </Drawer>
  );
};

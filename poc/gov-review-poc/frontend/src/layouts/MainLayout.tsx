import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Container,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AuditIcon,
  ReportProblem as FindingIcon,
  AssignmentTurnedIn as ActionIcon,
  AccountTree as ProjectIcon,
  Campaign as CampaignIcon,
  PieChart as PortfolioIcon,
  SmartToy as AutonomousIcon,
  BusinessCenter as ExecutiveIcon,
  Description as ReportIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  SwapHoriz as SwitchIcon,
  Notifications as NotificationIcon,
  Menu as MenuIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const DRAWER_WIDTH = 260;

const menuGroups = [
  {
    title: 'GOVERNANCE MODULES',
    items: [
      { label: 'Portal Home', path: '/', icon: <DashboardIcon /> },
      { label: 'Audit Dashboard', path: '/audit-dashboard', icon: <AuditIcon /> },
      { label: 'Audits', path: '/audits', icon: <AuditIcon /> },
      { label: 'Findings', path: '/findings', icon: <FindingIcon /> },
      { label: 'Action Centre', path: '/actions', icon: <ActionIcon /> },
      { label: 'Projects', path: '/projects', icon: <ProjectIcon /> },
      { label: 'Campaigns', path: '/campaigns', icon: <CampaignIcon /> },
    ],
  },
  {
    title: 'EXECUTIVE & PORTFOLIO',
    items: [
      { label: 'Portfolio Dashboard', path: '/portfolio', icon: <PortfolioIcon /> },
      { label: 'Autonomous Dashboard', path: '/autonomous', icon: <AutonomousIcon /> },
      { label: 'Executive Review', path: '/executive', icon: <ExecutiveIcon /> },
      { label: 'Reports', path: '/reports', icon: <ReportIcon /> },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { label: 'Administration', path: '/administration', icon: <AdminIcon /> },
    ],
  },
];

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentRole, personas, switchPersona } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElPersona, setAnchorElPersona] = useState<null | HTMLElement>(null);

  const handlePersonaOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElPersona(event.currentTarget);
  };

  const handlePersonaClose = () => {
    setAnchorElPersona(null);
  };

  const handlePersonaSelect = (role: UserRole) => {
    switchPersona(role);
    handlePersonaClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a', color: '#f8fafc' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <SecurityIcon sx={{ color: '#0ea5e9', fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} color="#ffffff" lineHeight={1.2} fontSize="1rem">
            R&D GOVERNANCE
          </Typography>
          <Typography variant="caption" color="#94a3b8" letterSpacing={1}>
            ENTERPRISE PORTAL
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: '#334155' }} />

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 1.5 }}>
        {menuGroups.map((group, gIdx) => (
          <Box key={gIdx} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ px: 3, pb: 1, display: 'block', color: '#64748b', fontWeight: 700, letterSpacing: 0.8 }}
            >
              {group.title}
            </Typography>
            <List disablePadding>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      sx={{
                        mx: 1.5,
                        borderRadius: 1.5,
                        py: 1,
                        bgcolor: isActive ? '#0ea5e9' : 'transparent',
                        color: isActive ? '#ffffff' : '#cbd5e1',
                        '&:hover': {
                          bgcolor: isActive ? '#0284c7' : '#1e293b',
                          color: '#ffffff',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500 }} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer System Status */}
      <Divider sx={{ borderColor: '#334155' }} />
      <Box sx={{ p: 2, bgcolor: '#020617' }}>
        <Typography variant="caption" color="#94a3b8" display="block">
          System Mode: <strong>DEMO RBAC ACTIVE</strong>
        </Typography>
        <Typography variant="caption" color="#64748b" display="block" mt={0.5}>
          Source of Truth: MySQL Engine
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} fontSize="1.1rem" color="#0f172a">
              Governance Control Center
            </Typography>
          </Box>

          {/* Persona Switcher & User Profile */}
          <Box display="flex" alignItems="center" gap={2}>
            {/* Persona Quick Switcher Pill */}
            <Tooltip title="Switch User Persona & Role to test RBAC authorization rules">
              <Chip
                icon={<SwitchIcon sx={{ fontSize: 18, color: '#0ea5e9 !important' }} />}
                label={`Role Persona: ${currentRole}`}
                onClick={handlePersonaOpen}
                variant="outlined"
                color="primary"
                sx={{
                  fontWeight: 700,
                  bgcolor: '#f0f9ff',
                  borderColor: '#bae6fd',
                  color: '#0369a1',
                  cursor: 'pointer',
                  py: 2,
                  px: 0.5,
                }}
              />
            </Tooltip>

            <Menu
              anchorEl={anchorElPersona}
              open={Boolean(anchorElPersona)}
              onClose={handlePersonaClose}
              PaperProps={{
                elevation: 3,
                sx: { width: 300, mt: 1, borderRadius: 2 },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                  Demo Persona Switcher
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select a persona to simulate permissions
                </Typography>
              </Box>
              {personas.map((p) => (
                <MenuItem
                  key={p.role}
                  selected={p.role === currentRole}
                  onClick={() => handlePersonaSelect(p.role)}
                  sx={{ py: 1.2 }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {p.role} — {p.full_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {p.department} ({p.email})
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>

            {/* Current User Info */}
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ bgcolor: '#0f172a', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 700 }}>
                {user ? user.full_name.charAt(0) : 'A'}
              </Avatar>
              <Box display={{ xs: 'none', md: 'block' }}>
                <Typography variant="body2" fontWeight={600} color="#0f172a" lineHeight={1.2}>
                  {user ? user.full_name : 'System Admin'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user ? user.department : 'Governance'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Sidebar */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 'none' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

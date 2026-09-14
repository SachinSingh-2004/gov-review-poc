import React from 'react';
import {
  AppBar, Toolbar, Typography, Box, Select, MenuItem, Chip,
  FormControl, Avatar
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../context/AuthContext';

export const TopDemoBar: React.FC = () => {
  const { currentUser, demoUsers, switchUser } = useAuth();

  const handleUserChange = (event: any) => {
    const selectedId = event.target.value;
    const found = demoUsers.find((u) => u.user_id === selectedId);
    if (found) {
      switchUser(found);
    }
  };

  const primaryRole = currentUser?.roles?.[0]?.name || 'NO_ROLE';

  return (
    <AppBar position="sticky" sx={{ background: '#1e293b', borderBottom: '1px solid #334155', elevation: 0 }}>
      <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#38bdf8', fontSize: '1.1rem' }}>
            R&D Governance Portal <Chip label="POC" color="primary" size="small" sx={{ ml: 1, fontWeight: 700 }} />
          </Typography>
          <Chip
            icon={<SecurityIcon sx={{ fontSize: '1rem !important' }} />}
            label="ERD Validation Environment"
            variant="outlined"
            size="small"
            sx={{ color: '#94a3b8', borderColor: '#475569' }}
          />
        </Box>

        {currentUser && (
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <SwapHorizIcon sx={{ color: '#cbd5e1' }} />
              <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 500 }}>
                Demo User:
              </Typography>
            </Box>

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select
                value={currentUser.user_id}
                onChange={handleUserChange}
                sx={{
                  color: '#f8fafc',
                  backgroundColor: '#0f172a',
                  borderRadius: 1,
                  '& .MuiSelect-icon': { color: '#94a3b8' },
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {demoUsers.map((u) => (
                  <MenuItem key={u.user_id} value={u.user_id}>
                    {u.full_name} ({u.roles[0]?.name || 'USER'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Chip
              label={primaryRole}
              color={
                primaryRole === 'ADMIN' ? 'error' :
                primaryRole === 'PROJECT_MANAGER' ? 'primary' :
                primaryRole === 'AUDITOR' ? 'secondary' :
                primaryRole === 'TECHNOLOGY_CENTER_MANAGER' ? 'warning' : 'info'
              }
              size="small"
              sx={{ fontWeight: 700 }}
            />

            <Box display="flex" alignItems="center" gap={1} sx={{ borderLeft: '1px solid #334155', pl: 2 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: '#0284c7', fontSize: '0.8rem' }}>
                {currentUser.full_name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="caption" display="block" sx={{ color: '#f8fafc', fontWeight: 600, lineHeight: 1.2 }}>
                  {currentUser.full_name}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                  {currentUser.department}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

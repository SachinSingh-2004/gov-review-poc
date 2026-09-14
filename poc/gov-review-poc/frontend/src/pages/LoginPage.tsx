import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, Divider, Chip
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('pm.demo');
  const [password, setPassword] = useState('PM@123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password.');
    }
  };

  const handleQuickLoginPM = async () => {
    setError(null);
    try {
      await login('pm.demo', 'PM@123');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed.');
    }
  };

  const handleQuickLoginTL = async () => {
    setError(null);
    try {
      await login('tl.demo', 'TL@123');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed.');
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ bgcolor: '#0f172a', p: 2 }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 420,
          width: '100%',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 3,
        }}
      >
        <Box textAlign="center" mb={3}>
          <Box display="flex" justifyContent="center" mb={1}>
            <Chip
              label="Demo Environment — Not for Production"
              color="warning"
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#38bdf8' }}>
            GOVERNANCE REVIEW POC
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            Project Manager & Technical Lead Role Validation
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ input: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ input: { color: '#f8fafc' }, label: { color: '#94a3b8' } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3, mb: 2, bgcolor: '#0284c7', fontWeight: 700, '&:hover': { bgcolor: '#0369a1' } }}
          >
            Login
          </Button>
        </form>

        <Divider sx={{ my: 2.5, borderColor: '#334155', color: '#64748b', fontSize: '0.8rem' }}>
          DEMO CONVENIENCE LOGIN
        </Divider>

        <Box display="flex" flexDirection="column" gap={1.5}>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={handleQuickLoginPM}
            sx={{ color: '#38bdf8', borderColor: '#38bdf8', textTransform: 'none', fontWeight: 600 }}
          >
            Use PM Demo (Priya Sharma - View Only)
          </Button>
          <Button
            variant="outlined"
            startIcon={<EngineeringIcon />}
            onClick={handleQuickLoginTL}
            sx={{ color: '#10b981', borderColor: '#10b981', textTransform: 'none', fontWeight: 600 }}
          >
            Use TL Demo (Arjun Mehta - View + Edit)
          </Button>
        </Box>

        <Box mt={3} textAlign="center">
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Strict 12 Entity Database Architecture Mode
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

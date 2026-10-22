import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Refresh as RefreshIcon, WarningAmber as WarningIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          bgcolor="#f8fafc"
          p={3}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 520,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #e2e8f0',
            }}
          >
            <WarningIcon sx={{ fontSize: 52, color: '#ed6c02', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} color="#0f172a" mb={1}>
              Governance Portal Encountered an Issue
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              An unexpected UI error occurred. Please click below to refresh and restore your active session.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              sx={{ px: 3, py: 1, borderRadius: 2 }}
            >
              Refresh Portal
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

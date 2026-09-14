import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { TopDemoBar } from './components/TopDemoBar';
import { Sidebar } from './components/Sidebar';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { AuditWorkspace } from './pages/AuditWorkspace';
import { ActionCentre } from './pages/ActionCentre';
import { PortfolioWorkspace } from './pages/PortfolioWorkspace';
import { ProjectDetail } from './pages/ProjectDetail';
import { GovernanceReviewWorkspace } from './pages/GovernanceReviewWorkspace';
import { ReportsPage } from './pages/ReportsPage';
import { ERDExplorer } from './pages/ERDExplorer';
import { AuditLogsPage } from './pages/AuditLogsPage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    primary: {
      main: '#0284c7',
    },
    secondary: {
      main: '#38bdf8',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
});

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Box display="flex" minHeight="100vh">
              <Sidebar />
              <Box flexGrow={1} display="flex" flexDirection="column" sx={{ minWidth: 0 }}>
                <TopDemoBar />
                <Box component="main" flexGrow={1} sx={{ bgcolor: '#0f172a' }}>
                  <Routes>
                    <Route path="/" element={<ExecutiveDashboard />} />
                    <Route path="/audits" element={<AuditWorkspace />} />
                    <Route path="/actions" element={<ActionCentre />} />
                    <Route path="/projects" element={<PortfolioWorkspace />} />
                    <Route path="/projects/:projectId" element={<ProjectDetail />} />
                    <Route path="/governance-review" element={<GovernanceReviewWorkspace />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/erd-explorer" element={<ERDExplorer />} />
                    <Route path="/audit-logs" element={<AuditLogsPage />} />
                  </Routes>
                </Box>
              </Box>
            </Box>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;

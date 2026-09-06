import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';

import { theme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';

import { Home } from './pages/Home';
import { AuditDashboard } from './pages/AuditDashboard';
import { Audits } from './pages/Audits';
import { Findings } from './pages/Findings';
import { ActionCentre } from './pages/ActionCentre';
import { Projects } from './pages/Projects';
import { Campaigns } from './pages/Campaigns';
import { PortfolioDashboard } from './pages/PortfolioDashboard';
import { AutonomousDashboard } from './pages/AutonomousDashboard';
import { ExecutiveReview } from './pages/ExecutiveReview';
import { Reports } from './pages/Reports';
import { Administration } from './pages/Administration';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 5000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="audit-dashboard" element={<AuditDashboard />} />
                <Route path="audits" element={<Audits />} />
                <Route path="findings" element={<Findings />} />
                <Route path="actions" element={<ActionCentre />} />
                <Route path="projects" element={<Projects />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="portfolio" element={<PortfolioDashboard />} />
                <Route path="autonomous" element={<AutonomousDashboard />} />
                <Route path="executive" element={<ExecutiveReview />} />
                <Route path="reports" element={<Reports />} />
                <Route path="administration" element={<Administration />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  MenuItem,
  TextField,
  Divider,
} from '@mui/material';
import { Download as DownloadIcon, Description as ReportIcon } from '@mui/icons-material';

import { PageHeader } from '../components/PageHeader';
import { MOCK_AUDITS, MOCK_FINDINGS, MOCK_ACTIONS } from '../mockData/governanceMockData';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('findings');
  const [format, setFormat] = useState('csv');

  const handleExport = () => {
    let csvContent = '';
    const filename = `governance_${reportType}_report.csv`;

    if (reportType === 'findings') {
      csvContent = 'Code,Title,Project,Severity,Status,Owner,Due Date\n' +
        MOCK_FINDINGS.map(f => `"${f.code}","${f.title.replace(/"/g, '""')}","${f.project_name || ''}","${f.severity}","${f.status}","${f.owner_name || ''}","${f.due_date}"`).join('\n');
    } else if (reportType === 'audits') {
      csvContent = 'Code,Title,Campaign,Lead Auditor,Status,Closure %,Start Date,End Date\n' +
        MOCK_AUDITS.map(a => `"${a.code}","${a.title.replace(/"/g, '""')}","${a.campaign_name || ''}","${a.lead_auditor_name || ''}","${a.status}",${a.closure_percentage},"${a.start_date}","${a.end_date}"`).join('\n');
    } else {
      csvContent = 'Code,Finding Code,Description,Owner,Status,Due Date\n' +
        MOCK_ACTIONS.map(ac => `"${ac.code}","${ac.finding_code || ''}","${ac.description.replace(/"/g, '""')}","${ac.owner_name || ''}","${ac.status}","${ac.due_date}"`).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <PageHeader
        title="Governance Reports Centre"
        subtitle="Generate and export audit, findings, and corrective action reports in CSV, Excel, or PDF format"
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <ReportIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight={700}>
                Report Generation Controls
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Select Report Dataset"
                  fullWidth
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="findings">Audit Findings & Non-Conformances Report</MenuItem>
                  <MenuItem value="audits">Audit Fieldwork & Closure Summary</MenuItem>
                  <MenuItem value="actions">Corrective Actions & CAPA Status Report</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label="Export File Format"
                  fullWidth
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <MenuItem value="csv">CSV (Comma Separated Values)</MenuItem>
                  <MenuItem value="excel">Microsoft Excel (.xlsx)</MenuItem>
                  <MenuItem value="pdf">PDF Document (.pdf)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} mt={1}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                >
                  Generate & Download Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#f8fafc' }}>
            <Typography variant="h6" fontWeight={700} mb={1.5}>
              Available Standard Reports
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight={700}>1. Audit Findings Summary</Typography>
              <Typography variant="caption" color="text.secondary">
                Includes finding code, severity rating, parent audit, project association, owner, target due date, and closure notes.
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight={700}>2. Audit Closure Report</Typography>
              <Typography variant="caption" color="text.secondary">
                Includes campaign details, lead auditor assignment, status, start/end dates, and closure percentage progress.
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle2" fontWeight={700}>3. Corrective Actions (CAPA) Report</Typography>
              <Typography variant="caption" color="text.secondary">
                Includes action description, assigned owner, status (Open, In Progress, Completed, Overdue), target date, and submitted evidence summary.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

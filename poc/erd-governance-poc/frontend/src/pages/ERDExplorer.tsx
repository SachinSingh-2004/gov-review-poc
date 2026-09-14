import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { ERDRenderer } from '../components/ERDRenderer';

const MASTER_ERD = `erDiagram
    USER ||--o{ USER_ROLE : "has"
    ROLE ||--o{ USER_ROLE : "assigned to"
    ROLE ||--o{ ROLE_PERMISSION : "has"
    PERMISSION ||--o{ ROLE_PERMISSION : "granted to"

    PORTFOLIO ||--o{ PROJECT : "contains"
    TECHNOLOGY_CENTER ||--o{ PROJECT : "oversees"
    PROJECT_PHASE ||--o{ PROJECT : "defines phase"

    PROJECT ||--o{ AUDIT : "audited by"
    AUDIT ||--o{ AUDIT_PARTICIPANT : "includes"
    USER ||--o{ AUDIT_PARTICIPANT : "participates in"

    AUDIT ||--o{ FINDING : "produces"
    FINDING ||--o{ ACTION : "requires corrective"
    GOVERNANCE_REVIEW ||--o{ ACTION : "generates governance"
    ACTION ||--o{ EVIDENCE : "supported by"

    PROJECT ||--o{ RISK : "identifies"
    PROJECT ||--o{ ISSUE : "encounters"
    PROJECT ||--o{ MILESTONE : "tracks"
    PROJECT ||--o{ DEPENDENCY : "source/target"

    PROJECT ||--o{ GOVERNANCE_REVIEW : "undergoes"
    GOVERNANCE_REVIEW ||--o| PM_UPDATE : "includes"
    GOVERNANCE_REVIEW ||--o| GOVERNANCE_ASSESSMENT : "assessed by"
    GOVERNANCE_REVIEW ||--o{ GOVERNANCE_DECISION : "results in"
    GOVERNANCE_REVIEW ||--o| GOVERNANCE_REVIEW : "previous_review"
    USER ||--o{ AUDIT_LOG : "triggers"
`;

const RBAC_ERD = `erDiagram
    USER ||--o{ USER_ROLE : "has"
    ROLE ||--o{ USER_ROLE : "assigned to"
    ROLE ||--o{ ROLE_PERMISSION : "has"
    PERMISSION ||--o{ ROLE_PERMISSION : "granted to"
    USER ||--o{ AUDIT_LOG : "triggers"
`;

const PROJECT_ERD = `erDiagram
    PORTFOLIO ||--o{ PROJECT : "contains"
    TECHNOLOGY_CENTER ||--o{ PROJECT : "oversees"
    PROJECT_PHASE ||--o{ PROJECT : "defines phase"
    USER ||--o{ PROJECT : "manages as PM"
    USER ||--o{ PROJECT : "leads as Tech Lead"
`;

const AUDIT_ERD = `erDiagram
    PROJECT ||--o{ AUDIT : "audited by"
    AUDIT ||--o{ AUDIT_PARTICIPANT : "includes"
    AUDIT ||--o{ FINDING : "produces"
    FINDING ||--o{ ACTION : "requires corrective"
    ACTION ||--o{ EVIDENCE : "supported by"
`;

const GOV_REVIEW_ERD = `erDiagram
    PROJECT ||--o{ GOVERNANCE_REVIEW : "undergoes"
    GOVERNANCE_REVIEW ||--o| PM_UPDATE : "includes"
    GOVERNANCE_REVIEW ||--o| GOVERNANCE_ASSESSMENT : "assessed by"
    GOVERNANCE_REVIEW ||--o{ GOVERNANCE_DECISION : "results in"
    GOVERNANCE_REVIEW ||--o{ ACTION : "generates governance action"
    GOVERNANCE_REVIEW ||--o| GOVERNANCE_REVIEW : "previous_review"
`;

const SUPPORTING_ERD = `erDiagram
    PROJECT ||--o{ RISK : "identifies"
    PROJECT ||--o{ ISSUE : "encounters"
    PROJECT ||--o{ MILESTONE : "tracks"
    PROJECT ||--o{ DEPENDENCY : "source/target"
`;

export const ERDExplorer: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountTreeIcon sx={{ color: '#38bdf8' }} /> Interactive ERD Explorer
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Visual Mermaid diagrams representing agreed ERD logical models.
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: '1px solid #334155', '& .MuiTab-root': { color: '#94a3b8', fontWeight: 600 } }}
        >
          <Tab label="1. Master ERD (v2)" />
          <Tab label="2. Identity & RBAC" />
          <Tab label="3. Project & Portfolio" />
          <Tab label="4. Audit, Finding, Action" />
          <Tab label="5. Governance Review" />
          <Tab label="6. Supporting Entities" />
        </Tabs>

        <Box p={3}>
          {tabValue === 0 && <ERDRenderer chart={MASTER_ERD} title="Master Logical ERD v2" />}
          {tabValue === 1 && <ERDRenderer chart={RBAC_ERD} title="Module 01: Identity & RBAC ERD" />}
          {tabValue === 2 && <ERDRenderer chart={PROJECT_ERD} title="Module 02: Project & Portfolio ERD" />}
          {tabValue === 3 && <ERDRenderer chart={AUDIT_ERD} title="Module 03: Audit, Finding, Action & Evidence ERD" />}
          {tabValue === 4 && <ERDRenderer chart={GOV_REVIEW_ERD} title="Module 04: Governance Review Lifecycle ERD" />}
          {tabValue === 5 && <ERDRenderer chart={SUPPORTING_ERD} title="Module 05: Supporting Entities ERD" />}
        </Box>
      </Paper>
    </Box>
  );
};

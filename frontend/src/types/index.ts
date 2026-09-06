export type UserRole = 
  | 'ADMIN'
  | 'AUDITOR'
  | 'AUDIT_MANAGER'
  | 'PROJECT_OWNER'
  | 'ACTION_OWNER'
  | 'EXECUTIVE'
  | 'VIEWER';

export interface Permission {
  id: string;
  code: string;
  description?: string;
}

export interface Role {
  id: string;
  name: UserRole;
  description?: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  department: string;
  is_active: boolean;
  roles: Role[];
  created_at: string;
}

export interface Persona {
  role: UserRole;
  description: string;
  username: string;
  full_name: string;
  email: string;
  department: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  owner_id: string;
  owner_name?: string;
  health_status: 'HEALTHY' | 'ATTENTION' | 'AT_RISK';
  created_at: string;
  updated_at: string;
  campaign_count?: number;
  open_findings_count?: number;
  critical_findings_count?: number;
  overdue_actions_count?: number;
  risks?: Risk[];
  milestones?: Milestone[];
}

export interface Risk {
  id: string;
  project_id: string;
  title: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigation_plan?: string;
  status: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  target_date: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Campaign {
  id: string;
  code: string;
  name: string;
  project_id: string;
  project_name?: string;
  description?: string;
  owner_id: string;
  owner_name?: string;
  start_date: string;
  end_date: string;
  status: 'DRAFT' | 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  created_by: string;
  creator_name?: string;
  created_at: string;
  updated_at: string;
  audit_count?: number;
}

export interface Audit {
  id: string;
  code: string;
  title: string;
  campaign_id: string;
  campaign_name?: string;
  project_id?: string;
  project_name?: string;
  lead_auditor_id: string;
  lead_auditor_name?: string;
  start_date: string;
  end_date: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'FIELDWORK' | 'ATTENTION' | 'CLOSED';
  closure_percentage: number;
  created_at: string;
  updated_at: string;
  finding_count?: number;
}

export interface Finding {
  id: string;
  code: string;
  audit_id: string;
  audit_title?: string;
  campaign_id?: string;
  campaign_name?: string;
  project_id?: string;
  project_name?: string;
  title: string;
  description?: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';
  owner_id: string;
  owner_name?: string;
  due_date: string;
  closure_info?: string;
  created_at: string;
  updated_at: string;
  action_count?: number;
}

export interface ActionItem {
  id: string;
  code: string;
  finding_id: string;
  finding_title?: string;
  audit_id?: string;
  project_id?: string;
  project_name?: string;
  description: string;
  owner_id: string;
  owner_name?: string;
  due_date: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'PENDING_REVIEW' | 'CLOSED';
  completion_date?: string;
  evidence_summary?: string;
  reviewer_id?: string;
  reviewer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details_json?: string;
  timestamp: string;
}

export interface DashboardSummary {
  kpis: {
    upcoming_audits: number;
    open_findings: number;
    critical_findings: number;
    overdue_actions: number;
    closed_findings: number;
  };
  findings_by_severity: {
    critical: number;
    major: number;
    minor: number;
    total: number;
  };
  findings_by_project: Array<{ project_name: string; count: number }>;
  closure_trend: Array<{ month: string; closure_rate: number; planned_rate: number }>;
}

export interface PortfolioSummary {
  total_projects: number;
  healthy_projects: number;
  attention_projects: number;
  at_risk_projects: number;
  open_findings: number;
  critical_findings: number;
  overdue_actions: number;
  audit_completion_rate: number;
}

export interface ExecutiveSummary {
  overall_governance_score: number;
  audit_status_distribution: Record<string, number>;
  finding_severity_distribution: Record<string, number>;
  project_health_distribution: Record<string, number>;
  high_priority_items_count: number;
  action_closure_rate: number;
}

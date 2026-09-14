export interface Permission {
  permission_id: string;
  code: string;
  description?: string;
}

export interface Role {
  role_id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  department?: string;
  is_active: boolean;
  roles: Role[];
}

export interface Portfolio {
  portfolio_id: string;
  name: string;
  code: string;
  description?: string;
}

export interface TechnologyCenter {
  technology_center_id: string;
  name: string;
  code: string;
  lead_user_id?: string;
  lead_user?: User;
}

export interface ProjectPhase {
  phase_id: string;
  name: string;
  code: string;
  sequence: number;
}

export interface Project {
  project_id: string;
  code: string;
  name: string;
  description?: string;
  portfolio_id: string;
  technology_center_id: string;
  current_phase_id: string;
  project_manager_id: string;
  technical_lead_id: string;
  overall_health_status: 'GREEN' | 'AMBER' | 'RED';
  portfolio?: Portfolio;
  technology_center?: TechnologyCenter;
  current_phase?: ProjectPhase;
  project_manager?: User;
  technical_lead?: User;
}

export interface AuditParticipant {
  audit_id: string;
  user_id: string;
  role_in_audit: string;
  user?: User;
}

export interface Audit {
  audit_id: string;
  code: string;
  title: string;
  project_id: string;
  lead_auditor_id: string;
  start_date: string;
  end_date: string;
  status: string;
  audit_type: string;
  scope_description?: string;
  project?: Project;
  lead_auditor?: User;
  participants: AuditParticipant[];
}

export interface Finding {
  finding_id: string;
  code: string;
  audit_id: string;
  title: string;
  description?: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  owner_id: string;
  due_date: string;
  audit?: Audit;
  owner?: User;
}

export interface Evidence {
  evidence_id: string;
  action_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by_id: string;
  review_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewer_id?: string;
  comments?: string;
  uploaded_at: string;
  uploaded_by?: User;
  reviewer?: User;
}

export interface Action {
  action_id: string;
  code: string;
  description: string;
  finding_id?: string;
  governance_review_id?: string;
  owner_id: string;
  reviewer_id?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'OVERDUE' | 'CLOSED';
  due_date: string;
  completion_date?: string;
  review_status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  owner?: User;
  reviewer?: User;
  finding?: Finding;
  evidence_list: Evidence[];
}

export interface Risk {
  risk_id: string;
  project_id: string;
  title: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigation_plan?: string;
  status: string;
}

export interface Issue {
  issue_id: string;
  project_id: string;
  title: string;
  severity: string;
  resolution_plan?: string;
  status: string;
}

export interface Dependency {
  dependency_id: string;
  source_project_id: string;
  target_project_id: string;
  description: string;
  dependency_type: string;
  status: string;
  source_project?: Project;
  target_project?: Project;
}

export interface Milestone {
  milestone_id: string;
  project_id: string;
  title: string;
  target_date: string;
  status: string;
}

export interface PMUpdate {
  update_id: string;
  review_id: string;
  submitted_by_id: string;
  what_changed?: string;
  support_required?: string;
  pending_decisions?: string;
  executive_actions?: string;
  submitted_at: string;
  submitted_by?: User;
}

export interface GovernanceAssessment {
  assessment_id: string;
  review_id: string;
  assessed_by_id: string;
  delivery_health: string;
  engineering_health: string;
  delivery_score: number;
  engineering_score: number;
  overall_score: number;
  comments?: string;
  assessed_at: string;
  assessed_by?: User;
}

export interface GovernanceDecision {
  decision_id: string;
  review_id: string;
  title: string;
  description?: string;
  owner_id: string;
  status: string;
  due_date: string;
  decision_date?: string;
  final_decision?: string;
  owner?: User;
}

export interface GovernanceReview {
  review_id: string;
  project_id: string;
  review_number: string;
  review_date: string;
  review_status: 'DRAFT' | 'IN_REVIEW' | 'COMPLETED';
  overall_health_status: 'GREEN' | 'AMBER' | 'RED';
  previous_review_id?: string;
  technology_center_manager_id: string;
  project?: Project;
  technology_center_manager?: User;
  pm_update?: PMUpdate;
  assessment?: GovernanceAssessment;
  decisions: GovernanceDecision[];
  governance_actions: Action[];
}

export interface AuditLog {
  log_id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details_json?: string;
  timestamp: string;
  user?: User;
}

export interface ExecutiveSummary {
  projects: { total: number; green: number; amber: number; red: number };
  audits: { total: number; total_findings: number; open_findings: number; critical_findings: number };
  actions: { total: number; overdue: number; pending_review: number };
  governance: { critical_risks: number; pending_decisions: number };
}

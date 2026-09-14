export interface Role {
  role_id: number;
  role_code: 'PM' | 'TL';
  role_name: string;
}

export interface User {
  user_id: number;
  display_name: string;
  email: string;
  username: string;
  roles: Role[];
}

export interface Project {
  project_id: number;
  project_code: string;
  project_name: string;
}

export interface ProjectHealth {
  project_health_id: number;
  governance_review_id: number;
  schedule_health: 'GREEN' | 'AMBER' | 'RED';
  budget_status: 'GREEN' | 'AMBER' | 'RED';
  open_risk_count: number;
  open_finding_count: number;
  overall_health: 'GREEN' | 'AMBER' | 'RED';
}

export interface TechnicalAssessment {
  technical_assessment_id: number;
  governance_review_id: number;
  technical_readiness_score: number; // 1-5
  technical_health: 'GREEN' | 'AMBER' | 'RED';
  comments?: string;
  assessed_by: number;
  assessed_at: string;
  assessor?: User;
}

export interface Action {
  action_id: number;
  finding_id: number;
  description: string;
  owner_id: number;
  status: string;
  due_date: string;
  owner?: User;
}

export interface Finding {
  finding_id: number;
  audit_id: number;
  finding_reference: string;
  title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  status: 'OPEN' | 'CLOSED';
  actions: Action[];
}

export interface Audit {
  audit_id: number;
  project_id: number;
  audit_name: string;
  audit_type: string;
  audit_status: string;
  planned_date: string;
  actual_date?: string;
  findings: Finding[];
}

export interface Risk {
  risk_id: number;
  project_id: number;
  title: string;
  status: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  probability: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GovernanceReview {
  governance_review_id: number;
  project_id: number;
  review_number: string;
  review_date: string;
  review_status: string;
  project?: Project;
  project_health?: ProjectHealth;
  technical_assessment?: TechnicalAssessment;
}

export interface LoginResponse {
  user: User;
  role_code: 'PM' | 'TL';
  assigned_project_id: number;
  token: string;
}

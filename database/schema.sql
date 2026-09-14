-- R&D Governance Portal Database Schema (MySQL Compatible)
-- Engine: InnoDB, Charset: utf8mb4

CREATE DATABASE IF NOT EXISTS rd_governance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rd_governance_db;

-- --------------------------------------------------------
-- 1. Users, Roles & Permissions (RBAC)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) DEFAULT 'R&D Governance',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(36) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- 2. Projects & Campaigns
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    owner_id VARCHAR(36) NOT NULL,
    health_status VARCHAR(20) DEFAULT 'HEALTHY', -- HEALTHY, ATTENTION, AT_RISK
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    description TEXT,
    owner_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNED', -- DRAFT, PLANNED, ACTIVE, COMPLETED, CANCELLED
    created_by VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- --------------------------------------------------------
-- 3. Audits
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS audits (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    campaign_id VARCHAR(36) NOT NULL,
    lead_auditor_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNED', -- PLANNED, IN_PROGRESS, FIELDWORK, ATTENTION, CLOSED
    audit_type VARCHAR(50) DEFAULT 'PROCESS', -- PROCESS, DESIGN_CONTROL, SOFTWARE_SAFETY, CYBERSECURITY, VENDOR
    recurrence_pattern VARCHAR(50) DEFAULT 'NONE', -- NONE, QUARTERLY, SEMI_ANNUAL, ANNUAL
    scope_description TEXT,
    estimated_hours DECIMAL(6,2) DEFAULT 40.00,
    milestone_id VARCHAR(36),
    closure_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (lead_auditor_id) REFERENCES users(id),
    FOREIGN KEY (milestone_id) REFERENCES milestones(id)
);

-- --------------------------------------------------------
-- 4. Findings & Corrective Actions
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS findings (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    audit_id VARCHAR(36) NOT NULL,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL, -- CRITICAL, MAJOR, MINOR
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, PENDING_REVIEW, CLOSED
    owner_id VARCHAR(36) NOT NULL,
    due_date DATE NOT NULL,
    closure_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (audit_id) REFERENCES audits(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS actions (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    finding_id VARCHAR(36) NOT NULL,
    description TEXT NOT NULL,
    owner_id VARCHAR(36) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, COMPLETED, OVERDUE, PENDING_REVIEW, CLOSED
    completion_date DATE,
    evidence_summary TEXT,
    reviewer_id VARCHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (finding_id) REFERENCES findings(id),
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- --------------------------------------------------------
-- 5. Risks & Milestones
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS risks (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    mitigation_plan TEXT,
    status VARCHAR(20) DEFAULT 'OPEN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS milestones (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    target_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PLANNED', -- PLANNED, IN_PROGRESS, COMPLETED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- --------------------------------------------------------
-- 6. Audit Logs & Notifications
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, STATUS_CHANGE, APPROVE, CLOSE
    entity_type VARCHAR(50) NOT NULL, -- Campaign, Audit, Finding, Action, Project, User
    entity_id VARCHAR(36) NOT NULL,
    details_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(36) PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL, -- ACTION, FINDING
    entity_id VARCHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by_id VARCHAR(36) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
);

-- Indexing for performance
CREATE INDEX idx_findings_severity ON findings(severity);
CREATE INDEX idx_findings_status ON findings(status);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_owner ON actions(owner_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_attachments_entity ON attachments(entity_id);


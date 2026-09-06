import sys
import os
from datetime import date, datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import engine, Base, SessionLocal
from app.models.user import User, Role, Permission
from app.models.project import Project, Risk, Milestone
from app.models.campaign import Campaign
from app.models.audit import Audit
from app.models.finding import Finding
from app.models.action import Action
from app.models.governance import AuditLog, Notification

def init_db():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Database already seeded.")
            return

        print("Seeding initial enterprise governance data...")

        # 1. Permissions
        permissions_data = [
            ("audit.read", "Read access to audits"),
            ("audit.create", "Create new audits"),
            ("audit.update", "Update audit details"),
            ("audit.delete", "Delete audits"),
            ("finding.read", "Read access to findings"),
            ("finding.create", "Create new findings"),
            ("finding.update", "Update findings"),
            ("finding.close", "Approve and close findings"),
            ("action.read", "Read access to corrective actions"),
            ("action.create", "Create new corrective actions"),
            ("action.update", "Update corrective action status"),
            ("action.complete", "Mark action as completed and submit evidence"),
            ("project.read", "Read access to projects"),
            ("project.update", "Update project details and health"),
            ("campaign.read", "Read access to campaigns"),
            ("campaign.create", "Create new campaigns"),
            ("campaign.update", "Update campaign details"),
            ("report.read", "View reports"),
            ("report.export", "Export reports to CSV/Excel/PDF"),
            ("user.manage", "Manage system users and role assignments"),
            ("role.manage", "Manage roles and permission matrix"),
        ]

        perm_dict = {}
        for code, desc in permissions_data:
            perm = Permission(code=code, description=desc)
            db.add(perm)
            perm_dict[code] = perm
        db.commit()

        # 2. Roles
        roles_config = {
            "ADMIN": list(perm_dict.keys()),
            "AUDITOR": ["audit.read", "audit.create", "audit.update", "finding.read", "finding.create", "finding.update", "action.read", "action.create", "action.update"],
            "AUDIT_MANAGER": ["audit.read", "audit.create", "audit.update", "audit.delete", "finding.read", "finding.create", "finding.update", "finding.close", "action.read", "action.create", "action.update"],
            "PROJECT_OWNER": ["project.read", "project.update", "campaign.read", "audit.read", "finding.read", "action.read"],
            "ACTION_OWNER": ["action.read", "action.update", "action.complete", "finding.read"],
            "EXECUTIVE": ["project.read", "campaign.read", "audit.read", "finding.read", "action.read", "report.read", "report.export"],
            "VIEWER": ["project.read", "campaign.read", "audit.read", "finding.read", "action.read", "report.read"]
        }

        role_dict = {}
        for role_name, perm_codes in roles_config.items():
            role = Role(name=role_name, description=f"{role_name} enterprise role")
            role.permissions = [perm_dict[c] for c in perm_codes if c in perm_dict]
            db.add(role)
            role_dict[role_name] = role
        db.commit()

        # 3. Users
        users_data = [
            ("admin", "admin@governance.org", "System Administrator", "IT & Governance", "ADMIN"),
            ("auditor_jane", "jane@governance.org", "Jane Doe (Lead Auditor)", "Quality Assurance", "AUDITOR"),
            ("audit_mgr_mark", "mark@governance.org", "Mark Vance (Audit Manager)", "Quality Assurance", "AUDIT_MANAGER"),
            ("proj_owner_sarah", "sarah@governance.org", "Sarah Jenkins (Project Lead)", "R&D Engineering", "PROJECT_OWNER"),
            ("action_owner_alex", "alex@governance.org", "Alex Rivera (Action Owner)", "Software Development", "ACTION_OWNER"),
            ("executive_david", "david@governance.org", "David Sterling (VP Quality)", "Executive Office", "EXECUTIVE"),
            ("viewer_sam", "sam@governance.org", "Sam Lee (Governance Viewer)", "Operations", "VIEWER")
        ]

        user_dict = {}
        for username, email, full_name, dept, role_name in users_data:
            user = User(
                username=username,
                email=email,
                full_name=full_name,
                department=dept,
                is_active=True
            )
            user.roles = [role_dict[role_name]]
            db.add(user)
            user_dict[username] = user
        db.commit()

        # 4. Projects
        projects_data = [
            ("PRJ-001", "NextGen Diagnostics", "Advanced AI medical diagnostic platform for clinical labs", user_dict["proj_owner_sarah"].id, "HEALTHY"),
            ("PRJ-002", "Autonomous Platform", "Self-governing industrial automation control software", user_dict["proj_owner_sarah"].id, "ATTENTION"),
            ("PRJ-003", "Smart Controls", "Precision robotics control systems for manufacturing", user_dict["proj_owner_sarah"].id, "HEALTHY"),
            ("PRJ-004", "Digital Energy", "Enterprise grid energy monitoring and compliance engine", user_dict["proj_owner_sarah"].id, "AT_RISK")
        ]

        project_dict = {}
        for code, name, desc, owner_id, health in projects_data:
            proj = Project(code=code, name=name, description=desc, owner_id=owner_id, health_status=health)
            db.add(proj)
            project_dict[code] = proj
        db.commit()

        # Risks & Milestones for Projects
        db.add(Risk(project_id=project_dict["PRJ-001"].id, title="ISO 13485 Medical Device Certification Delay", risk_level="HIGH", mitigation_plan="Perform preliminary compliance pre-audit", status="OPEN"))
        db.add(Risk(project_id=project_dict["PRJ-002"].id, title="Unmapped API Security Boundaries", risk_level="HIGH", mitigation_plan="Conduct penetration testing and update architecture logs", status="OPEN"))
        db.add(Risk(project_id=project_dict["PRJ-004"].id, title="Grid Integration Protocol Discrepancy", risk_level="MEDIUM", mitigation_plan="Schedule vendor alignment workshop", status="OPEN"))

        db.add(Milestone(project_id=project_dict["PRJ-001"].id, title="Phase 1 Design History File Approval", target_date=date.today() + timedelta(days=15), status="IN_PROGRESS"))
        db.add(Milestone(project_id=project_dict["PRJ-002"].id, title="Safety Architecture Audit Signoff", target_date=date.today() + timedelta(days=30), status="PLANNED"))
        db.commit()

        # 5. Campaigns
        campaigns_data = [
            ("CMP-2026-Q1", "Q1 Medical Software Compliance Campaign", project_dict["PRJ-001"].id, "Annual software lifecycle governance review for medical diagnostics", user_dict["proj_owner_sarah"].id, date.today() - timedelta(days=60), date.today() + timedelta(days=30), "ACTIVE", user_dict["admin"].id),
            ("CMP-2026-Q2", "Autonomous Systems Safety Audit Campaign", project_dict["PRJ-002"].id, "Comprehensive safety and hazard risk review for industrial platforms", user_dict["proj_owner_sarah"].id, date.today() - timedelta(days=30), date.today() + timedelta(days=60), "ACTIVE", user_dict["admin"].id),
            ("CMP-2026-Q3", "Digital Grid Cyber Security Review", project_dict["PRJ-004"].id, "Cybersecurity and IEC 62443 standard compliance review", user_dict["proj_owner_sarah"].id, date.today(), date.today() + timedelta(days=90), "PLANNED", user_dict["admin"].id),
        ]

        campaign_dict = {}
        for code, name, prj_id, desc, owner_id, sdate, edate, status, cby in campaigns_data:
            cmp = Campaign(code=code, name=name, project_id=prj_id, description=desc, owner_id=owner_id, start_date=sdate, end_date=edate, status=status, created_by=cby)
            db.add(cmp)
            campaign_dict[code] = cmp
        db.commit()

        # 6. Audits
        audits_data = [
            ("AUD-001", "QMS Process Audit - Diagnostics", campaign_dict["CMP-2026-Q1"].id, user_dict["auditor_jane"].id, date.today() - timedelta(days=45), date.today() - timedelta(days=10), "FIELDWORK", 65.00),
            ("AUD-002", "Design Control Compliance Review", campaign_dict["CMP-2026-Q1"].id, user_dict["auditor_jane"].id, date.today() - timedelta(days=20), date.today() + timedelta(days=10), "IN_PROGRESS", 40.00),
            ("AUD-003", "Software Quality Audit - Autonomous", campaign_dict["CMP-2026-Q2"].id, user_dict["auditor_jane"].id, date.today() - timedelta(days=15), date.today() + timedelta(days=25), "ATTENTION", 25.00),
            ("AUD-004", "Robotic Firmware Safety Audit", campaign_dict["CMP-2026-Q2"].id, user_dict["auditor_jane"].id, date.today() + timedelta(days=10), date.today() + timedelta(days=40), "PLANNED", 0.00),
        ]

        audit_dict = {}
        for code, title, cmp_id, auditor_id, sdate, edate, status, pct in audits_data:
            aud = Audit(code=code, title=title, campaign_id=cmp_id, lead_auditor_id=auditor_id, start_date=sdate, end_date=edate, status=status, closure_percentage=pct)
            db.add(aud)
            audit_dict[code] = aud
        db.commit()

        # 7. Findings
        findings_data = [
            ("FND-001", audit_dict["AUD-001"].id, "Critical software compliance issue in AI diagnostic module", "Software validation protocols do not cover deep learning edge cases required by ISO 13485.", "CRITICAL", "OPEN", user_dict["action_owner_alex"].id, date.today() + timedelta(days=7)),
            ("FND-002", audit_dict["AUD-001"].id, "Major documentation gap in risk analysis matrix", "Risk traceability matrix is missing verification records for risk reduction controls #12 and #14.", "MAJOR", "IN_PROGRESS", user_dict["action_owner_alex"].id, date.today() + timedelta(days=14)),
            ("FND-003", audit_dict["AUD-002"].id, "Minor process deviation in code review approvals", "Two pull requests were merged without explicit secondary signoff from Quality Lead.", "MINOR", "OPEN", user_dict["action_owner_alex"].id, date.today() + timedelta(days=21)),
            ("FND-004", audit_dict["AUD-003"].id, "Incomplete safety hazard analysis for autonomous override", "Fail-safe mechanism testing lacks environmental disruption simulation results.", "CRITICAL", "OPEN", user_dict["action_owner_alex"].id, date.today() + timedelta(days=5)),
            ("FND-005", audit_dict["AUD-003"].id, "Outdated unit test suite for sensor integration layer", "24% of sensor integration unit test cases failed during regression run.", "MAJOR", "CLOSED", user_dict["action_owner_alex"].id, date.today() - timedelta(days=5)),
        ]

        finding_dict = {}
        for code, aud_id, title, desc, sev, status, owner_id, ddate in findings_data:
            fnd = Finding(code=code, audit_id=aud_id, title=title, description=desc, severity=sev, status=status, owner_id=owner_id, due_date=ddate)
            if status == "CLOSED":
                fnd.closure_info = "Approved by Audit Manager following re-testing."
            db.add(fnd)
            finding_dict[code] = fnd
        db.commit()

        # 8. Actions
        actions_data = [
            ("ACT-001", finding_dict["FND-001"].id, "Update validation documentation and execute AI model edge case test protocol", user_dict["action_owner_alex"].id, date.today() + timedelta(days=7), "OPEN", None, None),
            ("ACT-002", finding_dict["FND-002"].id, "Complete corrective training and update Risk Traceability Matrix RTM-V4", user_dict["action_owner_alex"].id, date.today() + timedelta(days=14), "IN_PROGRESS", None, "Updated RTM draft attached for review."),
            ("ACT-003", finding_dict["FND-003"].id, "Review software requirements and implement strict GitHub PR merge protection rules", user_dict["action_owner_alex"].id, date.today() + timedelta(days=21), "OPEN", None, None),
            ("ACT-004", finding_dict["FND-004"].id, "Conduct environmental failure simulation test and submit evidence report", user_dict["action_owner_alex"].id, date.today() - timedelta(days=2), "OVERDUE", None, None),
            ("ACT-005", finding_dict["FND-005"].id, "Fix broken sensor integration test mocks and rerun regression test suite", user_dict["action_owner_alex"].id, date.today() - timedelta(days=5), "CLOSED", date.today() - timedelta(days=5), "100% test pass rate achieved in CI/CD pipeline."),
        ]

        for code, fnd_id, desc, owner_id, ddate, status, cdate, evidence in actions_data:
            act = Action(
                code=code,
                finding_id=fnd_id,
                description=desc,
                owner_id=owner_id,
                due_date=ddate,
                status=status,
                completion_date=cdate,
                evidence_summary=evidence,
                reviewer_id=user_dict["audit_mgr_mark"].id if status in ["CLOSED", "PENDING_REVIEW"] else None
            )
            db.add(act)
        db.commit()

        # 9. Audit Logs
        db.add(AuditLog(user_id=user_dict["admin"].id, action_type="CREATE", entity_type="Campaign", entity_id=campaign_dict["CMP-2026-Q1"].id, details_json='{"name": "Q1 Medical Software Compliance Campaign"}'))
        db.add(AuditLog(user_id=user_dict["auditor_jane"].id, action_type="CREATE", entity_type="Finding", entity_id=finding_dict["FND-001"].id, details_json='{"severity": "CRITICAL", "code": "FND-001"}'))
        db.commit()

        print("Database seeded successfully with enterprise sample data!")

    finally:
        db.close()

if __name__ == "__main__":
    init_db()

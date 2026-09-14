import sys
import os
from datetime import date, datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.database import engine, SessionLocal, Base
from app.models import (
    User, Role, UserRole, Project, ProjectMember, GovernanceReview,
    ProjectHealth, TechnicalAssessment, Audit, Finding, Action, Risk
)

def seed():
    print("Initializing Governance Review POC Database Schema (3 Assigned Projects)...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("1. Seeding Users and Roles...")
        role_pm = Role(role_code="PM", role_name="Project Manager")
        role_tl = Role(role_code="TL", role_name="Technical Lead")
        db.add_all([role_pm, role_tl])
        db.commit()

        user_priya = User(
            user_id=1, display_name="Priya Sharma", email="priya.pm@demo.local", username="pm.demo", password="PM@123"
        )
        user_arjun = User(
            user_id=2, display_name="Arjun Mehta", email="arjun.tl@demo.local", username="tl.demo", password="TL@123"
        )
        db.add_all([user_priya, user_arjun])
        db.commit()

        ur_pm = UserRole(user_id=user_priya.user_id, role_id=role_pm.role_id)
        ur_tl = UserRole(user_id=user_arjun.user_id, role_id=role_tl.role_id)
        db.add_all([ur_pm, ur_tl])
        db.commit()

        print("2. Seeding 3 Projects & Project Memberships...")
        p1 = Project(project_id=1, project_code="RD-AUTO-001", project_name="Autonomous Platform Development")
        p2 = Project(project_id=2, project_code="RD-EVTOL-002", project_name="eVTOL Flight Control Avionics")
        p3 = Project(project_id=3, project_code="RD-SENS-003", project_name="Solid-State LiDAR Sensor Suite")
        db.add_all([p1, p2, p3])
        db.commit()

        # Assign both PM and TL to all 3 projects
        memberships = [
            ProjectMember(project_id=p1.project_id, user_id=user_priya.user_id, project_role="PM"),
            ProjectMember(project_id=p1.project_id, user_id=user_arjun.user_id, project_role="TL"),
            ProjectMember(project_id=p2.project_id, user_id=user_priya.user_id, project_role="PM"),
            ProjectMember(project_id=p2.project_id, user_id=user_arjun.user_id, project_role="TL"),
            ProjectMember(project_id=p3.project_id, user_id=user_priya.user_id, project_role="PM"),
            ProjectMember(project_id=p3.project_id, user_id=user_arjun.user_id, project_role="TL"),
        ]
        db.add_all(memberships)
        db.commit()

        print("3. Seeding Governance Reviews, Health & Technical Assessments...")
        # Project 1 Governance Review
        gr1 = GovernanceReview(governance_review_id=1, project_id=p1.project_id, review_number="GR-AUTO-2026-01", review_date=date(2026, 8, 25), review_status="IN_PROGRESS")
        db.add(gr1)
        db.commit()
        ph1 = ProjectHealth(governance_review_id=gr1.governance_review_id, schedule_health="GREEN", budget_status="GREEN", open_risk_count=2, open_finding_count=2, overall_health="AMBER")
        ta1 = TechnicalAssessment(governance_review_id=gr1.governance_review_id, technical_readiness_score=4, technical_health="AMBER", comments="Technical readiness progressing well. Two technical risks require monitoring.", assessed_by=user_arjun.user_id, assessed_at=datetime.utcnow())
        db.add_all([ph1, ta1])

        # Project 2 Governance Review
        gr2 = GovernanceReview(governance_review_id=2, project_id=p2.project_id, review_number="GR-EVTOL-2026-02", review_date=date(2026, 8, 28), review_status="IN_PROGRESS")
        db.add(gr2)
        db.commit()
        ph2 = ProjectHealth(governance_review_id=gr2.governance_review_id, schedule_health="AMBER", budget_status="RED", open_risk_count=3, open_finding_count=1, overall_health="RED")
        ta2 = TechnicalAssessment(governance_review_id=gr2.governance_review_id, technical_readiness_score=3, technical_health="RED", comments="Avionics DO-178C MC/DC coverage deficit requires immediate senior engineer support.", assessed_by=user_arjun.user_id, assessed_at=datetime.utcnow())
        db.add_all([ph2, ta2])

        # Project 3 Governance Review
        gr3 = GovernanceReview(governance_review_id=3, project_id=p3.project_id, review_number="GR-SENS-2026-03", review_date=date(2026, 9, 1), review_status="IN_PROGRESS")
        db.add(gr3)
        db.commit()
        ph3 = ProjectHealth(governance_review_id=gr3.governance_review_id, schedule_health="GREEN", budget_status="GREEN", open_risk_count=1, open_finding_count=0, overall_health="GREEN")
        ta3 = TechnicalAssessment(governance_review_id=gr3.governance_review_id, technical_readiness_score=5, technical_health="GREEN", comments="LiDAR 1550nm diode freeze complete. Ready for production gate review.", assessed_by=user_arjun.user_id, assessed_at=datetime.utcnow())
        db.add_all([ph3, ta3])
        db.commit()

        print("4. Seeding Audits, Findings & Actions...")
        # Audits for Project 1
        a1_1 = Audit(audit_id=1, project_id=p1.project_id, audit_name="Software Quality Audit", audit_type="Quality", audit_status="CLOSED", planned_date=date(2026, 8, 10), actual_date=date(2026, 8, 12))
        a1_2 = Audit(audit_id=2, project_id=p1.project_id, audit_name="Design Control Review", audit_type="Design Control", audit_status="IN_PROGRESS", planned_date=date(2026, 8, 20))
        db.add_all([a1_1, a1_2])
        db.commit()

        f1_1 = Finding(finding_id=1, audit_id=a1_1.audit_id, finding_reference="FND-001", title="Incomplete software verification evidence", severity="MAJOR", status="OPEN")
        f1_2 = Finding(finding_id=2, audit_id=a1_2.audit_id, finding_reference="FND-002", title="Missing review record", severity="MINOR", status="OPEN")
        f1_3 = Finding(finding_id=3, audit_id=a1_1.audit_id, finding_reference="FND-003", title="Documentation update required", severity="MINOR", status="CLOSED")
        db.add_all([f1_1, f1_2, f1_3])
        db.commit()

        act1_1 = Action(action_id=1, finding_id=f1_1.finding_id, description="Complete software verification evidence package", owner_id=user_arjun.user_id, status="IN_PROGRESS", due_date=date(2026, 9, 30))
        act1_2 = Action(action_id=2, finding_id=f1_2.finding_id, description="Complete missing review documentation", owner_id=user_priya.user_id, status="OPEN", due_date=date(2026, 10, 15))
        db.add_all([act1_1, act1_2])
        db.commit()

        # Audits for Project 2
        a2_1 = Audit(audit_id=3, project_id=p2.project_id, audit_name="Avionics DO-178C Audit", audit_type="Flight Safety", audit_status="IN_PROGRESS", planned_date=date(2026, 8, 15))
        db.add(a2_1)
        db.commit()

        f2_1 = Finding(finding_id=4, audit_id=a2_1.audit_id, finding_reference="FND-004", title="MC/DC coverage branch gap in altitude controller", severity="CRITICAL", status="OPEN")
        db.add(f2_1)
        db.commit()

        act2_1 = Action(action_id=3, finding_id=f2_1.finding_id, description="Add decision unit tests for altitude gain limiter", owner_id=user_arjun.user_id, status="IN_PROGRESS", due_date=date(2026, 9, 20))
        db.add(act2_1)
        db.commit()

        print("5. Seeding Project Risks...")
        r1_1 = Risk(risk_id=1, project_id=p1.project_id, title="Technical integration delay", status="OPEN", impact="HIGH", probability="MEDIUM")
        r1_2 = Risk(risk_id=2, project_id=p1.project_id, title="Testing resource availability", status="OPEN", impact="MEDIUM", probability="MEDIUM")
        r2_1 = Risk(risk_id=3, project_id=p2.project_id, title="FAA DER certification schedule shift", status="OPEN", impact="HIGH", probability="HIGH")
        r2_2 = Risk(risk_id=4, project_id=p2.project_id, title="Battery discharge degradation at 10,000ft", status="OPEN", impact="HIGH", probability="MEDIUM")
        r3_1 = Risk(risk_id=5, project_id=p3.project_id, title="Laser diode thermal wavelength drift", status="OPEN", impact="LOW", probability="LOW")
        db.add_all([r1_1, r1_2, r2_1, r2_2, r3_1])
        db.commit()

        print("DATABASE SEEDED SUCCESSFULLY WITH 3 ASSIGNED PROJECTS!")

    except Exception as e:
        db.rollback()
        print("SEEDING ERROR:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()

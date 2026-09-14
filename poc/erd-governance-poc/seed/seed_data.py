import sys
import os
from datetime import date, datetime, timedelta

# Add backend directory to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.database import engine, SessionLocal, Base
from app.models.models import (
    User, Role, Permission, Portfolio, TechnologyCenter, ProjectPhase, Project,
    Audit, AuditParticipant, Finding, Action, Evidence, Risk, Issue, Dependency, Milestone,
    GovernanceReview, PMUpdate, GovernanceAssessment, GovernanceDecision, AuditLog
)

def seed():
    print("Initializing Database Schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("1. Seeding Roles and Permissions...")
        perms = {
            "ALL": Permission(permission_id="perm-all", code="ALL", description="Full System Control"),
            "CREATE": Permission(permission_id="perm-create", code="CREATE", description="Create Records"),
            "READ": Permission(permission_id="perm-read", code="READ", description="Read Records"),
            "UPDATE": Permission(permission_id="perm-update", code="UPDATE", description="Update Records"),
            "DELETE": Permission(permission_id="perm-delete", code="DELETE", description="Delete Records"),
            "APPROVE": Permission(permission_id="perm-approve", code="APPROVE", description="Approve Records"),
            "REJECT": Permission(permission_id="perm-reject", code="REJECT", description="Reject Records"),
            "ASSIGN": Permission(permission_id="perm-assign", code="ASSIGN", description="Assign Owners"),
            "CLOSE": Permission(permission_id="perm-close", code="CLOSE", description="Close Records"),
            "COMPLETE_REVIEW": Permission(permission_id="perm-complete-review", code="COMPLETE_REVIEW", description="Complete Governance Reviews"),
            "UPLOAD_EVIDENCE": Permission(permission_id="perm-upload-evidence", code="UPLOAD_EVIDENCE", description="Upload Evidence Files"),
            "REVIEW_EVIDENCE": Permission(permission_id="perm-review-evidence", code="REVIEW_EVIDENCE", description="Review & Approve Evidence")
        }
        for p in perms.values():
            db.add(p)

        roles = {
            "ADMIN": Role(role_id="role-admin", name="ADMIN", description="System Administrator"),
            "PROJECT_MANAGER": Role(role_id="role-pm", name="PROJECT_MANAGER", description="Project Manager"),
            "TECHNICAL_LEAD": Role(role_id="role-tech-lead", name="TECHNICAL_LEAD", description="Technical Lead"),
            "AUDITOR": Role(role_id="role-auditor", name="AUDITOR", description="Lead / Staff Auditor"),
            "AUDIT_MANAGER": Role(role_id="role-audit-mgr", name="AUDIT_MANAGER", description="Audit Manager"),
            "TC_MANAGER": Role(role_id="role-tc-mgr", name="TECHNOLOGY_CENTER_MANAGER", description="Technology Center Manager / Reviewer"),
            "ACTION_OWNER": Role(role_id="role-action-owner", name="ACTION_OWNER", description="Corrective Action Owner"),
            "EXECUTIVE": Role(role_id="role-exec", name="EXECUTIVE", description="Executive / Leadership"),
            "VIEWER": Role(role_id="role-viewer", name="VIEWER", description="Read-Only Stakeholder")
        }
        for r in roles.values():
            db.add(r)
        db.commit()

        # Assign permissions to roles
        roles["ADMIN"].permissions = list(perms.values())
        roles["PROJECT_MANAGER"].permissions = [perms["READ"], perms["CREATE"], perms["UPDATE"], perms["UPLOAD_EVIDENCE"]]
        roles["TECHNICAL_LEAD"].permissions = [perms["READ"], perms["UPDATE"]]
        roles["AUDITOR"].permissions = [perms["READ"], perms["CREATE"], perms["UPDATE"], perms["REVIEW_EVIDENCE"], perms["CLOSE"]]
        roles["AUDIT_MANAGER"].permissions = [perms["READ"], perms["CREATE"], perms["UPDATE"], perms["APPROVE"], perms["CLOSE"]]
        roles["TC_MANAGER"].permissions = [perms["READ"], perms["CREATE"], perms["UPDATE"], perms["APPROVE"], perms["COMPLETE_REVIEW"]]
        roles["ACTION_OWNER"].permissions = [perms["READ"], perms["UPDATE"], perms["UPLOAD_EVIDENCE"]]
        roles["EXECUTIVE"].permissions = [perms["READ"]]
        roles["VIEWER"].permissions = [perms["READ"]]
        db.commit()

        print("2. Seeding 9 Demo Users...")
        users = {
            "admin": User(user_id="usr-admin-01", username="admin", email="admin@enterprise.com", full_name="System Admin", department="IT Governance", roles=[roles["ADMIN"]]),
            "pm_jordan": User(user_id="usr-pm-01", username="jordan_park", email="jordan.park@enterprise.com", full_name="Jordan Park", department="Autonomous Platforms", roles=[roles["PROJECT_MANAGER"]]),
            "tech_sarah": User(user_id="usr-tl-01", username="sarah_chen", email="sarah.chen@enterprise.com", full_name="Sarah Chen", department="AI Systems", roles=[roles["TECHNICAL_LEAD"]]),
            "auditor_alex": User(user_id="usr-aud-01", username="alex_morgan", email="alex.morgan@enterprise.com", full_name="Alex Morgan", department="Quality Assurance", roles=[roles["AUDITOR"]]),
            "audit_mgr_elena": User(user_id="usr-audmgr-01", username="elena_rostova", email="elena.rostova@enterprise.com", full_name="Elena Rostova", department="Audit & Compliance", roles=[roles["AUDIT_MANAGER"]]),
            "tc_mgr_marcus": User(user_id="usr-tcmgr-01", username="marcus_vance", email="marcus.vance@enterprise.com", full_name="Marcus Vance", department="Robotics Tech Center", roles=[roles["TC_MANAGER"]]),
            "action_owner_david": User(user_id="usr-actown-01", username="david_kim", email="david.kim@enterprise.com", full_name="David Kim", department="Software Engineering", roles=[roles["ACTION_OWNER"]]),
            "exec_rachel": User(user_id="usr-exec-01", username="rachel_adams", email="rachel.adams@enterprise.com", full_name="Rachel Adams", department="Executive Office", roles=[roles["EXECUTIVE"]]),
            "viewer_sam": User(user_id="usr-view-01", username="sam_taylor", email="sam.taylor@enterprise.com", full_name="Sam Taylor", department="PMO Office", roles=[roles["VIEWER"]])
        }
        for u in users.values():
            db.add(u)
        db.commit()

        print("3. Seeding Portfolios, Technology Centers, and Phases...")
        port_auto = Portfolio(portfolio_id="port-01", code="PORT-AUTO", name="Autonomous Systems & Robotics", description="Self-driving platforms and automated vehicle technologies.")
        port_aero = Portfolio(portfolio_id="port-02", code="PORT-AERO", name="Aerospace & Advanced Propulsion", description="Next-generation flight control systems and eVTOL platforms.")
        db.add_all([port_auto, port_aero])

        tc_robo = TechnologyCenter(technology_center_id="tc-01", code="TC-ROBO", name="Robotics & Perception Center", lead_user_id=users["tc_mgr_marcus"].user_id)
        tc_aero = TechnologyCenter(technology_center_id="tc-02", code="TC-AERO", name="Flight Software & Avionics Center", lead_user_id=users["tc_mgr_marcus"].user_id)
        db.add_all([tc_robo, tc_aero])

        phases = [
            ProjectPhase(phase_id="phase-01", code="PH-1", name="Concept & Feasibility", sequence=1),
            ProjectPhase(phase_id="phase-02", code="PH-2", name="Detailed Design", sequence=2),
            ProjectPhase(phase_id="phase-03", code="PH-3", name="Verification & Validation", sequence=3),
            ProjectPhase(phase_id="phase-04", code="PH-4", name="Production Ramp", sequence=4)
        ]
        db.add_all(phases)
        db.commit()

        print("4. Seeding 5 Projects...")
        projects = [
            Project(
                project_id="proj-01", code="PRJ-AUTO-01", name="Autonomous Vehicle Platform",
                description="L4 Autonomous driving software platform for urban fleet operations.",
                portfolio_id=port_auto.portfolio_id, technology_center_id=tc_robo.technology_center_id,
                current_phase_id=phases[2].phase_id, project_manager_id=users["pm_jordan"].user_id,
                technical_lead_id=users["tech_sarah"].user_id, overall_health_status="AMBER"
            ),
            Project(
                project_id="proj-02", code="PRJ-EVTOL-02", name="eVTOL Urban Navigation System",
                description="Electric vertical takeoff flight avionics and sensor fusion control.",
                portfolio_id=port_aero.portfolio_id, technology_center_id=tc_aero.technology_center_id,
                current_phase_id=phases[1].phase_id, project_manager_id=users["pm_jordan"].user_id,
                technical_lead_id=users["tech_sarah"].user_id, overall_health_status="RED"
            ),
            Project(
                project_id="proj-03", code="PRJ-SENS-03", name="Solid-State LiDAR Array",
                description="Next-generation 1550nm solid-state LiDAR sensor suite.",
                portfolio_id=port_auto.portfolio_id, technology_center_id=tc_robo.technology_center_id,
                current_phase_id=phases[3].phase_id, project_manager_id=users["pm_jordan"].user_id,
                technical_lead_id=users["tech_sarah"].user_id, overall_health_status="GREEN"
            ),
            Project(
                project_id="proj-04", code="PRJ-BATT-04", name="High-Density Battery Management",
                description="Thermal management & cell balancing system for heavy robotics.",
                portfolio_id=port_auto.portfolio_id, technology_center_id=tc_robo.technology_center_id,
                current_phase_id=phases[2].phase_id, project_manager_id=users["pm_jordan"].user_id,
                technical_lead_id=users["tech_sarah"].user_id, overall_health_status="GREEN"
            ),
            Project(
                project_id="proj-05", code="PRJ-SIM-05", name="Hardware-in-the-Loop Simulator",
                description="Cloud-native simulation platform for sensor playback and validation.",
                portfolio_id=port_auto.portfolio_id, technology_center_id=tc_robo.technology_center_id,
                current_phase_id=phases[1].phase_id, project_manager_id=users["pm_jordan"].user_id,
                technical_lead_id=users["tech_sarah"].user_id, overall_health_status="AMBER"
            )
        ]
        db.add_all(projects)
        db.commit()

        print("5. Seeding Audits & Audit Participants...")
        audits = [
            Audit(
                audit_id="audit-01", code="AUD-2026-001", title="Functional Safety Compliance Audit (ISO 26262)",
                project_id=projects[0].project_id, lead_auditor_id=users["auditor_alex"].user_id,
                start_date=date(2026, 8, 1), end_date=date(2026, 8, 15), status="COMPLETED",
                audit_type="SOFTWARE_SAFETY", scope_description="Review software architecture hazard analysis and ASIL-D decomposition."
            ),
            Audit(
                audit_id="audit-02", code="AUD-2026-002", title="Cybersecurity & OTA Gateway Review (ISO 21434)",
                project_id=projects[0].project_id, lead_auditor_id=users["auditor_alex"].user_id,
                start_date=date(2026, 8, 20), end_date=date(2026, 9, 5), status="IN_PROGRESS",
                audit_type="CYBERSECURITY", scope_description="Threat analysis, risk assessment, and cryptographic key management."
            ),
            Audit(
                audit_id="audit-03", code="AUD-2026-003", title="Avionics Software Design Controls Audit",
                project_id=projects[1].project_id, lead_auditor_id=users["auditor_alex"].user_id,
                start_date=date(2026, 7, 10), end_date=date(2026, 7, 25), status="CLOSED",
                audit_type="DESIGN_CONTROL", scope_description="DO-178C Level A compliance audit for flight control unit."
            ),
            Audit(
                audit_id="audit-04", code="AUD-2026-004", title="LiDAR Optical Quality & Calibration Audit",
                project_id=projects[2].project_id, lead_auditor_id=users["auditor_alex"].user_id,
                start_date=date(2026, 9, 1), end_date=date(2026, 9, 12), status="IN_PROGRESS",
                audit_type="PROCESS", scope_description="Verification of cleanroom optical assembly and sensor calibration."
            ),
            Audit(
                audit_id="audit-05", code="AUD-2026-005", title="Battery Thermal Safety Audit",
                project_id=projects[3].project_id, lead_auditor_id=users["auditor_alex"].user_id,
                start_date=date(2026, 9, 10), end_date=date(2026, 9, 20), status="PLANNED",
                audit_type="SOFTWARE_SAFETY", scope_description="Thermal runaway detection algorithm safety validation."
            )
        ]
        db.add_all(audits)
        db.commit()

        participants = [
            AuditParticipant(audit_id=audits[0].audit_id, user_id=users["tech_sarah"].user_id, role_in_audit="Auditee Lead"),
            AuditParticipant(audit_id=audits[0].audit_id, user_id=users["pm_jordan"].user_id, role_in_audit="Project Manager"),
            AuditParticipant(audit_id=audits[1].audit_id, user_id=users["action_owner_david"].user_id, role_in_audit="Security Engineer"),
        ]
        db.add_all(participants)
        db.commit()

        print("6. Seeding 10+ Findings...")
        findings = [
            Finding(
                finding_id="find-01", code="FND-001", audit_id=audits[0].audit_id,
                title="Missing Fault Tree Analysis for Steering Actuator Control",
                description="FTA document does not account for dual-microcontroller communication watchdog reset failures.",
                severity="CRITICAL", status="IN_PROGRESS", owner_id=users["action_owner_david"].user_id, due_date=date(2026, 9, 25)
            ),
            Finding(
                finding_id="find-02", code="FND-002", audit_id=audits[0].audit_id,
                title="Incomplete Automated Test Traceability for Perception Pipeline",
                description="18 requirement items lack direct unit test mapping in CI/CD report.",
                severity="MAJOR", status="IN_PROGRESS", owner_id=users["action_owner_david"].user_id, due_date=date(2026, 10, 1)
            ),
            Finding(
                finding_id="find-03", code="FND-003", audit_id=audits[1].audit_id,
                title="Unencrypted OTA Module Debug Header Enabled in Field Firmware",
                description="JTAG interface disabled in register but hardware pads remain accessible.",
                severity="CRITICAL", status="OPEN", owner_id=users["action_owner_david"].user_id, due_date=date(2026, 9, 20)
            ),
            Finding(
                finding_id="find-04", code="FND-004", audit_id=audits[1].audit_id,
                title="Hardcoded API Gateway Encryption Key in Test Script",
                description="Integration test files committed to git repository contain staging HSM credentials.",
                severity="CRITICAL", status="OPEN", owner_id=users["action_owner_david"].user_id, due_date=date(2026, 9, 18)
            ),
            Finding(
                finding_id="find-05", code="FND-005", audit_id=audits[2].audit_id,
                title="DO-178C MC/DC Code Coverage Deficit in Altitude Controller",
                description="Branch coverage reached 92%, failing required 100% MC/DC threshold.",
                severity="MAJOR", status="CLOSED", owner_id=users["tech_sarah"].user_id, due_date=date(2026, 8, 15)
            ),
            Finding(
                finding_id="find-06", code="FND-006", audit_id=audits[3].audit_id,
                title="Sensor Calibration Rig Out-of-Spec Temperature Range",
                description="Thermal chamber log showed +/- 3C variance during laser diode profiling.",
                severity="MINOR", status="OPEN", owner_id=users["action_owner_david"].user_id, due_date=date(2026, 10, 10)
            ),
            Finding(
                finding_id="find-07", code="FND-007", audit_id=audits[3].audit_id,
                title="Uncertified Supplier Optical Lens Coating Batch",
                description="Subcontractor used unvalidated AR coating formulation on Batch 4 lenses.",
                severity="MAJOR", status="OPEN", owner_id=users["action_owner_david"].user_id, due_date=date(2026, 10, 15)
            ),
            Finding(
                finding_id="find-08", code="FND-008", audit_id=audits[0].audit_id,
                title="Memory Allocation Dynamic Heap Usage in Real-Time Kernel",
                description="ISO 26262 forbids dynamic memory allocation after initialization phase.",
                severity="MAJOR", status="IN_PROGRESS", owner_id=users["tech_sarah"].user_id, due_date=date(2026, 9, 30)
            ),
            Finding(
                finding_id="find-09", code="FND-009", audit_id=audits[1].audit_id,
                title="CAN-FD Bus Message Spoofing Vulnerability",
                description="SecOC (Secure On-board Communication) MAC truncation length below 64 bits.",
                severity="CRITICAL", status="OPEN", owner_id=users["action_owner_david"].user_id, due_date=date(2026, 9, 22)
            ),
            Finding(
                finding_id="find-10", code="FND-010", audit_id=audits[2].audit_id,
                title="Outdated Third-Party Real-Time OS Library",
                description="FreeRTOS v10.2 contains known vulnerability CVE-2021-31571.",
                severity="MAJOR", status="CLOSED", owner_id=users["tech_sarah"].user_id, due_date=date(2026, 8, 1)
            )
        ]
        db.add_all(findings)
        db.commit()

        print("7. Seeding 15+ Actions (Findings & Governance Review Originated)...")
        actions = [
            Action(
                action_id="act-01", code="ACT-001", description="Update Steering Actuator Fault Tree Analysis document with dual-MCU reset model.",
                finding_id=findings[0].finding_id, owner_id=users["action_owner_david"].user_id, reviewer_id=users["auditor_alex"].user_id,
                priority="HIGH", status="PENDING_REVIEW", due_date=date(2026, 9, 25), review_status="PENDING"
            ),
            Action(
                action_id="act-02", code="ACT-002", description="Implement requirements traceability matrix script in Jenkins pipeline.",
                finding_id=findings[1].finding_id, owner_id=users["action_owner_david"].user_id, reviewer_id=users["auditor_alex"].user_id,
                priority="MEDIUM", status="IN_PROGRESS", due_date=date(2026, 10, 1), review_status="NOT_SUBMITTED"
            ),
            Action(
                action_id="act-03", code="ACT-003", description="Physical removal and potting of external JTAG headers on Gateway PCB v2.",
                finding_id=findings[2].finding_id, owner_id=users["action_owner_david"].user_id, reviewer_id=users["auditor_alex"].user_id,
                priority="HIGH", status="OVERDUE", due_date=date(2026, 9, 10), review_status="NOT_SUBMITTED"
            ),
            Action(
                action_id="act-04", code="ACT-004", description="Revoke exposed HSM keys and migrate CI/CD secrets to HashiCorp Vault.",
                finding_id=findings[3].finding_id, owner_id=users["action_owner_david"].user_id, reviewer_id=users["auditor_alex"].user_id,
                priority="HIGH", status="IN_PROGRESS", due_date=date(2026, 9, 18), review_status="NOT_SUBMITTED"
            ),
            Action(
                action_id="act-05", code="ACT-005", description="Add modified decision unit tests for altitude gain limiter function.",
                finding_id=findings[4].finding_id, owner_id=users["tech_sarah"].user_id, reviewer_id=users["auditor_alex"].user_id,
                priority="MEDIUM", status="COMPLETED", completion_date=date(2026, 8, 12), due_date=date(2026, 8, 15), review_status="APPROVED"
            ),
            Action(
                action_id="act-06", code="ACT-006", description="Recalibrate optical bench thermal control unit and replace thermocouple sensors.",
                finding_id=findings[5].finding_id, owner_id=users["action_owner_david"].user_id, reviewer_id=users["auditor_alex"].user_id,
                priority="LOW", status="OPEN", due_date=date(2026, 10, 10), review_status="NOT_SUBMITTED"
            ),
            Action(
                action_id="act-07", code="ACT-007", description="Quarantine Batch 4 optics and issue non-conformance report to supplier.",
                finding_id=findings[6].finding_id, owner_id=users["action_owner_david"].user_id, reviewer_id=users["auditor_alex"].user_id,
                priority="HIGH", status="OPEN", due_date=date(2026, 10, 15), review_status="NOT_SUBMITTED"
            ),
            Action(
                action_id="act-08", code="ACT-008", description="Refactor perception pipeline to use static pool allocators during boot.",
                finding_id=findings[7].finding_id, owner_id=users["tech_sarah"].user_id, reviewer_id=users["auditor_alex"].user_id,
                priority="HIGH", status="IN_PROGRESS", due_date=date(2026, 9, 30), review_status="NOT_SUBMITTED"
            ),
            Action(
                action_id="act-09", code="ACT-009", description="Increase SecOC Freshness Counter and MAC truncation to 64-bit payload.",
                finding_id=findings[8].finding_id, owner_id=users["action_owner_david"].user_id, reviewer_id=users["auditor_alex"].user_id,
                priority="HIGH", status="OVERDUE", due_date=date(2026, 9, 5), review_status="NOT_SUBMITTED"
            ),
            Action(
                action_id="act-10", code="ACT-010", description="Upgrade FreeRTOS library to v10.4.3 across all sub-tier microcontrollers.",
                finding_id=findings[9].finding_id, owner_id=users["tech_sarah"].user_id, reviewer_id=users["auditor_alex"].user_id,
                priority="MEDIUM", status="COMPLETED", completion_date=date(2026, 7, 30), due_date=date(2026, 8, 1), review_status="APPROVED"
            )
        ]
        db.add_all(actions)
        db.commit()

        print("8. Seeding Evidence Items...")
        evidence = [
            Evidence(
                evidence_id="ev-01", action_id=actions[0].action_id, file_name="FTA_Steering_Actuator_v2.2.pdf",
                file_path="/uploads/FTA_Steering_Actuator_v2.2.pdf", file_type="application/pdf", file_size=450000,
                uploaded_by_id=users["action_owner_david"].user_id, review_status="PENDING", comments="Updated FTA incorporating dual-mcu watchdog models."
            ),
            Evidence(
                evidence_id="ev-02", action_id=actions[4].action_id, file_name="MCDC_Coverage_Report_DO178C.html",
                file_path="/uploads/MCDC_Coverage_Report_DO178C.html", file_type="text/html", file_size=1200000,
                uploaded_by_id=users["tech_sarah"].user_id, review_status="APPROVED", reviewer_id=users["auditor_alex"].user_id,
                comments="Verified 100% MC/DC branch coverage."
            ),
            Evidence(
                evidence_id="ev-03", action_id=actions[9].action_id, file_name="FreeRTOS_Patch_Verification_Log.txt",
                file_path="/uploads/FreeRTOS_Patch_Verification_Log.txt", file_type="text/plain", file_size=15000,
                uploaded_by_id=users["tech_sarah"].user_id, review_status="APPROVED", reviewer_id=users["auditor_alex"].user_id,
                comments="Build log showing v10.4.3 clean compilation."
            )
        ]
        db.add_all(evidence)
        db.commit()

        print("9. Seeding Risks, Issues, Dependencies & Milestones...")
        risks = [
            Risk(risk_id="risk-01", project_id=projects[0].project_id, title="LiDAR Supply Chain Single-Source Bottleneck", risk_level="HIGH", status="OPEN", mitigation_plan="Qualify secondary optics supplier in Q4."),
            Risk(risk_id="risk-02", project_id=projects[0].project_id, title="Thermal Overheating in Closed Engine Bay", risk_level="MEDIUM", status="OPEN", mitigation_plan="Active liquid cooling loop modification."),
            Risk(risk_id="risk-03", project_id=projects[1].project_id, title="FAA Certification Delay for Flight Control Software", risk_level="HIGH", status="OPEN", mitigation_plan="Engage DER consultant for preliminary audit."),
            Risk(risk_id="risk-04", project_id=projects[1].project_id, title="Battery Cell Degraded Discharge at High Altitude", risk_level="HIGH", status="OPEN", mitigation_plan="Add cell pre-heating resistors."),
            Risk(risk_id="risk-05", project_id=projects[2].project_id, title="Laser Diode Wavelength Drift with Age", risk_level="LOW", status="MITIGATED", mitigation_plan="Implement auto-tuning feedback loop.")
        ]
        db.add_all(risks)

        issues = [
            Issue(issue_id="iss-01", project_id=projects[0].project_id, title="CAN Bus Frame Overrun during High Perception Load", severity="HIGH", status="IN_PROGRESS", resolution_plan="Migrate perception output to Ethernet SOME/IP."),
            Issue(issue_id="iss-02", project_id=projects[1].project_id, title="Attitude Indicator Gyro Drift under Vibration", severity="HIGH", status="OPEN", resolution_plan="Upgrade IMU to tactical-grade MEMS unit.")
        ]
        db.add_all(issues)

        deps = [
            Dependency(dependency_id="dep-01", source_project_id=projects[0].project_id, target_project_id=projects[2].project_id, description="Autonomous Vehicle platform depends on Solid-State LiDAR Array for pointcloud data.", dependency_type="TECHNICAL", status="ACTIVE"),
            Dependency(dependency_id="dep-02", source_project_id=projects[1].project_id, target_project_id=projects[3].project_id, description="eVTOL Navigation depends on High-Density Battery Management power telemetry.", dependency_type="TECHNICAL", status="ACTIVE")
        ]
        db.add_all(deps)

        milestones = [
            Milestone(milestone_id="ms-01", project_id=projects[0].project_id, title="Gate 3: Functional Safety Signoff", target_date=date(2026, 10, 15), status="IN_PROGRESS"),
            Milestone(milestone_id="ms-02", project_id=projects[0].project_id, title="Urban Track Public Fleet Pilot", target_date=date(2026, 12, 1), status="PLANNED"),
            Milestone(milestone_id="ms-03", project_id=projects[1].project_id, title="DO-178C Level A Tool Qualification", target_date=date(2026, 9, 30), status="IN_PROGRESS"),
            Milestone(milestone_id="ms-04", project_id=projects[2].project_id, title="1550nm Laser Diode Freeze", target_date=date(2026, 8, 30), status="COMPLETED")
        ]
        db.add_all(milestones)
        db.commit()

        print("10. Seeding Governance Reviews, PM Updates, Assessments, Decisions & Governance Actions...")
        # Previous Review (June 2026)
        rev_june = GovernanceReview(
            review_id="rev-001", project_id=projects[0].project_id, review_number="REV-AUTO-2026-06",
            review_date=date(2026, 6, 20), review_status="COMPLETED", overall_health_status="GREEN",
            previous_review_id=None, technology_center_manager_id=users["tc_mgr_marcus"].user_id
        )
        db.add(rev_june)
        db.commit()

        pm_upd_june = PMUpdate(
            update_id="pm-upd-001", review_id=rev_june.review_id, submitted_by_id=users["pm_jordan"].user_id,
            what_changed="Completed initial LiDAR integration test track trials.", support_required="Budget approval for additional test vehicle.",
            pending_decisions="Choice of secondary sensor vendor.", executive_actions="Board signoff for test site permit."
        )
        ass_june = GovernanceAssessment(
            assessment_id="ass-001", review_id=rev_june.review_id, assessed_by_id=users["tc_mgr_marcus"].user_id,
            delivery_health="GREEN", engineering_health="GREEN", delivery_score=5, engineering_score=4, overall_score=5,
            comments="On track for Q3 safety milestone."
        )
        db.add_all([pm_upd_june, ass_june])
        db.commit()

        # Current Review (July / August 2026) linking to June Review
        rev_july = GovernanceReview(
            review_id="rev-002", project_id=projects[0].project_id, review_number="REV-AUTO-2026-08",
            review_date=date(2026, 8, 25), review_status="IN_REVIEW", overall_health_status="AMBER",
            previous_review_id=rev_june.review_id, technology_center_manager_id=users["tc_mgr_marcus"].user_id
        )
        db.add(rev_july)
        db.commit()

        pm_upd_july = PMUpdate(
            update_id="pm-upd-002", review_id=rev_july.review_id, submitted_by_id=users["pm_jordan"].user_id,
            what_changed="ISO 26262 audit identified critical FTA gap in steering actuator. CAN bus bandwidth bottleneck detected.",
            support_required="Robotics Center architect allocation to redesign CAN-FD protocol.",
            pending_decisions="Approval to defer non-safety features to Phase 4.", executive_actions="Executive waiver for 2-week schedule shift."
        )
        ass_july = GovernanceAssessment(
            assessment_id="ass-002", review_id=rev_july.review_id, assessed_by_id=users["tc_mgr_marcus"].user_id,
            delivery_health="AMBER", engineering_health="AMBER", delivery_score=3, engineering_score=3, overall_score=3,
            comments="Engineering health degraded due to critical audit findings and CAN bus frame drops."
        )
        decisions = [
            GovernanceDecision(
                decision_id="dec-001", review_id=rev_july.review_id, title="Approve CAN-FD Bus Protocol Migration",
                description="Authorize shift from legacy CAN 2.0B to CAN-FD with Ethernet SOME/IP gateway.",
                owner_id=users["tc_mgr_marcus"].user_id, status="APPROVED", due_date=date(2026, 9, 15), decision_date=date(2026, 8, 26),
                final_decision="Approved by Technology Center Leadership with 500k allocation."
            ),
            GovernanceDecision(
                decision_id="dec-002", review_id=rev_july.review_id, title="Defer Phase 3 Teleoperation Gateway Feature",
                description="Move remote teleoperation module to Phase 4 release to preserve safety timeline.",
                owner_id=users["pm_jordan"].user_id, status="PENDING", due_date=date(2026, 9, 30)
            )
        ]
        gov_actions = [
            Action(
                action_id="act-11", code="GOV-ACT-001", description="Conduct joint Architecture Review for CAN-FD transition.",
                governance_review_id=rev_july.review_id, owner_id=users["tech_sarah"].user_id, reviewer_id=users["tc_mgr_marcus"].user_id,
                priority="HIGH", status="IN_PROGRESS", due_date=date(2026, 9, 20), review_status="NOT_SUBMITTED"
            ),
            Action(
                action_id="act-12", code="GOV-ACT-002", description="Update Risk Register with LiDAR single-source supply chain risk.",
                governance_review_id=rev_july.review_id, owner_id=users["pm_jordan"].user_id, reviewer_id=users["tc_mgr_marcus"].user_id,
                priority="MEDIUM", status="OPEN", due_date=date(2026, 9, 25), review_status="NOT_SUBMITTED"
            )
        ]
        db.add_all([pm_upd_july, ass_july] + decisions + gov_actions)
        db.commit()

        print("11. Seeding Audit Logs...")
        logs = [
            AuditLog(user_id=users["admin"].user_id, action_type="SYSTEM_INIT", entity_type="System", entity_id="SYS-001", details_json='{"event": "Initial seed complete"}'),
            AuditLog(user_id=users["pm_jordan"].user_id, action_type="PM_UPDATE", entity_type="GovernanceReview", entity_id=rev_july.review_id, details_json='{"status": "Submitted PM Update"}'),
            AuditLog(user_id=users["tc_mgr_marcus"].user_id, action_type="ASSESSMENT", entity_type="GovernanceReview", entity_id=rev_july.review_id, details_json='{"score": 3, "health": "AMBER"}')
        ]
        db.add_all(logs)
        db.commit()

        print("DB SEEDING COMPLETED SUCCESSFULLY!")

    except Exception as e:
        db.rollback()
        print("SEEDING ERROR:", e)
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()

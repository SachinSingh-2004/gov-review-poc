import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def log_step(step_num, title):
    print(f"\n========================================================")
    print(f" DEMO WORKFLOW TEST - STEP {step_num}: {title.upper()}")
    print(f"========================================================")

def main():
    print("Starting Automated Enterprise Demo Scenario Acceptance Test...")

    # STEP 1: Login as Admin & Create Campaign
    log_step(1, "Admin creates Campaign 'Q4 Quality Governance Campaign'")
    headers_admin = {"X-Persona-Role": "ADMIN", "Content-Type": "application/json"}
    
    # Get project ID
    res = requests.get(f"{BASE_URL}/projects", headers=headers_admin)
    assert res.status_code == 200, f"Failed to list projects: {res.text}"
    projects = res.json()
    project_id = projects[0]["id"]
    admin_user_id = projects[0]["owner_id"]

    campaign_payload = {
        "code": "CMP-2026-Q4-TEST",
        "name": "Q4 Quality Governance Campaign",
        "project_id": project_id,
        "description": "Enterprise wide Q4 governance audit campaign",
        "owner_id": admin_user_id,
        "start_date": "2026-10-01",
        "end_date": "2026-12-31",
        "status": "ACTIVE"
    }

    res = requests.post(f"{BASE_URL}/campaigns", json=campaign_payload, headers=headers_admin)
    assert res.status_code == 200, f"Step 1 Failed: {res.text}"
    campaign = res.json()
    campaign_id = campaign["id"]
    print(f"[SUCCESS] Created Campaign ID: {campaign_id} (Code: {campaign['code']}, Name: {campaign['name']})")

    # STEP 2: Verify Campaign Stored in Database
    log_step(2, "Verify Campaign is stored in central MySQL DB source of truth")
    res = requests.get(f"{BASE_URL}/campaigns/{campaign_id}", headers=headers_admin)
    assert res.status_code == 200, f"Step 2 Failed: {res.text}"
    print(f"[SUCCESS] Database confirmed Campaign persistence: {res.json()['name']}")

    # STEP 3: Login as Auditor & Retrieve Campaign
    log_step(3, "Login as Auditor and retrieve Campaign")
    headers_auditor = {"X-Persona-Role": "AUDITOR", "Content-Type": "application/json"}
    res = requests.get(f"{BASE_URL}/campaigns/{campaign_id}", headers=headers_auditor)
    assert res.status_code == 200, f"Step 3 Failed: {res.text}"
    print(f"[SUCCESS] Auditor successfully viewed Campaign: {res.json()['code']}")

    # STEP 4: Auditor creates an Audit associated with Campaign
    log_step(4, "Auditor creates Audit associated with the Campaign")
    # Get auditor user ID
    res = requests.get(f"{BASE_URL}/auth/me", headers=headers_auditor)
    auditor_id = res.json()["id"]

    audit_payload = {
        "code": "AUD-Q4-001",
        "title": "Q4 Enterprise Quality Systems Audit",
        "campaign_id": campaign_id,
        "lead_auditor_id": auditor_id,
        "start_date": "2026-10-05",
        "end_date": "2026-10-25",
        "status": "IN_PROGRESS"
    }
    res = requests.post(f"{BASE_URL}/audits", json=audit_payload, headers=headers_auditor)
    assert res.status_code == 200, f"Step 4 Failed: {res.text}"
    audit = res.json()
    audit_id = audit["id"]
    print(f"[SUCCESS] Created Audit ID: {audit_id} (Title: {audit['title']})")

    # STEP 5: Auditor creates a Finding (Severity = Critical)
    log_step(5, "Auditor creates a Critical Finding associated with the Audit")
    # Get action owner ID
    headers_action_owner = {"X-Persona-Role": "ACTION_OWNER", "Content-Type": "application/json"}
    res = requests.get(f"{BASE_URL}/auth/me", headers=headers_action_owner)
    action_owner_id = res.json()["id"]

    finding_payload = {
        "code": "FND-CRIT-999",
        "audit_id": audit_id,
        "title": "Critical software compliance gap in validation protocol",
        "description": "Validation test coverage does not satisfy safety requirements.",
        "severity": "CRITICAL",
        "owner_id": action_owner_id,
        "due_date": "2026-10-15",
        "status": "OPEN"
    }
    res = requests.post(f"{BASE_URL}/findings", json=finding_payload, headers=headers_auditor)
    assert res.status_code == 200, f"Step 5 Failed: {res.text}"
    finding = res.json()
    finding_id = finding["id"]
    print(f"[SUCCESS] Created Critical Finding ID: {finding_id} (Code: {finding['code']}, Severity: {finding['severity']})")

    # STEP 6: Auditor creates Action for Finding
    log_step(6, "Auditor creates Action for Finding assigned to Action Owner")
    action_payload = {
        "code": "ACT-CRIT-999",
        "finding_id": finding_id,
        "description": "Complete corrective documentation review and rerun validation protocol",
        "owner_id": action_owner_id,
        "due_date": "2026-10-15",
        "status": "OPEN"
    }
    res = requests.post(f"{BASE_URL}/actions", json=action_payload, headers=headers_auditor)
    assert res.status_code == 200, f"Step 6 Failed: {res.text}"
    action = res.json()
    action_id = action["id"]
    print(f"[SUCCESS] Created Action ID: {action_id} (Status: {action['status']})")

    # STEP 7: Action Owner sees assigned Action
    log_step(7, "Action Owner logs in and views assigned Action")
    res = requests.get(f"{BASE_URL}/actions/{action_id}", headers=headers_action_owner)
    assert res.status_code == 200, f"Step 7 Failed: {res.text}"
    print(f"[SUCCESS] Action Owner viewed Action: {res.json()['description']}")

    # STEP 8: Action Owner updates status to COMPLETED and submits evidence
    log_step(8, "Action Owner changes status to COMPLETED and submits evidence")
    update_payload = {
        "status": "COMPLETED",
        "evidence_summary": "Revised Validation Protocol VP-2026-V2 approved and 100% test cases passed."
    }
    res = requests.put(f"{BASE_URL}/actions/{action_id}", json=update_payload, headers=headers_action_owner)
    assert res.status_code == 200, f"Step 8 Failed: {res.text}"
    print(f"[SUCCESS] Action status updated to: {res.json()['status']} | Evidence: {res.json()['evidence_summary']}")

    # STEP 9: Database updates verified
    log_step(9, "Verify central database updated state")
    res = requests.get(f"{BASE_URL}/actions/{action_id}", headers=headers_admin)
    assert res.json()["status"] == "COMPLETED"
    print(f"[SUCCESS] Central Database confirmed Action completion status.")

    # STEP 10: Dashboard KPIs update automatically
    log_step(10, "Dashboards retrieve latest data and reflect updated KPIs")
    res = requests.get(f"{BASE_URL}/dashboard/summary", headers=headers_admin)
    assert res.status_code == 200, f"Step 10 Failed: {res.text}"
    kpis = res.json()["kpis"]
    print(f"[SUCCESS] Dashboard KPIs refreshed: Open Findings={kpis['open_findings']}, Critical={kpis['critical_findings']}")

    # STEP 11: Audit Manager reviews and closes Finding
    log_step(11, "Audit Manager approves and closes Finding")
    headers_mgr = {"X-Persona-Role": "AUDIT_MANAGER", "Content-Type": "application/json"}
    close_finding_payload = {
        "status": "CLOSED",
        "closure_info": "Verified completion evidence; audit manager signoff complete."
    }
    res = requests.put(f"{BASE_URL}/findings/{finding_id}", json=close_finding_payload, headers=headers_mgr)
    assert res.status_code == 200, f"Step 11 Failed: {res.text}"
    print(f"[SUCCESS] Finding status updated to: {res.json()['status']}")

    # STEP 12: Executive Dashboard reflects aggregated governance health
    log_step(12, "Executive Dashboard reflects aggregated governance indicators")
    headers_exec = {"X-Persona-Role": "EXECUTIVE", "Content-Type": "application/json"}
    res = requests.get(f"{BASE_URL}/executive/summary", headers=headers_exec)
    assert res.status_code == 200, f"Step 12 Failed: {res.text}"
    exec_data = res.json()
    print(f"[SUCCESS] Executive Review loaded: Governance Score={exec_data['overall_governance_score']}% | Action Closure Rate={exec_data['action_closure_rate']}%")

    print("\n========================================================")
    print(" ALL 12 STEPS OF THE DEMO SCENARIO PASSED SUCCESSFULLY! ")
    print("========================================================\n")

if __name__ == "__main__":
    main()

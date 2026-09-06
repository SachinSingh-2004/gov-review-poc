import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from openpyxl import Workbook
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.core.database import get_db
from app.core.auth import require_permission
from app.models.audit import Audit
from app.models.finding import Finding
from app.models.action import Action
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/export")
def export_report(
    report_type: str = Query("findings", description="findings, audits, actions"),
    format: str = Query("csv", description="csv, excel, pdf"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("report.export"))
):
    if report_type == "findings":
        items = db.query(Finding).all()
        headers = ["Code", "Title", "Severity", "Status", "Owner", "Due Date"]
        data = [[i.code, i.title, i.severity, i.status, i.owner.full_name if i.owner else "", str(i.due_date)] for i in items]
        filename = f"Findings_Report.{format}"
    elif report_type == "audits":
        items = db.query(Audit).all()
        headers = ["Code", "Title", "Campaign", "Status", "Lead Auditor", "Closure %"]
        data = [[i.code, i.title, i.campaign.name if i.campaign else "", i.status, i.lead_auditor.full_name if i.lead_auditor else "", f"{i.closure_percentage}%"] for i in items]
        filename = f"Audits_Report.{format}"
    else:
        items = db.query(Action).all()
        headers = ["Code", "Description", "Status", "Owner", "Due Date", "Evidence"]
        data = [[i.code, i.description, i.status, i.owner.full_name if i.owner else "", str(i.due_date), i.evidence_summary or ""] for i in items]
        filename = f"Actions_Report.{format}"

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(headers)
        writer.writerows(data)
        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    elif format == "excel":
        wb = Workbook()
        ws = wb.active
        ws.title = report_type.capitalize()
        ws.append(headers)
        for row in data:
            ws.append(row)
        file_stream = io.BytesIO()
        wb.save(file_stream)
        file_stream.seek(0)
        return StreamingResponse(
            file_stream,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    elif format == "pdf":
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, 750, f"R&D Governance Portal - {report_type.capitalize()} Report")
        p.setFont("Helvetica", 10)
        
        y = 710
        p.drawString(50, y, " | ".join(headers))
        y -= 20
        p.line(50, y+15, 550, y+15)

        for row in data:
            if y < 50:
                p.showPage()
                y = 750
            p.drawString(50, y, " | ".join([str(val)[:20] for val in row]))
            y -= 18

        p.showPage()
        p.save()
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    raise HTTPException(status_code=400, detail="Invalid format specified")

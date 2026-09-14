import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user, require_permission
from app.models.attachment import Attachment
from app.models.governance import AuditLog
from app.models.user import User
from app.schemas.attachment import AttachmentSchema, AttachmentUploadResponse

router = APIRouter(prefix="/attachments", tags=["Attachments & Evidence"])

# Storage directory setup
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "evidence")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".pdf", ".png", ".jpg", ".jpeg", ".xlsx", ".xls", ".docx", ".doc", ".csv", ".txt", ".zip"
}
BLOCKED_EXTENSIONS = {".exe", ".bat", ".sh", ".py", ".js", ".html", ".cmd", ".msi", ".vbs"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def enrich_attachment(att: Attachment) -> dict:
    return {
        "id": att.id,
        "entity_type": att.entity_type,
        "entity_id": att.entity_id,
        "file_name": att.file_name,
        "file_size": att.file_size,
        "mime_type": att.mime_type,
        "uploaded_by_id": att.uploaded_by_id,
        "uploaded_by_name": att.uploaded_by.full_name if att.uploaded_by else "System User",
        "uploaded_at": att.uploaded_at,
    }

@router.post("/upload", response_model=AttachmentUploadResponse)
async def upload_attachment(
    entity_type: str = Form(...),
    entity_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("action.update")),
):
    """
    Uploads evidence file for an Action or Finding.
    Validates file size (max 10MB) and file extension.
    """
    entity_type_upper = entity_type.upper()
    if entity_type_upper not in ["ACTION", "FINDING"]:
        raise HTTPException(status_code=400, detail="entity_type must be 'ACTION' or 'FINDING'")

    # Validate file extension
    original_filename = os.path.basename(file.filename or "uploaded_file")
    _, ext = os.path.splitext(original_filename)
    ext = ext.lower()

    if ext in BLOCKED_EXTENSIONS or (ext and ext not in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{ext}' is not permitted. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    # Read content & check file size
    contents = await file.read()
    file_size = len(contents)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size ({file_size / (1024*1024):.2f} MB) exceeds maximum allowed limit of 10 MB.",
        )

    # Store file on disk securely
    stored_file_name = f"{uuid.uuid4()}{ext or '.bin'}"
    file_path = os.path.join(UPLOAD_DIR, stored_file_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Save metadata record
    att = Attachment(
        entity_type=entity_type_upper,
        entity_id=entity_id,
        file_name=original_filename,
        stored_file_name=stored_file_name,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        uploaded_by_id=current_user.id,
    )
    db.add(att)
    db.commit()
    db.refresh(att)

    # Log action
    db.add(
        AuditLog(
            user_id=current_user.id,
            action_type="CREATE",
            entity_type="Attachment",
            entity_id=att.id,
            details_json=f'{{"file_name": "{att.file_name}", "entity_type": "{att.entity_type}", "entity_id": "{att.entity_id}"}}',
        )
    )
    db.commit()

    return AttachmentUploadResponse(
        success=True,
        attachment=enrich_attachment(att),
        message=f"File '{original_filename}' uploaded successfully.",
    )

@router.get("/entity/{entity_type}/{entity_id}", response_model=List[AttachmentSchema])
def list_entity_attachments(
    entity_type: str,
    entity_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns list of attached evidence files for a specific Action or Finding.
    """
    attachments = (
        db.query(Attachment)
        .filter(Attachment.entity_type == entity_type.upper(), Attachment.entity_id == entity_id)
        .all()
    )
    return [enrich_attachment(a) for a in attachments]

@router.get("/{attachment_id}/download")
def download_attachment(
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Downloads an evidence attachment file.
    """
    att = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not att or not os.path.exists(att.file_path):
        raise HTTPException(status_code=404, detail="Attachment file not found")

    return FileResponse(
        path=att.file_path,
        filename=att.file_name,
        media_type=att.mime_type,
    )

@router.delete("/{attachment_id}")
def delete_attachment(
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("action.update")),
):
    """
    Deletes an attachment file and metadata record.
    """
    att = db.query(Attachment).filter(Attachment.id == attachment_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attachment not found")

    # Delete disk file
    if os.path.exists(att.file_path):
        try:
            os.remove(att.file_path)
        except OSError:
            pass

    file_name = att.file_name
    db.delete(att)
    db.commit()

    db.add(
        AuditLog(
            user_id=current_user.id,
            action_type="DELETE",
            entity_type="Attachment",
            entity_id=attachment_id,
            details_json=f'{{"file_name": "{file_name}"}}',
        )
    )
    db.commit()

    return {"success": True, "message": f"Attachment '{file_name}' deleted successfully."}

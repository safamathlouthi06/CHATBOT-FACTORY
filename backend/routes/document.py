"""
Upload PDF / PPT
"""

from fastapi import APIRouter, UploadFile, File, Form
import os
from services.document_service import create_document

router = APIRouter(prefix="/documents", tags=["Documents"])


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def upload_document(
    chatbot_id: str = Form(...),
    titre: str = Form(...),
    file: UploadFile = File(...)
):

    file_path = f"{UPLOAD_DIR}/{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    create_document(chatbot_id, titre, file_path)

    return {"message": "Document ajouté et indexé"}
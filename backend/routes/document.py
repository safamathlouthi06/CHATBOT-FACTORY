"""
Upload PDF / PPT
"""

from fastapi import APIRouter, UploadFile, File, Form
import os
from services.document_service import create_document , delete_document
from fastapi import HTTPException

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




@router.delete("/{document_id}")
def remove_document(document_id: str):

    try:
        delete_document(document_id)

        return {
            "message": "Document supprimé et retiré du RAG ✅"
        }

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
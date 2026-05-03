"""
routes/faq.py

Endpoints liés aux FAQ.
"""

from fastapi import APIRouter, Depends, HTTPException
from schemas.faq import FAQCreate
from services.faq_service import create_faq
from auth import get_current_user

router = APIRouter(prefix="/faq", tags=["FAQ"])


@router.post("/")
def add_faq(
    data: FAQCreate,
    user=Depends(get_current_user)
):
    """
    Ajoute une FAQ et l'indexe automatiquement dans le RAG.
    """
    try:
        create_faq(
            chatbot_id=str(data.chatbot_id),
            question=data.question.strip(),
            reponse=data.reponse.strip()
        )
        return {"message": "FAQ ajoutée et indexée dans le RAG ✅"}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        print("❌ ERREUR FAQ :", e)
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de l'ajout de la FAQ"
        )
"""
routes/faq.py

Endpoints liés aux FAQ.
"""

from fastapi import APIRouter
from schemas.faq import FAQCreate
from services.faq_service import create_faq

router = APIRouter(prefix="/faq", tags=["FAQ"])


@router.post("/")
def add_faq(data: FAQCreate):
    """
    Endpoint d'ajout d'une FAQ.
    """
    create_faq(
        chatbot_id=str(data.chatbot_id),
        question=data.question,
        reponse=data.reponse
    )

    return {"message": "FAQ ajoutée et indexée dans le RAG"}
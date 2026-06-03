"""
routes/faq.py

Endpoints liés aux FAQ.
"""

from fastapi import APIRouter, Depends, HTTPException

from schemas.faq import FAQCreate, FAQUpdate
from services.faq_service import (
    create_faq,
    update_faq,
    delete_faq
)
from auth import get_current_user

router = APIRouter(prefix="/faq", tags=["FAQ"])


# =========================
# CREATE FAQ
# =========================
@router.post("/")
def add_faq(
    data: FAQCreate,
    user=Depends(get_current_user)
):
    try:
        faq_id = create_faq(
            chatbot_id=str(data.chatbot_id),
            question=data.question.strip(),
            reponse=data.reponse.strip()
        )

        return {
            "message": "FAQ ajoutée et indexée dans le RAG ✅",
            "faq_id": faq_id
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        print("❌ ERREUR FAQ :", e)

        raise HTTPException(
            status_code=500,
            detail="Erreur lors de l'ajout de la FAQ"
        )


# =========================
# UPDATE FAQ
# =========================
@router.put("/{faq_id}")
def edit_faq(
    faq_id: str,
    data: FAQUpdate,
    user=Depends(get_current_user)
):
    try:
        update_faq(
            faq_id=faq_id,
            question=data.question,
            reponse=data.reponse
        )

        return {
            "message": "FAQ modifiée et réindexée ✅"
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        print("❌ ERREUR UPDATE FAQ :", e)

        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la modification"
        )


# =========================
# DELETE FAQ
# =========================
@router.delete("/{faq_id}")
def remove_faq(
    faq_id: str,
    user=Depends(get_current_user)
):
    try:
        delete_faq(faq_id)

        return {
            "message": "FAQ supprimée et retirée du RAG ✅"
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        print("❌ ERREUR DELETE FAQ :", e)

        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la suppression"
        )
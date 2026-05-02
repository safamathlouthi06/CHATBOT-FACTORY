from fastapi import APIRouter, HTTPException, Depends
from database import supabase
from schemas.chatbot import ChatbotCreate, ChatbotUpdate
import traceback
from auth import get_current_user

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

TABLE = "chatbots"  # ✅ FIX ICI


# =========================
# CREATE CHATBOT
# =========================
@router.post("/")
def create_chatbot(data: ChatbotCreate, current_user=Depends(get_current_user)):
    try:
        entreprise_id = current_user["entreprise_id"]

        response = supabase.table(TABLE).insert({
            "nom": data.nom,
            "domaine": data.domaine,
            "statut": data.statut,
            "entreprise_id": entreprise_id
        }).execute()

        return {"message": "Chatbot créé", "data": response.data}

    except Exception:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Erreur création chatbot")


# =========================
# GET MY CHATBOTS (SECURE)
# =========================
@router.get("/")
def get_my_chatbots(current_user=Depends(get_current_user)):

    entreprise_id = current_user["entreprise_id"]

    response = supabase.table(TABLE) \
        .select("*") \
        .eq("entreprise_id", entreprise_id) \
        .execute()

    return response.data or []


# =========================
# GET BY ID (SECURE)
# =========================
@router.get("/{chatbot_id}")
def get_chatbot(chatbot_id: str, current_user=Depends(get_current_user)):

    entreprise_id = current_user["entreprise_id"]

    response = supabase.table(TABLE) \
        .select("*") \
        .eq("id", chatbot_id) \
        .eq("entreprise_id", entreprise_id) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Chatbot introuvable")

    return response.data[0]


# =========================
# UPDATE
# =========================
@router.put("/{chatbot_id}")
def update_chatbot(chatbot_id: str, data: ChatbotUpdate, current_user=Depends(get_current_user)):

    entreprise_id = current_user["entreprise_id"]

    update_data = {
        k: v for k, v in data.model_dump().items()
        if v is not None
    }

    response = supabase.table(TABLE) \
        .update(update_data) \
        .eq("id", chatbot_id) \
        .eq("entreprise_id", entreprise_id) \
        .execute()

    return {"message": "Chatbot mis à jour", "data": response.data}


# =========================
# DELETE
# =========================
@router.delete("/{chatbot_id}")
def delete_chatbot(chatbot_id: str, current_user=Depends(get_current_user)):

    entreprise_id = current_user["entreprise_id"]

    response = supabase.table(TABLE) \
        .delete() \
        .eq("id", chatbot_id) \
        .eq("entreprise_id", entreprise_id) \
        .execute()

    return {"message": "Chatbot supprimé"}



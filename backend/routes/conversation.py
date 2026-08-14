
from fastapi import APIRouter
from database import supabase
from schemas.chatbot import DEFAULT_WELCOME_MESSAGE
from postgrest.exceptions import APIError
router = APIRouter(prefix="/conversations")

def _get_welcome_message(chatbot_id: str) -> str:
    try:
        res = (
            supabase.table("chatbots")
            .select("message_accueil")
            .eq("id", chatbot_id)
            .execute()
        )
        if res.data and res.data[0].get("message_accueil"):
            return res.data[0]["message_accueil"]
    except APIError:
        pass
    return DEFAULT_WELCOME_MESSAGE

@router.get("/{chatbot_id}")
def get_conversation(chatbot_id: str):
    res = (
        supabase.table("conversations")
        .select("*")
        .eq("chatbot_id", chatbot_id)
        .order("created_at", desc=False)
        .execute()
    )
    return {
        "welcome_message": _get_welcome_message(chatbot_id),
        "messages": res.data or [],
    }

@router.delete("/{chatbot_id}")
def delete_conversation(chatbot_id: str):
    supabase.table("conversations").delete().eq("chatbot_id", chatbot_id).execute()
    return {"message": "deleted"}

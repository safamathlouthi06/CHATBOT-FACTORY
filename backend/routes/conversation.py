from fastapi import APIRouter
from core.config import supabase

router = APIRouter(prefix="/conversations")


@router.get("/{chatbot_id}")
def get_conversation(chatbot_id: str):
    res = supabase.table("conversations") \
        .select("*") \
        .eq("chatbot_id", chatbot_id) \
        .order("created_at", desc=False) \
        .execute()

    return res.data


@router.delete("/{chatbot_id}")
def delete_conversation(chatbot_id: str):
    supabase.table("conversations") \
        .delete() \
        .eq("chatbot_id", chatbot_id) \
        .execute()

    return {"message": "deleted"}
from fastapi import APIRouter
from core.config import supabase

router = APIRouter(prefix="/base")


@router.get("/{chatbot_id}")
def get_base(chatbot_id: str):

    # ✅ récupérer documents du chatbot
    documents = supabase.table("documents") \
        .select("*") \
        .eq("chatbot_id", chatbot_id) \
        .execute()

    # ✅ récupérer FAQ du chatbot
    faq = supabase.table("faq") \
        .select("*") \
        .eq("chatbot_id", chatbot_id) \
        .execute()

    return {
        "documents": documents.data,
        "faq": faq.data
    }
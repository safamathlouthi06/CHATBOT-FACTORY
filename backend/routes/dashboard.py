from fastapi import APIRouter, Depends, HTTPException
from supabase import create_client, Client
import os

from auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


@router.get("/")
def dashboard(user=Depends(get_current_user)):
    try:
        # 🔥 récupérer company_id depuis user
        entreprise_id = user["entreprise_id"]

        response = supabase \
            .table("chatbots") \
            .select("*") \
            .eq("entreprise_id", entreprise_id) \
            .execute()

        chatbots = response.data if response.data else []

        return {
            "chatbots": chatbots,
            "stats": {
                "chatbots": len(chatbots),
                "conversations": 120,
                "messages": 500,
                "users": 50
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
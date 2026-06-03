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
        role = user.get("role")

        # =========================
        # SUPER ADMIN → tout
        # =========================
        if role == "super_admin":
            response = supabase.table("chatbots").select("*").execute()
            chatbots = response.data or []

        # =========================
        # ENTREPRISE → ses chatbots
        # =========================
        elif role == "entreprise":
            entreprise_id = user.get("entreprise_id")

            if not entreprise_id:
                raise HTTPException(status_code=403, detail="Entreprise manquante")

            response = (
                supabase.table("chatbots")
                .select("*")
                .eq("entreprise_id", entreprise_id)
                .execute()
            )

            chatbots = response.data or []

        # =========================
        # EMPLOYÉ → ses chatbots
        # =========================
        elif role == "employe":
            employe_id = user.get("employe_id")

            if not employe_id:
                raise HTTPException(status_code=403, detail="Employé manquant")

            response = (
                supabase.table("chatbots")
                .select("*")
                .eq("employe_id", employe_id)
                .execute()
            )

            chatbots = response.data or []

        else:
            raise HTTPException(status_code=403, detail="Rôle non autorisé")

        # =========================
        # STATS RÉELLES
        # =========================
        return {
            "chatbots": chatbots,
            "stats": {
                "chatbots": len(chatbots),
                "actifs": len([c for c in chatbots if c.get("statut") == "actif"]),
                "brouillons": len([c for c in chatbots if c.get("statut") == "brouillon"]),
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
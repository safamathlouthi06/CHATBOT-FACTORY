from fastapi import APIRouter, HTTPException, Depends
from database import supabase
from schemas.chatbot import ChatbotCreate, ChatbotUpdate
import traceback
from auth import get_current_user

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

TABLE = "chatbots"


# =========================
# ROLE FILTER CLEAN
# =========================
def get_chatbot_filter(user: dict):

    role = user.get("role")

    # 🧠 SUPER ADMIN → accès total
    if role == "super_admin":
        return None  # pas de filtre

    # 🏢 ADMIN ENTREPRISE → toute l'entreprise
    if role == "entreprise":
        if not user.get("entreprise_id"):
            raise HTTPException(status_code=403, detail="Entreprise manquante")

        return {
            "field": "entreprise_id",
            "value": user["entreprise_id"]
        }

    # 👨‍💻 EMPLOYE → ses chatbots uniquement
    if role == "employe":
        if not user.get("employe_id"):
            raise HTTPException(status_code=403, detail="Employe manquant")

        return {
            "field": "employe_id",
            "value": user["employe_id"]
        }

    raise HTTPException(status_code=403, detail="Rôle non autorisé")


# =========================
# CREATE CHATBOT
# =========================
@router.post("/")
def create_chatbot(
    data: ChatbotCreate,
    current_user=Depends(get_current_user)
):

    try:
        role = current_user.get("role")

        # ✅ SEUL EMPLOYÉ AUTORISÉ
        if role != "employe":
            raise HTTPException(
                status_code=403,
                detail="Seuls les employés peuvent créer des chatbots"
            )

        entreprise_id = current_user.get("entreprise_id")
        employe_id = current_user.get("employe_id")

        if not entreprise_id or not employe_id:
            raise HTTPException(
                status_code=403,
                detail="Token employé invalide"
            )

        # =========================
        # CHECK DUPLICATE (par employé)
        # =========================
        existing = supabase.table(TABLE) \
            .select("id") \
            .eq("entreprise_id", entreprise_id) \
            .eq("employe_id", employe_id) \
            .eq("nom", data.nom) \
            .execute()

        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="Nom déjà utilisé"
            )

        # =========================
        # INSERT
        # =========================
        response = supabase.table(TABLE).insert({
            "nom": data.nom,
            "domaine": data.domaine,
            "statut": data.statut,
            "entreprise_id": entreprise_id,
            "employe_id": employe_id
        }).execute()

        return {
            "message": "Chatbot créé",
            "data": response.data[0]
        }

    except HTTPException:
        raise
    except Exception:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Erreur création chatbot")
# =========================
# GET CHATBOTS
# =========================
@router.get("/")
def get_chatbots(current_user=Depends(get_current_user)):

    role = current_user.get("role")

    # =========================
    # SUPER ADMIN → tout voir
    # =========================
    if role == "super_admin":
        res = supabase.table(TABLE).select("*").execute()
        return res.data or []

    # =========================
    # ENTREPRISE → tous ses employés
    # =========================
    if role == "entreprise":
        entreprise_id = current_user.get("entreprise_id")

        if not entreprise_id:
            raise HTTPException(status_code=403, detail="Entreprise manquante")

        res = (
            supabase.table(TABLE)
            .select("*, employe(nom, prenom)")
            .eq("entreprise_id", entreprise_id)
            .execute()
        )

        return res.data or []

    # =========================
    # EMPLOYE → UNIQUEMENT SES CHATBOTS
    # =========================
    if role == "employe":
        employe_id = current_user.get("employe_id")

        if not employe_id:
            raise HTTPException(status_code=403, detail="Employe manquant")

        res = (
            supabase.table(TABLE)
            .select("*, employe(nom, prenom)")
            .eq("employe_id", employe_id)   # 🔐 IMPORTANT: isolation totale
            .execute()
        )

        return res.data or []

    raise HTTPException(status_code=403, detail="Rôle non autorisé")
# =========================
# GET BY ID
# =========================
@router.get("/{chatbot_id}")
def get_chatbot(chatbot_id: str, current_user=Depends(get_current_user)):

    role = current_user.get("role")

    query = supabase.table(TABLE).select("*").eq("id", chatbot_id)

    # super admin bypass
    if role != "super_admin":
        f = get_chatbot_filter(current_user)
        query = query.eq(f["field"], f["value"])

    res = query.execute()

    if not res.data:
        raise HTTPException(status_code=404, detail="Chatbot introuvable")

    return res.data[0]


# =========================
# UPDATE
# =========================
@router.put("/{chatbot_id}")
def update_chatbot(
    chatbot_id: str,
    data: ChatbotUpdate,
    current_user=Depends(get_current_user)
):

    role = current_user.get("role")

    update_data = {
        k: v for k, v in data.model_dump().items()
        if v is not None
    }

    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée")

    query = supabase.table(TABLE).update(update_data).eq("id", chatbot_id)

    if role != "super_admin":
        f = get_chatbot_filter(current_user)
        query = query.eq(f["field"], f["value"])

    res = query.execute()

    return {"message": "Chatbot mis à jour", "data": res.data}


# =========================
# DELETE
# =========================
@router.delete("/{chatbot_id}")
def delete_chatbot(chatbot_id: str, current_user=Depends(get_current_user)):

    role = current_user.get("role")

    query = supabase.table(TABLE).delete().eq("id", chatbot_id)

    if role != "super_admin":
        f = get_chatbot_filter(current_user)
        query = query.eq(f["field"], f["value"])

    query.execute()

    return {"message": "Chatbot supprimé"}




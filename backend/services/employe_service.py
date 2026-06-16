from core.config import supabase
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─────────────────────────────
# GET EMPLOYÉ
# ─────────────────────────────
def get_employe_by_id(employe_id: str):
    res = (
        supabase.table("employes")
        .select("*")
        .eq("id", employe_id)
        .single()
        .execute()
    )

    if not res.data:
        raise ValueError("Employé introuvable")

    return res.data


# ─────────────────────────────
# UPDATE EMPLOYÉ
# ─────────────────────────────
def update_employe(employe_id: str, data: dict):
    res = (
        supabase.table("employes")
        .update(data)
        .eq("id", employe_id)
        .execute()
    )

    if not res.data:
        raise ValueError("Erreur update employé")

    return res.data[0]


# ─────────────────────────────
# CHANGE PASSWORD
# ─────────────────────────────
def change_password(employe_id: str, current_password: str, new_password: str):

    # 1. récupérer user
    user_res = (
        supabase.table("employes")
        .select("password")
        .eq("id", employe_id)
        .single()
        .execute()
    )

    if not user_res.data:
        raise ValueError("Employé introuvable")

    hashed_password = user_res.data["password"]

    # 2. vérifier ancien password
    if not pwd_context.verify(current_password, hashed_password):
        raise ValueError("Mot de passe actuel incorrect")

    # 3. hash nouveau password
    new_hashed = pwd_context.hash(new_password)

    # 4. update
    res = (
        supabase.table("employes")
        .update({"password": new_hashed})
        .eq("id", employe_id)
        .execute()
    )

    return {"message": "Mot de passe mis à jour"}
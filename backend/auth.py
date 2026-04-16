from fastapi import APIRouter, HTTPException
from database import supabase
import jwt
import datetime
import bcrypt

from models.entreprise import EntrepriseCreate, LoginData

router = APIRouter()

SECRET_KEY = "secret"


# =========================
# REGISTER
# =========================

@router.post("/register")
def register(entreprise: EntrepriseCreate):

    try:
        hashed_password = bcrypt.hashpw(
            entreprise.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        response = supabase.table("entreprise").insert({
            "nomentreprise": entreprise.nomentreprise,
            "secteurd_activite": entreprise.secteurd_activite,
            "email": entreprise.email,
            "password": hashed_password,
            "statut": "pending"
        }).execute()

        if response.data:
            return {
                "message": "Entreprise créée avec succès",
                "data": response.data
            }

        raise HTTPException(status_code=400, detail="Erreur insertion Supabase")

    except Exception as e:
        print("🔥 ERROR REGISTER:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# LOGIN
# =========================

@router.post("/login")
def login(data: LoginData):

    response = supabase.table("entreprise") \
        .select("*") \
        .eq("email", data.email) \
        .execute()

    user = response.data

    if not user:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    user = user[0]

    if not bcrypt.checkpw(
        data.password.encode("utf-8"),
        user["password"].encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")

    token = jwt.encode({
        "email": data.email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, SECRET_KEY, algorithm="HS256")

    return {
        "access_token": token,
        "user": {
            "email": user["email"],
            "nomentreprise": user["nomentreprise"]
        }
    }
from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import supabase
import jwt
import datetime
import bcrypt
import os

from models.entreprise import Entreprise, LoginData

router = APIRouter()

# =========================
# CONFIG
# =========================
SECRET_KEY = os.getenv("SECRET_KEY")

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

security = HTTPBearer()


# =========================
# GET CURRENT USER (JWT)
#visible uniquement backend pour sécuriser routes et récupérer infos entreprise
# =========================
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials

        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        return {
            "email": decoded.get("email"),
            "role": decoded.get("role"),
            "entreprise_id": decoded.get("entreprise_id")
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Token invalide")


# =========================
# VERIFY ADMIN
# =========================
def verify_admin(token: str):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        if decoded.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Accès refusé")

    except Exception:
        raise HTTPException(status_code=401, detail="Token invalide")


# =========================
# REGISTER ENTREPRISE
# =========================
@router.post("/register")
def register(entreprise: Entreprise):

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
            "message": "Entreprise créée",
            "data": response.data
        }

    raise HTTPException(status_code=400, detail="Erreur register")

    return {
        "message": "Entreprise créée (en attente de validation)",
        "data": response.data[0]
    }


# =========================
# LOGIN (ADMIN + ENTREPRISE)
# =========================
@router.post("/login")
def login(data: LoginData):

    # 👑 ADMIN LOGIN
    if data.email == ADMIN_EMAIL and data.password == ADMIN_PASSWORD:

        token = jwt.encode({
            "role": "admin",
            "email": data.email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        return {
            "access_token": token,
            "role": "admin"
        }

    # 🏢 ENTREPRISE LOGIN
    response = supabase.table("entreprise") \
        .select("*") \
        .eq("email", data.email) \
        .execute()

    user = response.data

    if not user:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    user = user[0]

     # 🔒 BLOQUAGE PENDING / NON APPROUVÉ
    if user["statut"] != "approved":
        raise HTTPException(
            status_code=403,
            detail="Compte en attente de validation par l'administrateur"
        )

     # 🔑 PASSWORD CHECK
    if not bcrypt.checkpw(
        data.password.encode("utf-8"),
        user["password"].encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")

    # 🔐 TOKEN
    token = jwt.encode({
        "role": "entreprise",
        "email": user["email"],
        "entreprise_id": user["id"],  # 🔥 IMPORTANT
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, SECRET_KEY, algorithm="HS256")

    return {
        "access_token": token,
        "role": "entreprise",
        "user": {
            "email": user["email"],
            "nomentreprise": user["nomentreprise"]
        }
    }


# =========================
# ADMIN - GET ENTREPRISES
# =========================
@router.get("/admin/entreprises")
def get_entreprises(authorization: str = Header(None)):

    token = authorization.replace("Bearer ", "")
    verify_admin(token)

    response = supabase.table("entreprise").select("*").execute()

    return response.data


# =========================
# ADMIN - VALIDATE ENTREPRISE
# =========================
@router.put("/admin/validate/{id}")
def validate(id: str, authorization: str = Header(None)):

    token = authorization.replace("Bearer ", "")
    verify_admin(token)

    supabase.table("entreprise") \
        .update({"statut": "approved"}) \
        .eq("id", id) \
        .execute()

    return {"message": "Entreprise validée"}




# =========================
# GET CURRENT ENTREPRISE
#visible cote frontend pour afficher infos entreprise
# =========================
# =========================
# GET ME (ENTREPRISE CONNECTÉE)
# =========================
@router.get("/me")
def get_me(user=Depends(get_current_user)):

    response = supabase.table("entreprise") \
        .select("id, nomentreprise, email") \
        .eq("id", user["entreprise_id"]) \
        .single() \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    return {
        "id": response.data["id"],
        "nomentreprise": response.data["nomentreprise"],
        "email": response.data["email"],
        #"role": user["role"]
    }
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
            "entreprise_id": decoded.get("entreprise_id"),
            "employe_id": decoded.get("employe_id")
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

    # =========================
    # 👑 ADMIN LOGIN
    # =========================
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

    # =========================
    # 👨‍💻 EMPLOYÉ LOGIN (FIRST CHECK)
    # =========================
    emp = supabase.table("employe") \
        .select("*") \
        .eq("email", data.email) \
        .execute()

    if emp.data:
        emp_user = emp.data[0]

        if not bcrypt.checkpw(
            data.password.encode("utf-8"),
            emp_user["password"].encode("utf-8")
        ):
            raise HTTPException(status_code=401, detail="Mot de passe incorrect")

        if emp_user["statut"] != "actif":
            raise HTTPException(status_code=403, detail="Compte désactivé")

        token = jwt.encode({
            "role": "employe",
            "email": emp_user["email"],
            "entreprise_id": emp_user["entreprise_id"],
            "employe_id": emp_user["id"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        return {
            "access_token": token,
            "role": "employe",
            "user": {
                "email": emp_user["email"],
                "nom": emp_user["nom"],
                "prenom": emp_user["prenom"]
            }
        }

    # =========================
    # 🏢 ENTREPRISE LOGIN (SECOND CHECK)
    # =========================
    response = supabase.table("entreprise") \
        .select("*") \
        .eq("email", data.email) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    user = response.data[0]

    if user["statut"] != "approved":
        raise HTTPException(
            status_code=403,
            detail="Compte en attente de validation"
        )

    if not bcrypt.checkpw(
        data.password.encode("utf-8"),
        user["password"].encode("utf-8")
    ):
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")

    token = jwt.encode({
        "role": "entreprise",
        "email": user["email"],
        "entreprise_id": user["id"],
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
@router.get("/meEntreprise")
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



# =========================
# GET CURRENT EMPLOYE
#visible cote frontend pour afficher infos entreprise
# =========================
# =========================
# GET ME (EMPLOYE CONNECTÉE)
# =========================
@router.get("/meEmploye")
def get_me_employe(user=Depends(get_current_user)):

    if user["role"] != "employe":
        raise HTTPException(status_code=403, detail="Accès réservé aux employés")

    response = supabase.table("employe") \
        .select("id, nom, prenom, email, email_personnel, entreprise_id, statut") \
        .eq("id", user["employe_id"]) \
        .single() \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    return {
        "id": response.data["id"],
        "nom": response.data["nom"],
        "prenom": response.data["prenom"],
        "email": response.data["email"],
        "email_personnel": response.data["email_personnel"],
        "entreprise_id": response.data["entreprise_id"],
        "statut": response.data["statut"]
    }
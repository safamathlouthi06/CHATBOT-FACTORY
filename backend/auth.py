from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database import supabase
import jwt
import datetime
import bcrypt
import os

from models.entreprise import Entreprise, LoginData 
from schemas.entreprise import EntrepriseUpdate

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

        if decoded.get("role") != "super_admin":
            raise HTTPException(status_code=403, detail="Accès refusé")

    except Exception:
        raise HTTPException(status_code=401, detail="Token invalide")


# =========================
# REGISTER ENTREPRISE
# =========================
@router.post("/register")
def register(entreprise: Entreprise):

    try:
        # ==============================
        # HASH DU MOT DE PASSE
        # ==============================
        hashed_password = bcrypt.hashpw(
            entreprise.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        # ==============================
        # DONNÉES À INSÉRER
        # ==============================
        insert_data = {
            "nomentreprise": entreprise.nomentreprise,
            "secteurd_activite": entreprise.secteurd_activite,
            "email": entreprise.email,
            "password": hashed_password,
            "statut": "pending",

            # Nouveaux champs
            "tel": entreprise.tel,
            "adresse": entreprise.adresse,
            "site_web": entreprise.site_web,
        }

        # ==============================
        # INSERTION SUPABASE
        # ==============================
        response = (
            supabase
            .table("entreprise")
            .insert(insert_data)
            .execute()
        )

        # ==============================
        # VÉRIFICATION
        # ==============================
        if not response.data:
            raise HTTPException(
                status_code=400,
                detail="Erreur lors de la création de l'entreprise"
            )

        # ==============================
        # RÉPONSE
        # ==============================
        return {
            "message": "Entreprise créée (en attente de validation)",
            "data": response.data[0]
        }

    except Exception as e:
        print("ERREUR REGISTER :", str(e))

        raise HTTPException(
            status_code=400,
            detail=f"Erreur register : {str(e)}"
        )

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
            "role": "super_admin",
            "email": data.email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        return {
            "access_token": token,
            "role": "super_admin"
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

        if not emp_user.get("password") or not bcrypt.checkpw(
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

    if not user.get("password") or not bcrypt.checkpw(
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
        .select( " id, nomentreprise, email, created_at, secteurd_activite, tel, adresse, site_web") \
        .eq("id", user["entreprise_id"]) \
        .single() \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    return {
        "id": response.data["id"],
        "nomentreprise": response.data["nomentreprise"],
        "email": response.data["email"],
        "created_at": response.data["created_at"], 
        "secteurd_activite": response.data["secteurd_activite"],
        "tel": response.data["tel"],
        "adresse": response.data["adresse"],
        "site_web": response.data["site_web"],
        #"role": user["role"]
    }

@router.put("/meEntreprise")
def update_me(
    entreprise: EntrepriseUpdate,
    user=Depends(get_current_user)
):

    update_data = {}

    if entreprise.nomentreprise is not None:
        update_data["nomentreprise"] = entreprise.nomentreprise

    if entreprise.secteurd_activite is not None:
        update_data["secteurd_activite"] = entreprise.secteurd_activite

    if entreprise.tel is not None:
        update_data["tel"] = entreprise.tel

    if entreprise.adresse is not None:
        update_data["adresse"] = entreprise.adresse

    if entreprise.site_web is not None:
        update_data["site_web"] = entreprise.site_web

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="Aucune donnée à modifier"
        )

    response = (
        supabase
        .table("entreprise")
        .update(update_data)
        .eq("id", user["entreprise_id"])
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Entreprise introuvable"
        )

    updated = response.data[0]

    return {
        "message": "Profil entreprise modifié avec succès",
        "data": {
            "id": updated["id"],
            "nomentreprise": updated["nomentreprise"],
            "email": updated["email"],
            "created_at": updated["created_at"],
            "secteurd_activite": updated["secteurd_activite"],
            "tel": updated["tel"],
            "adresse": updated["adresse"],
            "site_web": updated["site_web"]
        }
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
        .select("id, nom, prenom, email, email_personnel, entreprise_id, statut, created_at") \
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
        "statut": response.data["statut"],
        "created_at": response.data["created_at"],  
    }




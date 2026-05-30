"""
routes/employe.py

Gestion des employés par l'entreprise.
- Email généré automatiquement : prenom.nom@nomentreprise.com
- Mot de passe temporaire généré automatiquement
- Les identifiants sont envoyés sur l'email personnel de l'employé
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import supabase
from auth import get_current_user
import bcrypt
import secrets
import string
import smtplib
import os
import re
import traceback
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/employes", tags=["Employes"])

SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM     = os.getenv("SMTP_FROM", SMTP_USER)
FRONTEND_URL  = os.getenv("FRONTEND_URL", "http://localhost:3000")


class EmployeCreate(BaseModel):
    nom: str
    prenom: str
    email_personnel: str


class EmployeUpdate(BaseModel):
    nom:    Optional[str] = None
    prenom: Optional[str] = None
    statut: Optional[str] = None


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[àáâãä]", "a", text)
    text = re.sub(r"[èéêë]", "e", text)
    text = re.sub(r"[ìíîï]", "i", text)
    text = re.sub(r"[òóôõö]", "o", text)
    text = re.sub(r"[ùúûü]", "u", text)
    text = re.sub(r"[ç]", "c", text)
    text = re.sub(r"[^a-z0-9\-]", ".", text)
    text = re.sub(r"\.+", ".", text)
    return text.strip(".")


def generate_email(prenom: str, nom: str, nomentreprise: str) -> str:
    slug_prenom     = slugify(prenom)
    slug_nom        = slugify(nom)
    slug_entreprise = re.sub(r"[^a-z0-9]", "", nomentreprise.lower())
    return f"{slug_prenom}.{slug_nom}@{slug_entreprise}.com"


def generate_password(length: int = 12) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    while True:
        pwd = "".join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.isupper() for c in pwd)
                and any(c.isdigit() for c in pwd)
                and any(c in "!@#$%" for c in pwd)):
            return pwd


import requests
import os

MAILERSEND_API_KEY = os.getenv("MAILERSEND_API_KEY")
MAILERSEND_FROM_EMAIL = os.getenv("MAILERSEND_FROM_EMAIL")
MAILERSEND_FROM_NAME = os.getenv("MAILERSEND_FROM_NAME")


def send_credentials_email(email_personnel, prenom, nom, nomentreprise, email_plateforme, password):

    if not MAILERSEND_API_KEY:
        print("❌ MAILERSEND_API_KEY manquant")
        return

    url = "https://api.mailersend.com/v1/email"

    html = f"""
    <h2>Bienvenue {prenom}</h2>
    <p>Voici vos identifiants :</p>
    <p><b>Email:</b> {email_plateforme}</p>
    <p><b>Password:</b> {password}</p>
    """

    payload = {
        "from": {
            "email": MAILERSEND_FROM_EMAIL,
            "name": MAILERSEND_FROM_NAME
        },
        "to": [
            {
                "email": email_personnel,
                "name": prenom
            }
        ],
        "subject": "Vos accès Chatbot Factory",
        "html": html
    }

    headers = {
        "Authorization": f"Bearer {MAILERSEND_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code != 202:
        print("❌ Erreur MailerSend:", response.text)
    else:
        print("✅ Email envoyé avec succès")

def require_entreprise(user: dict):
    if user.get("role") != "entreprise":
        raise HTTPException(status_code=403, detail="Accès réservé à l'entreprise")


@router.post("/")
def create_employe(data: EmployeCreate, current_user=Depends(get_current_user)):
    require_entreprise(current_user)
    entreprise_id = current_user["entreprise_id"]

    ent = supabase.table("entreprise").select("nomentreprise").eq("id", entreprise_id).single().execute()
    if not ent.data:
        raise HTTPException(status_code=404, detail="Entreprise introuvable")

    nomentreprise = ent.data["nomentreprise"]
    email_plateforme = generate_email(data.prenom, data.nom, nomentreprise)

    # Gérer collision
    existing = supabase.table("employe").select("id").eq("email", email_plateforme).execute()
    if existing.data:
        parts = email_plateforme.split("@")
        count = len(supabase.table("employe").select("id").like("email", f"{parts[0]}%@{parts[1]}").execute().data or [])
        email_plateforme = f"{parts[0]}{count + 1}@{parts[1]}"

    password_clair = generate_password()
    password_hash  = bcrypt.hashpw(password_clair.encode(), bcrypt.gensalt()).decode()

    try:
        res = supabase.table("employe").insert({
            "entreprise_id":   entreprise_id,
            "nom":             data.nom,
            "prenom":          data.prenom,
            "email":           email_plateforme,
            "email_personnel": data.email_personnel,
            "password":        password_hash,
            "statut":          "actif",
        }).execute()

        send_credentials_email(
            email_personnel=data.email_personnel,
            prenom=data.prenom,
            nom=data.nom,
            nomentreprise=nomentreprise,
            email_plateforme=email_plateforme,
            password=password_clair,
        )

        return {
            "message":          "Employé créé, identifiants envoyés par email",
            "email_plateforme": email_plateforme,
            "data":             res.data[0],
        }
    except Exception:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Erreur création employé")


@router.get("/")
def get_employes(current_user=Depends(get_current_user)):
    require_entreprise(current_user)
    res = supabase.table("employe") \
        .select("id, nom, prenom, email, email_personnel, statut, created_at") \
        .eq("entreprise_id", current_user["entreprise_id"]) \
        .order("created_at", desc=False).execute()
    return res.data or []


@router.put("/{employe_id}")
def update_employe(employe_id: str, data: EmployeUpdate, current_user=Depends(get_current_user)):
    require_entreprise(current_user)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée")
    res = supabase.table("employe").update(update_data) \
        .eq("id", employe_id).eq("entreprise_id", current_user["entreprise_id"]).execute()
    return {"message": "Mis à jour", "data": res.data}


@router.patch("/{employe_id}/statut")
def toggle_statut(employe_id: str, current_user=Depends(get_current_user)):
    require_entreprise(current_user)
    res = supabase.table("employe").select("statut").eq("id", employe_id) \
        .eq("entreprise_id", current_user["entreprise_id"]).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Employé introuvable")
    new_statut = "inactif" if res.data["statut"] == "actif" else "actif"
    supabase.table("employe").update({"statut": new_statut}).eq("id", employe_id).execute()
    return {"message": f"Statut → {new_statut}", "statut": new_statut}


@router.delete("/{employe_id}")
def delete_employe(employe_id: str, current_user=Depends(get_current_user)):
    require_entreprise(current_user)
    supabase.table("employe").delete().eq("id", employe_id) \
        .eq("entreprise_id", current_user["entreprise_id"]).execute()
    return {"message": "Employé supprimé"}


@router.post("/{employe_id}/resend")
def resend_credentials(employe_id: str, current_user=Depends(get_current_user)):
    """Regénère un mot de passe et le renvoie à l'employé."""
    require_entreprise(current_user)
    emp = supabase.table("employe").select("*, entreprise(nomentreprise)") \
        .eq("id", employe_id).eq("entreprise_id", current_user["entreprise_id"]).single().execute()
    if not emp.data:
        raise HTTPException(status_code=404, detail="Employé introuvable")

    e = emp.data
    new_pwd = generate_password()
    new_hash = bcrypt.hashpw(new_pwd.encode(), bcrypt.gensalt()).decode()
    supabase.table("employe").update({"password": new_hash}).eq("id", employe_id).execute()

    send_credentials_email(
        email_personnel=e["email_personnel"],
        prenom=e["prenom"],
        nom=e["nom"],
        nomentreprise=e.get("entreprise", {}).get("nomentreprise", ""),
        email_plateforme=e["email"],
        password=new_pwd,
    )
    return {"message": "Nouveaux identifiants envoyés"}
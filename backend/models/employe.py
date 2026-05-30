from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


# =========================
# CREATE EMPLOYE
# =========================
class EmployeCreate(BaseModel):
    nom: str
    prenom: str
    email_personnel: EmailStr   # 👈 email pour envoyer login
    password: Optional[str] = None  # peut être généré côté backend


# =========================
# UPDATE EMPLOYE
# =========================
class EmployeUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email_personnel: Optional[EmailStr] = None
    statut: Optional[str] = None


# =========================
# OUTPUT EMPLOYE
# =========================
class EmployeOut(BaseModel):
    id: UUID
    entreprise_id: UUID
    nom: str
    prenom: str
    email: str              # email de connexion (auto généré)
    email_personnel: str
    role: str
    statut: str
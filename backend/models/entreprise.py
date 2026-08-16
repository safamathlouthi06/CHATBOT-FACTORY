from pydantic import BaseModel
from datetime import datetime



class Entreprise(BaseModel):
    nomentreprise: str
    secteurd_activite: str
    email: str
    password: str
    created_at: datetime | None = None  # peut être généré côté backend
    secteurd_activite: str = None
    tel: str = None
    adresse: str = None
    site_web: str = None


class LoginData(BaseModel):
    email: str
    password: str






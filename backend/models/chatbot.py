from pydantic import BaseModel
from datetime import datetime
from constants.roles import DEFAULT_ROLE

class Chatbot(BaseModel):
    nom: str
    domaine: str | None = None
    statut: str = "actif"
    role: str = DEFAULT_ROLE
    entreprise_id: str
    employe_id: str | None = None
    created_at: datetime | None = None
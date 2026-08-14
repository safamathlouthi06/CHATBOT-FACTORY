from pydantic import BaseModel
from datetime import datetime

class Chatbot(BaseModel):
    nom: str
    domaine: str | None = None
    statut: str = "actif"
    entreprise_id: str  # UUID de Supabase
    employe_id: str | None = None
    created_at: datetime | None = None
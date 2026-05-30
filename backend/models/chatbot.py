from pydantic import BaseModel

class Chatbot(BaseModel):
    nom: str
    domaine: str | None = None
    statut: str = "actif"
    entreprise_id: str  # UUID de Supabase
    employe_id: str | None = None  
    
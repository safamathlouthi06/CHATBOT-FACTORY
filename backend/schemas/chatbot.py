
from pydantic import BaseModel
DEFAULT_WELCOME_MESSAGE = "Bonjour ! En quoi puis-je vous être utile ?"

class ChatbotCreate(BaseModel):
    nom: str
    domaine: str | None = None
    statut: str = "actif"
    message_accueil: str | None = None
    ton: str | None = None

class ChatbotUpdate(BaseModel):
    nom: str | None = None
    domaine: str | None = None
    statut: str | None = None
    message_accueil: str | None = None
    ton: str | None = None

from pydantic import BaseModel, field_validator
from constants.roles import ALLOWED_ROLES, DEFAULT_ROLE

DEFAULT_WELCOME_MESSAGE = "Bonjour ! En quoi puis-je vous être utile ?"

class ChatbotCreate(BaseModel):
    nom: str
    domaine: str | None = None
    statut: str = "actif"
    message_accueil: str | None = None
    ton: str | None = None
    role: str = DEFAULT_ROLE

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ALLOWED_ROLES:
            raise ValueError(f"role invalide. Valeurs autorisées : {', '.join(ALLOWED_ROLES)}")
        return v

class ChatbotUpdate(BaseModel):
    nom: str | None = None
    domaine: str | None = None
    statut: str | None = None
    message_accueil: str | None = None
    ton: str | None = None
    role: str | None = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v is not None and v not in ALLOWED_ROLES:
            raise ValueError(f"role invalide. Valeurs autorisées : {', '.join(ALLOWED_ROLES)}")
        return v
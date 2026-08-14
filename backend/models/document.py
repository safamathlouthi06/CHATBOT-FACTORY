from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class Document(BaseModel):
    id: UUID
    chatbot_id: UUID
    titre: str
    contenu_extrait: str
    created_at: datetime | None = None
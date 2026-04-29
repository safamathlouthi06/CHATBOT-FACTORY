

from pydantic import BaseModel
from uuid import UUID


class Document(BaseModel):
    id: UUID
    chatbot_id: UUID
    titre: str
    contenu_extrait: str
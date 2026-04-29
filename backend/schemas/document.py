from pydantic import BaseModel
from uuid import UUID

class DocumentCreate(BaseModel):
    chatbot_id: UUID
    titre: str
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class FAQ(BaseModel):
    id: UUID
    chatbot_id: UUID
    question: str
    reponse: str
    created_at: datetime | None = None
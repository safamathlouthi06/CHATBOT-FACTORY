from pydantic import BaseModel
from uuid import UUID


class FAQCreate(BaseModel):
    chatbot_id: UUID
    question: str
    reponse: str




class FAQUpdate(BaseModel):
    question: str | None = None
    reponse: str | None = None
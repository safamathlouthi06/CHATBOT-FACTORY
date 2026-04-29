from pydantic import BaseModel
from uuid import UUID


class FAQCreate(BaseModel):
    chatbot_id: UUID
    question: str
    reponse: str

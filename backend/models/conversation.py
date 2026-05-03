from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class ConversationBase(BaseModel):
    chatbot_id: UUID
    role: str  # "user" | "bot"
    message: str


class ConversationCreate(ConversationBase):
    pass


class ConversationOut(ConversationBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
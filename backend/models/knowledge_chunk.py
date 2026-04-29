from pydantic import BaseModel
from uuid import UUID
from typing import List


class KnowledgeChunk(BaseModel):
    id: UUID
    chatbot_id: UUID
    content: str
    embedding: List[float]
    source_type: str
    source_id: UUID
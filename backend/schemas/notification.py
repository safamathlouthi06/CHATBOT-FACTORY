from pydantic import BaseModel
from typing import Optional

class NotificationCreate(BaseModel):
    chatbot_id: str
    employe_id: Optional[str] = None
    question: Optional[str] = ""
    reponse: Optional[str] = ""
    motif: Optional[str] = "Résultat insatisfaisant lors du test."

class NotificationDeploy(BaseModel):
    chatbot_id: str
    message: Optional[str] = None

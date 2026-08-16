from pydantic import BaseModel
from typing import Optional


class EntrepriseUpdate(BaseModel):
    nomentreprise: Optional[str] = None
    secteurd_activite: Optional[str] = None
    tel: Optional[str] = None
    adresse: Optional[str] = None
    site_web: Optional[str] = None


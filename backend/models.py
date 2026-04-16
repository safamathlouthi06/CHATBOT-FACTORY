from pydantic import BaseModel

class Entreprise(BaseModel):
    nomentreprise: str
    secteurd_activite: str
    email: str
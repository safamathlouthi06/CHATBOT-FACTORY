from fastapi import APIRouter
from database import supabase

router = APIRouter()

@router.get("/test-db")
def test_db():
    response = supabase.table("entreprise").select("*").execute()
    return response.data
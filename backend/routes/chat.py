from fastapi import APIRouter
from pydantic import BaseModel
from services.rag_service import retrieve_relevant_chunks
from database import supabase

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    chatbot_id: str
    question: str


def clean_faq(context: str) -> str:
    """
    Nettoyer une réponse FAQ
    """
    if "Réponse :" in context:
        return context.split("Réponse :")[-1].replace("\n", "").strip()
    return context.strip()


@router.post("/")
def chat(data: ChatRequest):

    # ✅ 1. récupérer contexte RAG
    context = retrieve_relevant_chunks(
        data.chatbot_id,
        data.question
    )

    print("✅ CONTEXT:", context)

    if not context:
        answer = "Je n'ai pas assez d'informations pour répondre."

    else:
        # ✅ 2. si FAQ → nettoyer
        if "Réponse :" in context:
            answer = clean_faq(context)

        else:
            # ✅ sinon document → renvoyer texte simple
            answer = context.strip()

    # ✅ 3. sauvegarde
    try:
        supabase.table("conversations").insert({
            "chatbot_id": data.chatbot_id,
            "role": "user",
            "message": data.question
        }).execute()

        supabase.table("conversations").insert({
            "chatbot_id": data.chatbot_id,
            "role": "bot",
            "message": answer
        }).execute()

    except Exception as e:
        print("❌ ERREUR save:", e)

    return {"answer": answer}
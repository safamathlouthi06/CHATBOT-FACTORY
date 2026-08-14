import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from services.rag_service import retrieve_relevant_chunks
from services.generation_service import generate_answer, is_valid_answer, DEFAULT_TON
from database import supabase
from postgrest.exceptions import APIError
router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    chatbot_id: str
    question: str
    session_id: str | None = None  # regroupe les messages en une conversation


def _insert_conversation_row(payload: dict):
    """Insère un message dans `conversations`. Si la colonne session_id
    n'existe pas encore (migration non appliquée), on retente sans elle
    pour ne jamais casser l'envoi du message."""
    try:
        return supabase.table("conversations").insert(payload).execute()
    except APIError as error:
        message = str(error)
        if "session_id" in message and "session_id" in payload:
            payload = {k: v for k, v in payload.items() if k != "session_id"}
            return supabase.table("conversations").insert(payload).execute()
        raise

def _get_chatbot_ton(chatbot_id: str) -> str:
    try:
        res = (
            supabase.table("chatbots")
            .select("ton")
            .eq("id", chatbot_id)
            .execute()
        )
        if res.data and res.data[0].get("ton"):
            return res.data[0]["ton"]
    except APIError:
        pass
    return DEFAULT_TON

# ✅ nettoyage texte généré
def clean_generated_answer(answer: str) -> str:
    patterns = [
        "Question:",
        "Réponse:",
        "bot",
        "Cette réponse correspond",
        "à la question posée"
    ]
    for p in patterns:
        answer = answer.replace(p, "")
    return answer.strip()

# ✅ filtre réponses inutiles
def is_bad_answer(answer: str) -> bool:
    bad_patterns = [
        "cette réponse correspond",
        "selon le contexte",
        "basé sur le contexte",
        "la réponse est dans le contexte",
        "à la question posée"
    ]
    return any(p in answer.lower() for p in bad_patterns)

@router.post("/")
def chat(data: ChatRequest):
    try:
        # ✅ 1. récupérer contexte
        context = retrieve_relevant_chunks(
            data.chatbot_id,
            data.question
        )
        print("✅ CONTEXT:", context)
        if not context:
            answer = "Je n'ai pas assez d'informations pour répondre."
        else:
            ton = _get_chatbot_ton(data.chatbot_id)
            # ✅ 2. génération
            generated = generate_answer(context, data.question, ton=ton)
            print("✅ GENERATED:", generated)
            # ✅ nettoyage
            generated = clean_generated_answer(generated)
            # ✅ anti-hallucination
            if (
                not generated
                or len(generated.strip()) < 5
                or is_bad_answer(generated)
                or "Je n'ai pas assez d'informations" in generated
                or not is_valid_answer(generated, context)
            ):
                print("⚠️ Fallback utilisé")
                answer = context
            else:
                answer = generated.strip()
        # ✅ 3. sauvegarde conversation (regroupée par session_id)
        session_id = data.session_id or str(uuid.uuid4())
        try:
            _insert_conversation_row({
                "chatbot_id": data.chatbot_id,
                "role": "user",
                "message": data.question,
                "session_id": session_id,
            })
            _insert_conversation_row({
                "chatbot_id": data.chatbot_id,
                "role": "bot",
                "message": answer,
                "session_id": session_id,
            })
        except Exception as e:
            print("❌ ERREUR save:", e)
        # ✅ 4. récupérer historique complet ✅
        history_res = supabase.table("conversations") \
            .select("*") \
            .eq("chatbot_id", data.chatbot_id) \
            .order("created_at", desc=False) \
            .execute()
        history = history_res.data if history_res.data else []
        # ✅ 5. retourner réponse + historique + session_id (à renvoyer
        # dans les appels suivants pour rester dans la même conversation)
        return {
            "answer": answer,
            "history": history,
            "session_id": session_id
        }
    except Exception as e:
        print("❌ ERROR:", e)
        return {
            "answer": "Erreur serveur",
            "history": [],
            "session_id": data.session_id
        }
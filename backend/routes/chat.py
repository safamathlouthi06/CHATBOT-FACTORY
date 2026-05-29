from fastapi import APIRouter
from pydantic import BaseModel
from services.rag_service import retrieve_relevant_chunks
from services.generation_service import generate_answer, is_valid_answer
from database import supabase

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    chatbot_id: str
    question: str


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
            # ✅ 2. génération
            generated = generate_answer(context, data.question)

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

        # ✅ 3. sauvegarde conversation
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

        # ✅ 4. récupérer historique complet ✅
        history_res = supabase.table("conversations") \
            .select("*") \
            .eq("chatbot_id", data.chatbot_id) \
            .order("created_at", desc=False) \
            .execute()

        history = history_res.data if history_res.data else []

        # ✅ 5. retourner réponse + historique
        return {
            "answer": answer,
            "history": history
        }

    except Exception as e:
        print("❌ ERROR:", e)
        return {
            "answer": "Erreur serveur",
            "history": []
        }

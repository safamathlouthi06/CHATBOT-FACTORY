from fastapi import APIRouter
from pydantic import BaseModel
from services.rag_service import retrieve_relevant_chunks
from core.config import supabase  # ✅ IMPORT IMPORTANT

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    chatbot_id: str
    question: str


def score_sentence(sentence: str, question: str) -> int:
    score = 0
    q_words = question.lower().split()

    for word in q_words:
        if len(word) > 3 and word in sentence.lower():
            score += 1

    return score


@router.post("/")
def chat(data: ChatRequest):

    context = retrieve_relevant_chunks(
        data.chatbot_id,
        data.question
    )

    if not context:
        return {
            "answer": "Je n'ai pas assez d'informations pour répondre."
        }

    # ✅ nettoyage
    context = context.replace("\n", " ")

    # ✅ découper
    sentences = context.split(".")

    best_sentence = ""
    best_score = 0

    for sentence in sentences:
        score = score_sentence(sentence, data.question)

        if score > best_score:
            best_score = score
            best_sentence = sentence

    if not best_sentence:
        best_sentence = sentences[0]

    # ✅ ✅ définir réponse
    answer = best_sentence.strip()

    # ✅ ✅ SAUVEGARDE HISTORIQUE

    # User message
    supabase.table("conversations").insert({
        "chatbot_id": data.chatbot_id,
        "role": "user",
        "message": data.question
    }).execute()

    # Bot message
    supabase.table("conversations").insert({
        "chatbot_id": data.chatbot_id,
        "role": "bot",
        "message": answer
    }).execute()

    return {
        "answer": answer
    }
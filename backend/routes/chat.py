from fastapi import APIRouter
from pydantic import BaseModel
from services.rag_service import retrieve_relevant_chunks

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

    # ✅ nettoyage texte
    context = context.replace("\n", " ")

    # ✅ découper intelligemment
    sentences = context.split(".")

    # ✅ scorer chaque phrase
    best_sentence = ""
    best_score = 0

    for sentence in sentences:
        score = score_sentence(sentence, data.question)

        if score > best_score:
            best_score = score
            best_sentence = sentence

    # ✅ fallback si rien trouvé
    if not best_sentence:
        best_sentence = sentences[0]

    return {
        "answer": best_sentence.strip()
    }
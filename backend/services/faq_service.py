"""
services/faq_service.py

Gestion :
- FAQ métier
- Indexation optimisée pour RAG
"""

from core.config import supabase
from services.embedding_service import create_embedding


def create_faq(chatbot_id: str, question: str, reponse: str):
    """
    Crée une FAQ et l'intègre dans le RAG de manière optimisée.
    """

    if not chatbot_id or not question or not reponse:
        raise ValueError("Données FAQ invalides")

    # ✅ Vérifier chatbot
    chatbot = supabase.table("chatbots") \
        .select("id") \
        .eq("id", chatbot_id) \
        .single() \
        .execute()

    if not chatbot.data:
        raise ValueError("Chatbot inexistant")

    # ✅ 1. Sauvegarde FAQ métier
    faq_res = supabase.table("faq").insert({
        "chatbot_id": chatbot_id,
        "question": question,
        "reponse": reponse
    }).execute()

    if not faq_res.data:
        raise Exception("Erreur insertion FAQ")

    faq_id = faq_res.data[0]["id"]

    # ✅ 2. CONTENU OPTIMISÉ POUR RAG
    content = f"""
Question: {question}
Réponse: {reponse}

""".strip()

    # ✅ 3. Embedding
    embedding = create_embedding(content)

    if not embedding:
        raise Exception("Erreur génération embedding FAQ")

    # ✅ 4. Indexation RAG
    supabase.table("knowledge_chunks").insert({
        "chatbot_id": chatbot_id,
        "content": content,
        "embedding": embedding,
        "source_type": "faq",
        "source_id": faq_id
    }).execute()

    return faq_id
"""
services/faq_service.py

Gestion :
- des FAQ métier
- de leur intégration automatique dans le RAG
"""

from core.config import supabase
from services.embedding_service import create_embedding


def create_faq(chatbot_id: str, question: str, reponse: str):
    """
    Crée une FAQ et l'indexe dans le RAG.
    """

    if not chatbot_id or not question or not reponse:
        raise ValueError("Données FAQ invalides")

    # ✅ Vérifier que le chatbot existe (évite erreur FK)
    chatbot = supabase.table("chatbots") \
        .select("id") \
        .eq("id", chatbot_id) \
        .execute()

    if not chatbot.data:
        raise ValueError("Chatbot inexistant")

    # 1️⃣ Insertion FAQ (table métier)
    faq_res = supabase.table("faq").insert({
        "chatbot_id": chatbot_id,
        "question": question,
        "reponse": reponse
    }).execute()

    if not faq_res.data:
        raise Exception("Erreur insertion FAQ")

    faq_id = faq_res.data[0]["id"]

    # ✅ 2️⃣ CONTENU À INDEXER (QUESTION + RÉPONSE) — POINT CLÉ
    content = f"Question : {question}\nRéponse : {reponse}"

    # 3️⃣ Génération embedding
    embedding = create_embedding(content)

    if not embedding:
        raise Exception("Erreur génération embedding FAQ")

    # 4️⃣ Insertion dans la base vectorielle (RAG)
    supabase.table("knowledge_chunks").insert({
        "chatbot_id": chatbot_id,
        "content": content,
        "embedding": embedding,
        "source_type": "faq",
        "source_id": faq_id
    }).execute()

    return faq_id
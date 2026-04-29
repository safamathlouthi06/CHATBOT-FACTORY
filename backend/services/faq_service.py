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

    # 1️⃣ Insertion FAQ (métier)
    faq = supabase.table("faq").insert({
        "chatbot_id": chatbot_id,
        "question": question,
        "reponse": reponse
    }).execute()

    faq_id = faq.data[0]["id"]

    # 2️⃣ Texte à indexer
    content = reponse


    # 3️⃣ Embedding
    embedding = create_embedding(content)

    # 4️⃣ Insertion RAG
    supabase.table("knowledge_chunks").insert({
        "chatbot_id": chatbot_id,
        "content": content,
        "embedding": embedding,
        "source_type": "faq",
        "source_id": faq_id
    }).execute()
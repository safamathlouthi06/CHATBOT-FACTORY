"""
services/faq_service.py

Gestion :
- FAQ métier
- Indexation optimisée pour RAG
"""

from core.config import supabase
from services.embedding_service import create_embedding


# =========================
# CREATE FAQ
# =========================
def create_faq(chatbot_id: str, question: str, reponse: str):

    if not chatbot_id or not question or not reponse:
        raise ValueError("Données FAQ invalides")

    chatbot = (
        supabase.table("chatbots")
        .select("id")
        .eq("id", chatbot_id)
        .single()
        .execute()
    )

    if not chatbot.data:
        raise ValueError("Chatbot inexistant")

    faq_res = supabase.table("faq").insert({
        "chatbot_id": chatbot_id,
        "question": question,
        "reponse": reponse
    }).execute()

    if not faq_res.data:
        raise Exception("Erreur insertion FAQ")

    faq_id = faq_res.data[0]["id"]

    content = f"""
Question: {question}

Réponse: {reponse}
""".strip()

    embedding = create_embedding(content)

    if not embedding:
        raise Exception("Erreur génération embedding FAQ")

    supabase.table("knowledge_chunks").insert({
        "chatbot_id": chatbot_id,
        "content": content,
        "embedding": embedding,
        "source_type": "faq",
        "source_id": faq_id
    }).execute()

    return faq_id


# =========================
# UPDATE FAQ
# =========================
def update_faq(
    faq_id: str,
    question: str = None,
    reponse: str = None
):

    faq = (
        supabase.table("faq")
        .select("*")
        .eq("id", faq_id)
        .single()
        .execute()
    )

    if not faq.data:
        raise ValueError("FAQ introuvable")

    old_faq = faq.data

    new_question = question or old_faq["question"]
    new_reponse = reponse or old_faq["reponse"]

    supabase.table("faq").update({
        "question": new_question,
        "reponse": new_reponse
    }).eq("id", faq_id).execute()

    content = f"""
Question: {new_question}

Réponse: {new_reponse}
""".strip()

    embedding = create_embedding(content)

    supabase.table("knowledge_chunks").update({
        "content": content,
        "embedding": embedding
    }).eq("source_type", "faq") \
     .eq("source_id", faq_id) \
     .execute()

    return True


# =========================
# DELETE FAQ
# =========================
def delete_faq(faq_id: str):

    faq = (
        supabase.table("faq")
        .select("id")
        .eq("id", faq_id)
        .single()
        .execute()
    )

    if not faq.data:
        raise ValueError("FAQ introuvable")

    # supprimer du RAG
    supabase.table("knowledge_chunks") \
        .delete() \
        .eq("source_type", "faq") \
        .eq("source_id", faq_id) \
        .execute()

    # supprimer la FAQ
    supabase.table("faq") \
        .delete() \
        .eq("id", faq_id) \
        .execute()

    return True
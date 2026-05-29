from core.config import supabase
from services.embedding_service import create_embedding


def clean_faq(content: str) -> str:
    if "Réponse :" in content:
        return content.split("Réponse :")[-1].strip()

    if "Réponse:" in content:
        return content.split("Réponse:")[-1].strip()

    return content.strip()


def clean_document(context: str, question: str) -> str:
    """
    Extraire les phrases les plus pertinentes (max 2)
    """
    sentences = context.split(".")
    relevant = []

    q_words = [w.lower() for w in question.split() if len(w) > 3]

    for sentence in sentences:
        if any(w in sentence.lower() for w in q_words):
            relevant.append(sentence.strip())

    if relevant:
        return ". ".join(relevant[:2]) + "."

    return context.strip()


def retrieve_relevant_chunks(chatbot_id: str, question: str, limit: int = 5):
    try:
        question_embedding = create_embedding(question)

        if not question_embedding:
            return ""

        response = supabase.rpc(
            "match_knowledge_chunks",
            {
                "query_embedding": question_embedding,
                "match_chatbot_id": chatbot_id,
                "match_count": limit
            }
        ).execute()

        if not response.data:
            return ""

        results = sorted(
            response.data,
            key=lambda x: x.get("similarity", 0),
            reverse=True
        )

        print("\n========= DEBUG RAG =========")

        faq_results = []
        doc_results = []

        for r in results:
            print("Similarity:", r["similarity"])
            print("Source:", r["source_type"])
            print("Content:", r["content"])
            print("----------------------")

            if r["source_type"] == "faq":
                faq_results.append(r)
            else:
                doc_results.append(r)

        # ✅ PRIORITÉ FAQ
        if faq_results:
            best_faq = faq_results[0]
            print("✅ CHOIX FINAL: FAQ")
            return clean_faq(best_faq["content"])

        # ✅ DOCUMENTS (top 3 chunks 🔥)
        if doc_results:
            top_docs = doc_results[:3]

            print("✅ CHOIX FINAL: DOCUMENT (TOP 3)")

            combined_context = " ".join(
                [doc["content"] for doc in top_docs]
            )

            cleaned = clean_document(combined_context, question)

            print("✅ CONTEXT FINAL:", cleaned)

            return cleaned

        return ""

    except Exception as e:
        print("❌ RAG ERROR:", e)
        return ""
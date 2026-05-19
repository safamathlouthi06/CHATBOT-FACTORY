from core.config import supabase
from services.embedding_service import create_embedding


def clean_faq(content: str) -> str:
    """
    Extraire uniquement la réponse d'une FAQ
    """

    # ✅ gérer plusieurs formats
    if "Réponse :" in content:
        return content.split("Réponse :")[-1].strip()

    if "Réponse:" in content:
        return content.split("Réponse:")[-1].strip()

    return content.strip()


def clean_document(context: str, question: str) -> str:
    """
    Extraire la phrase la plus pertinente du document
    """

    sentences = context.split(".")

    best_sentence = ""
    score_max = 0

    q_words = [w.lower() for w in question.split() if len(w) > 3]

    for sentence in sentences:
        score = sum(1 for w in q_words if w in sentence.lower())

        if score > score_max:
            score_max = score
            best_sentence = sentence

    if best_sentence:
        return best_sentence.strip() + "."

    return context.strip()


def retrieve_relevant_chunks(chatbot_id: str, question: str, limit: int = 5):
    try:
        # ✅ 1. embedding question
        question_embedding = create_embedding(question)

        if not question_embedding:
            return ""

        # ✅ 2. appel Supabase
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

        # ✅ 3. tri
        results = sorted(
            response.data,
            key=lambda x: x.get("similarity", 0),
            reverse=True
        )

        print("\n========= DEBUG RAG =========")
        for r in results:
            print("Similarity:", r["similarity"])
            print("Source:", r["source_type"])
            print("Content:", r["content"])
            print("----------------------")

        # ✅ 4. meilleur chunk
        best = results[0]
        best_score = best.get("similarity", 0)

        print("✅ BEST SCORE:", best_score)

        # ✅ 5. seuil
        THRESHOLD = 0.25  # ⚠️ plus flexible

        if best_score < THRESHOLD:
            print("❌ Similarité trop faible")
            return ""

        # ✅ 6. FAQ (PRIORITÉ PROPRE)
        if best.get("source_type") == "faq":
            print("✅ CHOIX FINAL: FAQ")

            cleaned = clean_faq(best["content"])

            # ✅ sécurité : éviter réponse vide
            if not cleaned:
                return ""

            return cleaned

        # ✅ 7. DOCUMENT
        if best.get("source_type") == "document":
            print("✅ CHOIX FINAL: DOCUMENT")

            cleaned = clean_document(best["content"], question)

            return cleaned

        # ✅ fallback sécurité
        return best["content"].strip()

    except Exception as e:
        print("❌ RAG ERROR:", e)
        return ""
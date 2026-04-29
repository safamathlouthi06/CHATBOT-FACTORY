"""
services/rag_service.py

RAG avec :
- embeddings locaux
- recherche vectorielle
- priorité documents
- filtre similarité (anti faux réponses)
"""

from core.config import supabase
from services.embedding_service import create_embedding


def retrieve_relevant_chunks(chatbot_id: str, question: str, limit: int = 5):
    try:
        # ✅ 1. embedding
        question_embedding = create_embedding(question)

        print("\n🟡 QUESTION :", question)
        print("🟡 EMBEDDING SAMPLE :", question_embedding[:5])

        # ✅ 2. requête DB
        response = supabase.rpc(
            "match_knowledge_chunks",
            {
                "query_embedding": question_embedding,
                "match_chatbot_id": chatbot_id,
                "match_count": limit
            }
        ).execute()

        if not response.data:
            print("⚠️ Aucun chunk trouvé")
            return ""

        # ✅ 3. DEBUG
        print("\n========= DEBUG RAG =========")
        for row in response.data:
            print("Similarity:", row.get("similarity"))
            print("Source:", row.get("source_type"))
            print("Content:", row["content"][:100])
            print("----------------------")

        # ✅ 4. prendre le meilleur
        best = response.data[0]

        similarity = best.get("similarity", 0)
        content = best["content"]

        print("✅ Meilleur score:", similarity)

        # ✅ ✅ SEUIL ANTI FAUX RÉSULTATS
        THRESHOLD = 0.45

        if similarity < THRESHOLD:
            print("❌ Question hors contexte")
            return ""

        # ✅ 5. nettoyage
        content = content.replace("\n", " ").strip()

        return content

    except Exception as e:
        print("\n❌ ERREUR RAG :", e)
        return ""
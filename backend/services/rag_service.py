"""
services/rag_service.py

RAG avec :
- embeddings locaux
- recherche vectorielle
- priorité FAQ > documents
- filtre similarité (anti faux réponses)
"""

from core.config import supabase
from services.embedding_service import create_embedding


def retrieve_relevant_chunks(chatbot_id: str, question: str, limit: int = 5):
    try:
        # ✅ 1. Embedding de la question
        question_embedding = create_embedding(question)

        print("\n🟡 QUESTION :", question)
        print("🟡 EMBEDDING SAMPLE :", question_embedding[:5])

        # ✅ 2. Recherche vectorielle (Supabase RPC)
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
            print("Content:", row["content"][:120])
            print("----------------------")

        # ✅ 4. Séparer FAQ et documents
        faq_chunks = [r for r in response.data if r.get("source_type") == "faq"]
        doc_chunks = [r for r in response.data if r.get("source_type") == "document"]

        # ✅ 5. Priorité : FAQ > Document
        if faq_chunks:
            best = faq_chunks[0]
            print("✅ Chunk choisi : FAQ")
        elif doc_chunks:
            best = doc_chunks[0]
            print("✅ Chunk choisi : DOCUMENT")
        else:
            print("⚠️ Aucun chunk valide après filtrage")
            return ""

        similarity = best.get("similarity", 0)
        content = best["content"]

        print("✅ Meilleur score:", similarity)

        # ✅ 6. Seuil anti hors-contexte
        THRESHOLD = 0.45
        if similarity < THRESHOLD:
            print("❌ Similarité trop faible → hors contexte")
            return ""

        # ✅ 7. Nettoyage du texte
        content = content.replace("\n", " ").strip()

        return content

    except Exception as e:
        print("\n❌ ERREUR RAG :", e)
        return ""
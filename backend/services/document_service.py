"""
Document service (PDF / PPT)
"""

import os
from core.config import supabase
from services.embedding_service import create_embedding
from services.chunking_service import chunk_text  # ✅ IMPORT CORRECT
from services.file_service import (
    extract_text_from_pdf,
    extract_text_from_ppt
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def create_document(chatbot_id: str, titre: str, file_path: str):

    # ✅ 1. extraction texte
    if file_path.endswith(".pdf"):
        content = extract_text_from_pdf(file_path)

    elif file_path.endswith(".pptx"):
        content = extract_text_from_ppt(file_path)

    else:
        raise Exception("Format non supporté")

    # ✅ 2. sauvegarde document
    doc = supabase.table("documents").insert({
        "chatbot_id": chatbot_id,
        "titre": titre,
        "contenu_extrait": content
    }).execute()

    doc_id = doc.data[0]["id"]

    print("✅ Document ID:", doc_id)

    # ✅ 3. chunking (depuis service externe ✅)
    chunks = chunk_text(content)

    print("✅ Nombre de chunks:", len(chunks))

    # ✅ 4. embedding + insertion
    for chunk in chunks:
        embedding = create_embedding(chunk)

        supabase.table("knowledge_chunks").insert({
            "chatbot_id": chatbot_id,
            "content": chunk,
            "embedding": embedding,
            "source_type": "document",
            "source_id": doc_id
        }).execute()

    return {
        "message": "Document traité avec succès",
        "chunks": len(chunks)
    }
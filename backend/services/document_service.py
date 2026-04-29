"""
Document service (PDF / PPT)
"""

import os
from core.config import supabase
from services.embedding_service import create_embedding
from services.file_service import (
    extract_text_from_pdf,
    extract_text_from_ppt
)


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def chunk_text(text: str, size: int = 300, overlap: int = 50):
    chunks = []

    for i in range(0, len(text), size - overlap):
        chunk = text[i:i + size]
        chunks.append(chunk)

    return chunks

def create_document(chatbot_id: str, titre: str, file_path: str):

    # ✅ 1 extraction
    if file_path.endswith(".pdf"):
        content = extract_text_from_pdf(file_path)

    elif file_path.endswith(".pptx"):
        content = extract_text_from_ppt(file_path)

    else:
        raise Exception("Format non supporté")

    # ✅ 2 save document
    doc = supabase.table("documents").insert({
        "chatbot_id": chatbot_id,
        "titre": titre,
        "contenu_extrait": content
    }).execute()

    doc_id = doc.data[0]["id"]

    # ✅ 3 chunking + embedding
    chunks = chunk_text(content)

    for chunk in chunks:
        embedding = create_embedding(chunk)

        supabase.table("knowledge_chunks").insert({
            "chatbot_id": chatbot_id,
            "content": chunk,
            "embedding": embedding,
            "source_type": "document",
            "source_id": doc_id
        }).execute()

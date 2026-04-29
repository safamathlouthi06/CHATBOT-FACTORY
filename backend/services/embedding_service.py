"""
Service de génération d'embeddings GRATUIT (local).
Utilise Sentence-Transformers (aucun appel externe).
"""

from sentence_transformers import SentenceTransformer

# Modèle gratuit local
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def create_embedding(text: str) -> list:
    """
    Génère un embedding local gratuit à partir d'un texte.

    Args:
        text (str): Texte à vectoriser

    Returns:
        list: Vecteur de 384 dimensions
    """
    embedding = model.encode(text)
    return embedding.tolist()
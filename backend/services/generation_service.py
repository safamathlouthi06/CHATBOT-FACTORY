
import os
from dotenv import load_dotenv
from openai import AzureOpenAI
from core.config import (
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT,
)

load_dotenv()

client = AzureOpenAI(
    api_key=AZURE_OPENAI_API_KEY,
    api_version="2024-02-15-preview",
    azure_endpoint=AZURE_OPENAI_ENDPOINT
)

DEFAULT_TON = "Professionnel"
DEFAULT_ROLE = "assistant"

TON_INSTRUCTIONS = {
    "Professionnel": "Adopte un ton professionnel, clair et courtois.",
    "Amical": "Adopte un ton chaleureux, amical et rassurant.",
    "Fun": "Adopte un ton décontracté, dynamique et léger, sans être irrespectueux.",
    "Formel": "Adopte un ton très formel, soutenu et respectueux.",
}

ROLE_INSTRUCTIONS = {
    "assistant": "Tu es un assistant virtuel généraliste, prêt à aider sur tout type de demande.",
    "support_client": "Tu es un agent de support client. Aide l'utilisateur à résoudre son problème rapidement et avec empathie.",
    "commercial": "Tu es un assistant commercial. Mets en avant les bénéfices des produits/services sans être insistant.",
    "ecommerce": "Tu es un conseiller e-commerce. Aide au choix produit, commandes, livraisons et retours.",
    "rh": "Tu es un assistant RH. Réponds aux questions RH (congés, contrats, procédures) avec discrétion.",
    "administratif": "Tu es un assistant administratif. Aide pour les démarches et formulaires, de façon claire.",
    "technique": "Tu es un assistant technique. Donne des explications précises, étape par étape.",
    "education": "Tu es un assistant pédagogique. Explique les concepts simplement et progressivement.",
    "marketing": "Tu es un assistant marketing. Aide à formuler des messages percutants.",
    "analytique": "Tu es un assistant analytique. Réponds avec rigueur, en t'appuyant sur les faits.",
    "faq": "Tu es un assistant FAQ. Réponds de façon brève et directe.",
    "expert": "Tu es un expert métier. Donne des réponses précises avec le vocabulaire adapté au domaine.",
    "reservation": "Tu es un assistant de réservation. Aide à réserver, modifier ou annuler une réservation.",
    "community_manager": "Tu es un community manager. Adopte un ton engageant, adapté aux réseaux sociaux.",
}

def generate_answer(context: str, question: str, ton: str = DEFAULT_TON, role: str = DEFAULT_ROLE) -> str:
    tone_instruction = TON_INSTRUCTIONS.get(ton, TON_INSTRUCTIONS.get(DEFAULT_TON, ""))
    role_instruction = ROLE_INSTRUCTIONS.get(role, ROLE_INSTRUCTIONS.get(DEFAULT_ROLE, ""))
    prompt = f"""
    {role_instruction}
    {tone_instruction}
    Ta tâche :
    - Utilise le contexte pour répondre à la question
    - Reformule la réponse si nécessaire (même si le texte n'est pas parfait)
    - Respecte strictement le ton et le rôle demandés
    - Si tu peux déduire la réponse à partir du contexte, fais-le
    Seulement si aucune information pertinente n'existe, dis :
    "Je n'ai pas assez d'informations pour répondre."
    Contexte :
    {context}
    Question :
    {question}
    Réponse :
    """
    response = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT,
        messages=[
            {"role": "system", "content": f"{role_instruction} {tone_instruction}".strip()},
            {"role": "user", "content": prompt}
        ],
       
        max_completion_tokens=150
    )
    return response.choices[0].message.content.strip()


def is_valid_answer(answer: str, context: str) -> bool:
    """
    Vérifie que la réponse existe dans le contexte
    """
    words = [w for w in answer.lower().split() if len(w) > 3]
    context_lower = context.lower()
    if not words:
        return False
    match = sum(1 for w in words if w in context_lower)
    return match >= len(words) * 0.7

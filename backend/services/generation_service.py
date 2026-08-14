
import os
from openai import AzureOpenAI
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-02-15-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)
DEFAULT_TON = "Professionnel"
TON_INSTRUCTIONS = {
    "Professionnel": "Adopte un ton professionnel, clair et courtois.",
    "Amical": "Adopte un ton chaleureux, amical et rassurant.",
    "Fun": "Adopte un ton décontracté, dynamique et léger, sans être irrespectueux.",
    "Formel": "Adopte un ton très formel, soutenu et respectueux.",
}

def generate_answer(context: str, question: str, ton: str = DEFAULT_TON) -> str:
    tone_instruction = TON_INSTRUCTIONS.get(ton, TON_INSTRUCTIONS[DEFAULT_TON])
    prompt = f"""
    Tu es un assistant basé sur une base de connaissances.
    {tone_instruction}
    Ta tâche :
    - Utilise le contexte pour répondre à la question
    - Reformule la réponse si nécessaire (même si le texte n'est pas parfait)
    - Respecte strictement le ton demandé dans ta formulation
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
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
        messages=[
            {"role": "system", "content": f"Assistant utile. {tone_instruction}"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
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

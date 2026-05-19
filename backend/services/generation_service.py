from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import re

# ✅ modèle
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-base")


def generate_answer(context: str, question: str) -> str:
    """
    Génération propre et contrôlée
    """

    # ✅ prompt plus clair et court
    prompt = f"""Réponds à la question en utilisant uniquement le contexte.

Context: {context}

Question: {question}

Réponse courte:
"""

    inputs = tokenizer(prompt, return_tensors="pt", truncation=True)

    outputs = model.generate(
        inputs["input_ids"],
        max_length=50,
        do_sample=False,        # ✅ déterministe
        num_beams=4,            # ✅ meilleur résultat
        early_stopping=True
    )

    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return answer.strip()


def is_valid_answer(answer: str, context: str) -> bool:
    """
    Validation stricte anti-hallucination
    """
    words = [w for w in answer.lower().split() if len(w) > 3]
    context_lower = context.lower()

    if not words:
        return False

    match = sum(1 for w in words if w in context_lower)

    return match >= len(words) * 0.7


def clean_generated_answer(answer: str) -> str:
    """
    Nettoyage renforcé
    """

    # ✅ supprimer tout bruit courant
    patterns = [
        r"question.*",
        r"réponse.*",
        r"this answer.*",
        r"cette réponse.*",
        r"à la question.*",
        r"\bbot\b"
    ]

    for p in patterns:
        answer = re.sub(p, "", answer, flags=re.IGNORECASE)

    # ✅ enlever espaces multiples
    answer = re.sub(r"\s+", " ", answer)

    return answer.strip()
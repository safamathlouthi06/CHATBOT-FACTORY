from transformers import pipeline

generator = pipeline("text-generation", model="gpt2")


def generate_answer(context: str, question: str) -> str:

    prompt = f"""
Contexte :
{context}

Question :
{question}

Réponse :
"""

    result = generator(
        prompt,
        max_new_tokens=80,
        do_sample=True,
        temperature=0.6
    )

    text = result[0]["generated_text"]

    # ✅ garder uniquement la partie après "Réponse :"
    if "Réponse :" in text:
        answer = text.split("Réponse :")[-1]
    else:
        answer = text

    # ✅ nettoyer réponses parasites
    answer = answer.split("Question")[0]   # stop si nouvelle question
    answer = answer.split("Q:")[0]
    answer = answer.split("A:")[0]

    return answer.strip()
from transformers import AutoTokenizer, AutoModel
import torch

# Charger FLAN-T5
tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-base")
model = AutoModel.from_pretrained("google/flan-t5-base")

model.eval()  # important en inference


def create_embedding(text: str) -> list:
    """
    Génère un embedding local à partir de FLAN-T5.
    """

    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True
    )

    with torch.no_grad():
        outputs = model.encoder(**inputs)

    # mean pooling (standard simple)
    embeddings = outputs.last_hidden_state.mean(dim=1)

    return embeddings[0].tolist()
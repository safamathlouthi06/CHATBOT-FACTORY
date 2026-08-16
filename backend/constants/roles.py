"""Rôles disponibles pour un chatbot.
La clé (ex: "support_client") est stockée en base et utilisée dans l'API.
Le label est uniquement pour l'affichage frontend.
"""

CHATBOT_ROLES = {
    "assistant": "Assistant virtuel",
    "support_client": "Support client",
    "commercial": "Assistant commercial",
    "ecommerce": "Conseiller e-commerce",
    "rh": "Assistant RH",
    "administratif": "Assistant administratif",
    "technique": "Assistant technique",
    "education": "Assistant pédagogique",
    "marketing": "Assistant marketing",
    "analytique": "Assistant analytique",
    "faq": "FAQ",
    "expert": "Expert métier",
    "reservation": "Assistant réservation",
    "community_manager": "Community Manager",
}

DEFAULT_ROLE = "assistant"
ALLOWED_ROLES = list(CHATBOT_ROLES.keys())
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from routes.chatbot import router as chatbot_router
from routes.base_connaissance import router as base_router
from routes.document import router as document_router
from routes.faq import router as faq_router
from routes.chat import router as chat_router
from routes.dashboard import router as dashboard_router
from routes.conversation import router as conversation_router
from routes.employe import router as employe_router
from routes.widget import router as widget_router
from routes.statistiques import router as statistiques_router
from routes.notification import router as notification_router

from test import router as test_router

app = FastAPI()

# =========================
# CORS CONFIG
# =========================
# Le dashboard (routes authentifiees par JWT) n'est appele que depuis le frontend.
# /chat/ et /widget/*.js doivent en revanche rester accessibles depuis n'importe
# quel site tiers, puisque c'est le widget embarque sur le site du client qui les
# appelle. CORSMiddleware s'applique a toute l'app (Starlette ne permet pas de le
# scoper par route), donc on autorise "*" globalement ici : ces routes ne portent
# aucune donnee sensible (pas de cookies, pas de credentials) et les routes
# authentifiees restent protegees par la verification du token JWT elle-meme,
# pas par CORS (CORS ne bloque que la lecture cross-origin depuis un navigateur,
# jamais un appel serveur-a-serveur).

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ROUTERS
# =========================

app.include_router(auth_router)
app.include_router(chatbot_router)
app.include_router(base_router)
app.include_router(document_router)
app.include_router(faq_router)
app.include_router(chat_router)
app.include_router(dashboard_router)
app.include_router(conversation_router)
app.include_router(employe_router)
app.include_router(widget_router)
app.include_router(statistiques_router)
app.include_router(notification_router)





app.include_router(test_router)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from routes.chatbot import router as chatbot_router
from routes.base_connaissance import router as base_router
from routes.document import router as document_router
from routes.faq import router as faq_router
from routes.chat import router as chat_router

from test import router as test_router

app = FastAPI()

# =========================
# CORS CONFIG
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
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

app.include_router(test_router)
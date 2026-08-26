"""
routes/widget.py
Sert le script JS embarquable (widget de chat flottant) pour un chatbot donné.
Route publique : aucun token requis, comme /chat/.
"""
import json
import os
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from database import supabase
from schemas.chatbot import DEFAULT_WELCOME_MESSAGE
from postgrest.exceptions import APIError

router = APIRouter(prefix="/widget", tags=["Widget"])

WIDGET_TEMPLATE = """
(function () {
  var CHATBOT_ID = %(chatbot_id)s;
  var DEFAULT_API_URL = %(api_url)s;
  var WELCOME_MESSAGE = %(welcome_message)s;
  var CHATBOT_NAME = %(chatbot_name)s;
  var welcomeShown = false;

  // Détection dynamique de l'URL du backend à partir de l'origine du script
  var API_URL = DEFAULT_API_URL;
  try {
    var scripts = document.querySelectorAll("script[src*='/widget/']");
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      if (s.src && s.src.indexOf(CHATBOT_ID) !== -1) {
        var parsed = new URL(s.src);
        API_URL = parsed.origin;
        break;
      }
    }
  } catch (e) {}

  // Identifiant de conversation : regroupe les messages d'une même visite
  var SESSION_KEY = "cf_session_" + CHATBOT_ID;
  function generateUUID() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      try { return crypto.randomUUID(); } catch (e) {}
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  var SESSION_ID;
  try {
    SESSION_ID = window.sessionStorage.getItem(SESSION_KEY);
    if (!SESSION_ID) {
      SESSION_ID = generateUUID();
      window.sessionStorage.setItem(SESSION_KEY, SESSION_ID);
    }
  } catch (e) {
    SESSION_ID = generateUUID();
  }

  var bubble = document.createElement("button");
  bubble.innerHTML = "💬";
  bubble.setAttribute("aria-label", "Ouvrir le chat");
  bubble.style.cssText = [
    "position:fixed", "bottom:20px", "right:20px", "width:56px", "height:56px",
    "border-radius:50%%", "background:#008080", "color:#fff", "border:none",
    "font-size:24px", "cursor:pointer", "box-shadow:0 4px 14px rgba(0,0,0,.25)",
    "z-index:999999"
  ].join(";");

  var panel = document.createElement("div");
  panel.style.cssText = [
    "position:fixed", "bottom:88px", "right:20px", "width:320px", "height:440px",
    "background:#fff", "border-radius:16px", "box-shadow:0 8px 30px rgba(0,0,0,.3)",
    "display:none", "flex-direction:column", "overflow:hidden",
    "font-family:Arial,Helvetica,sans-serif", "z-index:999999"
  ].join(";");

  var header = document.createElement("div");
  header.textContent = CHATBOT_NAME;
  header.style.cssText = "background:#008080;color:#fff;padding:12px 16px;font-weight:bold;";

  var messages = document.createElement("div");
  messages.style.cssText = "flex:1;overflow-y:auto;padding:12px;font-size:14px;";

  var form = document.createElement("form");
  form.style.cssText = "display:flex;border-top:1px solid #eee;";

  var input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ecrivez un message...";
  input.style.cssText = "flex:1;border:none;padding:10px;font-size:14px;outline:none;";

  var sendBtn = document.createElement("button");
  sendBtn.textContent = "Envoyer";
  sendBtn.type = "submit";
  sendBtn.style.cssText = "background:#008080;color:#fff;border:none;padding:0 14px;cursor:pointer;";

  form.appendChild(input);
  form.appendChild(sendBtn);

  panel.appendChild(header);
  panel.appendChild(messages);
  panel.appendChild(form);

  function addMessage(text, from) {
    var bubbleEl = document.createElement("div");
    bubbleEl.textContent = text;
    var isUser = from === "user";
    bubbleEl.style.cssText = [
      "margin:6px 0", "padding:8px 12px", "border-radius:12px", "max-width:80%%",
      "white-space:pre-wrap", "word-wrap:break-word",
      isUser ? "background:#008080;color:#fff;margin-left:auto;" : "background:#f1f1f1;color:#222;"
    ].join(";");
    messages.appendChild(bubbleEl);
    messages.scrollTop = messages.scrollHeight;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var question = input.value.trim();
    if (!question) return;
    addMessage(question, "user");
    input.value = "";
    sendBtn.disabled = true;

    fetch(API_URL + "/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatbot_id: CHATBOT_ID, question: question, session_id: SESSION_ID })
    })
      .then(function (r) {
        if (!r.ok) {
          throw new Error("HTTP " + r.status);
        }
        return r.json();
      })
      .then(function (data) {
        if (data && data.session_id) {
          SESSION_ID = data.session_id;
          try { window.sessionStorage.setItem(SESSION_KEY, SESSION_ID); } catch (e) {}
        }
        addMessage((data && data.answer) ? data.answer : "Erreur serveur", "bot");
      })
      .catch(function (err) {
        console.error("Chatbot widget error:", err);
        addMessage("Erreur de connexion au serveur", "bot");
      })
      .finally(function () {
        sendBtn.disabled = false;
        input.focus();
      });
  });

  bubble.addEventListener("click", function () {
    var visible = panel.style.display === "flex";
    panel.style.display = visible ? "none" : "flex";
    if (!visible && !welcomeShown && WELCOME_MESSAGE) {
      addMessage(WELCOME_MESSAGE, "bot");
      welcomeShown = true;
    }
  });

  document.body.appendChild(bubble);
  document.body.appendChild(panel);
})();
"""

@router.get("/{chatbot_id}.js")
def get_widget_script(chatbot_id: str, request: Request):
    welcome = DEFAULT_WELCOME_MESSAGE
    chatbot_name = "Assistant"
    try:
        res = (
            supabase.table("chatbots")
            .select("nom, message_accueil")
            .eq("id", chatbot_id)
            .execute()
        )
    except APIError:
        res = (
            supabase.table("chatbots")
            .select("nom")
            .eq("id", chatbot_id)
            .execute()
        )
    if not res.data:
        raise HTTPException(status_code=404, detail="Chatbot introuvable")
    chatbot = res.data[0]
    welcome = chatbot.get("message_accueil") or DEFAULT_WELCOME_MESSAGE
    chatbot_name = chatbot.get("nom") or "Assistant"

    api_url = os.getenv("PUBLIC_API_URL")
    if not api_url:
        api_url = str(request.base_url).rstrip("/")

    script = WIDGET_TEMPLATE % {
        "chatbot_id": json.dumps(chatbot_id),
        "api_url": json.dumps(api_url),
        "welcome_message": json.dumps(welcome),
        "chatbot_name": json.dumps(chatbot_name),
    }
    return Response(content=script, media_type="application/javascript")
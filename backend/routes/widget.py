"""
routes/widget.py

Sert le script JS embarquable (widget de chat flottant) pour un chatbot donné.
Route publique : aucun token requis, comme /chat/.
"""

import os
from fastapi import APIRouter
from fastapi.responses import Response

router = APIRouter(prefix="/widget", tags=["Widget"])

API_URL = os.getenv("PUBLIC_API_URL", "http://127.0.0.1:8000")


WIDGET_TEMPLATE = """
(function () {
  var CHATBOT_ID = "%(chatbot_id)s";
  var API_URL = "%(api_url)s";

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
  header.textContent = "Assistant";
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

    fetch(API_URL + "/chat/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatbot_id: CHATBOT_ID, question: question })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        addMessage(data.answer || "Erreur serveur", "bot");
      })
      .catch(function () {
        addMessage("Erreur de connexion au serveur", "bot");
      });
  });

  bubble.addEventListener("click", function () {
    var visible = panel.style.display === "flex";
    panel.style.display = visible ? "none" : "flex";
  });

  document.body.appendChild(bubble);
  document.body.appendChild(panel);
})();
"""


@router.get("/{chatbot_id}.js")
def get_widget_script(chatbot_id: str):
    script = WIDGET_TEMPLATE % {"chatbot_id": chatbot_id, "api_url": API_URL}
    return Response(content=script, media_type="application/javascript")

"""
routes/statistiques.py

Endpoints de statistiques :
- nombre de chatbots par entreprise / par employé
- nombre total de conversations + nombre de conversations par chatbot
- nombre de messages par conversation
- nombre de documents / FAQ par chatbot

Une "conversation" = un regroupement de messages partageant le même
session_id dans la table `conversations` (chaque ligne de cette table
est en réalité un message : { chatbot_id, role, message, session_id }).
Les messages antérieurs à la migration (sans session_id) sont
regroupés sous une conversation "legacy-<chatbot_id>" par chatbot afin
de ne perdre aucune donnée historique.
"""

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import get_current_user
from database import supabase

router = APIRouter(prefix="/statistiques", tags=["Statistiques"])

# Périodes acceptées par le paramètre `?period=`
PERIODES_VALIDES = {"jour", "semaine", "semaine_precedente", "mois", "tout"}


# =========================================================
# HELPERS
# =========================================================

def _get_period_range(period: Optional[str]):
    """
    Calcule les bornes [debut, fin) au format ISO pour une période donnée.

    - "jour"               -> aujourd'hui (00:00 -> maintenant/minuit suivant)
    - "semaine"             -> semaine en cours (lundi -> aujourd'hui + 1j)
    - "semaine_precedente"  -> semaine calendaire précédente (lundi -> lundi)
    - "mois"                -> mois en cours (1er -> aujourd'hui + 1j)
    - "tout" / None          -> pas de filtre -> (None, None)
    """
    if not period or period == "tout":
        return None, None

    if period not in PERIODES_VALIDES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Période invalide. Valeurs acceptées : "
                "jour, semaine, semaine_precedente, mois, tout."
            ),
        )

    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    if period == "jour":
        debut = today
        fin = today + timedelta(days=1)

    elif period == "semaine":
        debut = today - timedelta(days=today.weekday())  # lundi de cette semaine
        fin = today + timedelta(days=1)

    elif period == "semaine_precedente":
        debut_semaine_courante = today - timedelta(days=today.weekday())
        debut = debut_semaine_courante - timedelta(days=7)
        fin = debut_semaine_courante

    elif period == "mois":
        debut = today.replace(day=1)
        fin = today + timedelta(days=1)

    return debut.isoformat(), fin.isoformat()

def _parse_iso(value: Optional[str]):
    """Parse une date ISO renvoyée par Supabase en objet datetime (UTC)."""
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _in_period(created_at: Optional[str], date_debut: Optional[str], date_fin: Optional[str]) -> bool:
    """
    Vérifie si `created_at` (ISO) tombe dans [date_debut, date_fin).
    Si aucune borne n'est fournie (période = "tout"), retourne toujours True.
    """
    if not date_debut and not date_fin:
        return True

    dt = _parse_iso(created_at)
    if dt is None:
        # Pas de date de création connue -> exclu dès qu'un filtre est actif
        return False

    if date_debut and dt < _parse_iso(date_debut):
        return False
    if date_fin and dt >= _parse_iso(date_fin):
        return False
    return True


def _get_scoped_chatbots(user: dict):
    """Retourne (liste des chatbots visibles par l'utilisateur, entreprise_id)."""
    role = user.get("role")

    # NB : "created_at" est nécessaire pour pouvoir filtrer le graphique
    # "Chatbots par employé" par période. Assurez-vous d'avoir exécuté la
    # migration SQL qui ajoute cette colonne à la table `chatbots`.
    champs = "id, nom, statut, entreprise_id, employe_id, created_at"

    if role == "super_admin":
        res = (
            supabase.table("chatbots")
            .select(champs)
            .execute()
        )
        return res.data or [], None

    if role == "entreprise":
        entreprise_id = user.get("entreprise_id")
        if not entreprise_id:
            raise HTTPException(status_code=403, detail="Entreprise manquante")
        res = (
            supabase.table("chatbots")
            .select(champs)
            .eq("entreprise_id", entreprise_id)
            .execute()
        )
        return res.data or [], entreprise_id

    if role == "employe":
        employe_id = user.get("employe_id")
        if not employe_id:
            raise HTTPException(status_code=403, detail="Employé manquant")
        res = (
            supabase.table("chatbots")
            .select(champs)
            .eq("employe_id", employe_id)
            .execute()
        )
        return res.data or [], user.get("entreprise_id")

    raise HTTPException(status_code=403, detail="Rôle non autorisé")


def _count_by_chatbot_ids(
    table: str,
    chatbot_ids: list[str],
    date_debut: Optional[str] = None,
    date_fin: Optional[str] = None,
) -> dict[str, int]:
    """
    Compte le nombre de lignes de `table` par chatbot_id.

    Si `date_debut` / `date_fin` sont fournis, seules les lignes créées
    dans cet intervalle sont comptées (nécessite une colonne `created_at`
    sur la table `table`).
    """
    if not chatbot_ids:
        return {}

    query = (
        supabase.table(table)
        .select("id, chatbot_id, created_at")
        .in_("chatbot_id", chatbot_ids)
    )

    if date_debut:
        query = query.gte("created_at", date_debut)
    if date_fin:
        query = query.lt("created_at", date_fin)

    res = query.execute()
    counts: dict[str, int] = defaultdict(int)
    for row in res.data or []:
        counts[row["chatbot_id"]] += 1
    return counts


def _conversations_stats(
    chatbot_ids: list[str],
    date_debut: Optional[str] = None,
    date_fin: Optional[str] = None,
):
    """
    Regroupe les lignes de `conversations` (= messages) par session_id.

    Si `date_debut` / `date_fin` sont fournis (bornes ISO, fin exclue),
    seuls les messages créés dans cet intervalle sont pris en compte.

    Retourne :
    - conversations_par_chatbot : { chatbot_id: nombre_de_conversations }
    - messages_par_chatbot      : { chatbot_id: nombre_total_de_messages }
    - detail_par_chatbot        : { chatbot_id: [ { session_id, nombre_messages,
                                     debut, fin }, ... ] }
    """
    if not chatbot_ids:
        return {}, {}, {}

    query = (
        supabase.table("conversations")
        .select("chatbot_id, session_id, created_at")
        .in_("chatbot_id", chatbot_ids)
    )

    if date_debut:
        query = query.gte("created_at", date_debut)
    if date_fin:
        query = query.lt("created_at", date_fin)

    res = query.order("created_at", desc=False).execute()
    rows = res.data or []

    sessions_par_chatbot: dict[str, set] = defaultdict(set)
    messages_par_chatbot: dict[str, int] = defaultdict(int)
    session_meta: dict[str, dict] = {}

    for row in rows:
        cid = row["chatbot_id"]
        # Fallback pour les messages enregistrés avant la migration
        # (pas de session_id) : on les regroupe par chatbot.
        sid = row.get("session_id") or f"legacy-{cid}"

        messages_par_chatbot[cid] += 1
        sessions_par_chatbot[cid].add(sid)

        meta = session_meta.setdefault(
            sid,
            {
                "session_id": sid,
                "chatbot_id": cid,
                "nombre_messages": 0,
                "debut": row["created_at"],
                "fin": row["created_at"],
            },
        )
        meta["nombre_messages"] += 1
        meta["fin"] = row["created_at"]

    conversations_par_chatbot = {
        cid: len(sessions) for cid, sessions in sessions_par_chatbot.items()
    }

    detail_par_chatbot: dict[str, list] = defaultdict(list)
    for meta in session_meta.values():
        detail_par_chatbot[meta["chatbot_id"]].append(meta)

    return conversations_par_chatbot, messages_par_chatbot, detail_par_chatbot


def _build_chatbots_detail(
    chatbots: list[dict],
    date_debut: Optional[str] = None,
    date_fin: Optional[str] = None,
):
    chatbot_ids = [c["id"] for c in chatbots]
    doc_counts = _count_by_chatbot_ids("documents", chatbot_ids, date_debut, date_fin)
    faq_counts = _count_by_chatbot_ids("faq", chatbot_ids, date_debut, date_fin)
    conv_counts, msg_counts, conv_detail = _conversations_stats(
        chatbot_ids, date_debut, date_fin
    )

    detail = []
    for c in chatbots:
        cid = c["id"]
        detail.append(
            {
                "id": cid,
                "nom": c["nom"],
                "statut": c.get("statut"),
                "entreprise_id": c.get("entreprise_id"),
                "employe_id": c.get("employe_id"),
                "created_at": c.get("created_at"),
                "nombre_conversations": conv_counts.get(cid, 0),
                "nombre_messages": msg_counts.get(cid, 0),
                "nombre_documents": doc_counts.get(cid, 0),
                "nombre_faq": faq_counts.get(cid, 0),
            }
        )
    return detail, conv_detail


# =========================================================
# GET /statistiques/overview
# =========================================================
@router.get("/overview")
def statistiques_overview(
    period: Optional[str] = Query(
        default="tout",
        description="jour | semaine | semaine_precedente | mois | tout",
    ),
    user=Depends(get_current_user),
):
    role = user.get("role")
    chatbots, entreprise_id = _get_scoped_chatbots(user)
    date_debut, date_fin = _get_period_range(period)
    chatbots_detail, _ = _build_chatbots_detail(chatbots, date_debut, date_fin)

    totals = {
        "nombre_chatbots": len(chatbots_detail),
        "nombre_conversations": sum(c["nombre_conversations"] for c in chatbots_detail),
        "nombre_messages": sum(c["nombre_messages"] for c in chatbots_detail),
        "nombre_documents": sum(c["nombre_documents"] for c in chatbots_detail),
        "nombre_faq": sum(c["nombre_faq"] for c in chatbots_detail),
    }

    result: dict = {
        "totals": totals,
        "chatbots": chatbots_detail,
        "period": period or "tout",
    }

    # =====================================================
    # SUPER ADMIN → regroupement par entreprise
    # =====================================================
    if role == "super_admin":
        ent_res = supabase.table("entreprise").select("id, nomentreprise").execute()
        ent_names = {e["id"]: e["nomentreprise"] for e in (ent_res.data or [])}

        par_entreprise: dict[str, dict] = defaultdict(
            lambda: {"nombre_chatbots": 0, "nombre_conversations": 0,
                     "nombre_messages": 0, "nombre_documents": 0, "nombre_faq": 0}
        )
        for c in chatbots_detail:
            eid = c["entreprise_id"] or "inconnue"
            bucket = par_entreprise[eid]
            # Le chatbot ne compte dans "nombre_chatbots" que s'il a été
            # créé pendant la période sélectionnée (nécessite created_at).
            if _in_period(c.get("created_at"), date_debut, date_fin):
                bucket["nombre_chatbots"] += 1
            bucket["nombre_conversations"] += c["nombre_conversations"]
            bucket["nombre_messages"] += c["nombre_messages"]
            bucket["nombre_documents"] += c["nombre_documents"]
            bucket["nombre_faq"] += c["nombre_faq"]

        result["par_entreprise"] = [
            {
                "entreprise_id": eid,
                "nomentreprise": ent_names.get(eid, "Entreprise inconnue"),
                **data,
            }
            for eid, data in par_entreprise.items()
        ]

    # =====================================================
    # ENTREPRISE → regroupement par employé
    # =====================================================
    if role == "entreprise":
        emp_res = (
            supabase.table("employe")
            .select("id, nom, prenom")
            .eq("entreprise_id", entreprise_id)
            .execute()
        )
        emp_names = {e["id"]: f'{e["prenom"]} {e["nom"]}' for e in (emp_res.data or [])}

        par_employe: dict[str, dict] = defaultdict(
            lambda: {"nombre_chatbots": 0, "nombre_conversations": 0,
                     "nombre_messages": 0, "nombre_documents": 0, "nombre_faq": 0}
        )
        for c in chatbots_detail:
            eid = c.get("employe_id") or "sans-employe"
            bucket = par_employe[eid]
            # Idem : on ne compte le chatbot que s'il a été créé
            # pendant la période sélectionnée.
            if _in_period(c.get("created_at"), date_debut, date_fin):
                bucket["nombre_chatbots"] += 1
            bucket["nombre_conversations"] += c["nombre_conversations"]
            bucket["nombre_messages"] += c["nombre_messages"]
            bucket["nombre_documents"] += c["nombre_documents"]
            bucket["nombre_faq"] += c["nombre_faq"]

        result["par_employe"] = [
            {
                "employe_id": None if eid == "sans-employe" else eid,
                "nom": emp_names.get(eid, "Sans employé assigné"),
                **data,
            }
            for eid, data in par_employe.items()
        ]

    return result


# =========================================================
# GET /statistiques/chatbot/{chatbot_id}
# =========================================================
@router.get("/chatbot/{chatbot_id}")
def statistiques_chatbot(
    chatbot_id: str,
    period: Optional[str] = Query(
        default="tout",
        description="jour | semaine | semaine_precedente | mois | tout",
    ),
    user=Depends(get_current_user),
):
    role = user.get("role")
    chatbots, _ = _get_scoped_chatbots(user)
    ids_autorises = {c["id"] for c in chatbots}

    if role != "super_admin" and chatbot_id not in ids_autorises:
        raise HTTPException(status_code=403, detail="Accès refusé à ce chatbot")

    date_debut, date_fin = _get_period_range(period)

    doc_counts = _count_by_chatbot_ids("documents", [chatbot_id])
    faq_counts = _count_by_chatbot_ids("faq", [chatbot_id])
    conv_counts, msg_counts, conv_detail = _conversations_stats(
        [chatbot_id], date_debut, date_fin
    )

    conversations = sorted(
        conv_detail.get(chatbot_id, []),
        key=lambda c: c["debut"] or "",
        reverse=True,
    )

    return {
        "chatbot_id": chatbot_id,
        "period": period or "tout",
        "nombre_conversations": conv_counts.get(chatbot_id, 0),
        "nombre_messages": msg_counts.get(chatbot_id, 0),
        "nombre_documents": doc_counts.get(chatbot_id, 0),
        "nombre_faq": faq_counts.get(chatbot_id, 0),
        "conversations": conversations,
    }


# =========================================================
# GET /statistiques/conversation/{session_id}
# =========================================================
@router.get("/conversation/{session_id}")
def statistiques_conversation(
    session_id: str,
    chatbot_id: Optional[str] = None,
    user=Depends(get_current_user),
):
    """Détail (liste des messages) d'une conversation donnée."""
    role = user.get("role")
    chatbots, _ = _get_scoped_chatbots(user)
    ids_autorises = {c["id"] for c in chatbots}

    query = supabase.table("conversations").select("*").order("created_at", desc=False)

    if session_id.startswith("legacy-"):
        # Conversation "legacy" = tous les messages sans session_id
        # pour ce chatbot.
        cid = chatbot_id or session_id.replace("legacy-", "", 1)
        if role != "super_admin" and cid not in ids_autorises:
            raise HTTPException(status_code=403, detail="Accès refusé à ce chatbot")
        query = query.eq("chatbot_id", cid).is_("session_id", "null")
    else:
        query = query.eq("session_id", session_id)

    res = query.execute()
    messages = res.data or []

    if messages and role != "super_admin":
        if messages[0]["chatbot_id"] not in ids_autorises:
            raise HTTPException(status_code=403, detail="Accès refusé à cette conversation")

    return {
        "session_id": session_id,
        "nombre_messages": len(messages),
        "messages": messages,
    }
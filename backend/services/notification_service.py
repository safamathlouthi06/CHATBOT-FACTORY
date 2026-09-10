import uuid
from datetime import datetime, timezone

from database import supabase


def create_notification(data: dict) -> dict:
 
    notif_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    payload = {
        "id": notif_id,
        "employe_id": str(data["employe_id"]),
        "employe_nom": data.get("employe_nom") or "",
        "entreprise_id": str(data["entreprise_id"]),
        "entreprise_nom": data.get("entreprise_nom") or "Entreprise",
        "chatbot_id": str(data["chatbot_id"]),
        "chatbot_nom": data.get("chatbot_nom") or "Chatbot",
        "question": data.get("question") or "",
        "reponse": data.get("reponse") or "",
        "motif": data.get("motif") or "Notification",
        "statut": "non_lu",
        "destinataire": data.get("destinataire") or "employe",
        "type": data.get("type") or "insatisfaction",
        "created_at": now_iso,
        "lu_at": None,
    }

    try:
        response = (
            supabase
            .table("notifications")
            .insert(payload)
            .execute()
        )

        if not response.data:
            raise Exception(
                "La notification n'a pas été créée dans Supabase."
            )

        return response.data[0]

    except Exception as e:
        print(f"Erreur création notification Supabase : {e}")
        raise


def get_unread_notifications(employe_id: str) -> list[dict]:
    """
    Récupère les notifications non lues destinées à un employé.
    """

    try:
        response = (
            supabase
            .table("notifications")
            .select("*")
            .eq("employe_id", str(employe_id))
            .eq("statut", "non_lu")
            .eq("destinataire", "employe")
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception as e:
        print(
            f"Erreur récupération notifications non lues employé : {e}"
        )
        raise


def get_all_notifications_for_employe(
    employe_id: str
) -> list[dict]:
    """
    Récupère toutes les notifications destinées à un employé.
    """

    try:
        response = (
            supabase
            .table("notifications")
            .select("*")
            .eq("employe_id", str(employe_id))
            .eq("destinataire", "employe")
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception as e:
        print(
            f"Erreur récupération notifications employé : {e}"
        )
        raise


def get_unread_notifications_for_entreprise(
    entreprise_id: str
) -> list[dict]:
    """
    Récupère les notifications non lues destinées à une entreprise.
    """

    try:
        response = (
            supabase
            .table("notifications")
            .select("*")
            .eq("entreprise_id", str(entreprise_id))
            .eq("statut", "non_lu")
            .eq("destinataire", "entreprise")
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception as e:
        print(
            f"Erreur récupération notifications non lues entreprise : {e}"
        )
        raise


def get_all_notifications_for_entreprise(
    entreprise_id: str
) -> list[dict]:
    """
    Récupère toutes les notifications destinées à une entreprise.
    """

    try:
        response = (
            supabase
            .table("notifications")
            .select("*")
            .eq("entreprise_id", str(entreprise_id))
            .eq("destinataire", "entreprise")
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    except Exception as e:
        print(
            f"Erreur récupération notifications entreprise : {e}"
        )
        raise


def mark_notification_as_read(
    notification_id: str,
    employe_id: str = None,
    entreprise_id: str = None
) -> bool:
    """
    Marque une notification comme lue.
    """

    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        query = (
            supabase
            .table("notifications")
            .update({
                "statut": "lu",
                "lu_at": now_iso
            })
            .eq("id", str(notification_id))
        )

        # Vérification supplémentaire pour l'employé
        if employe_id:
            query = query.eq(
                "employe_id",
                str(employe_id)
            )

        # Vérification supplémentaire pour l'entreprise
        if entreprise_id:
            query = query.eq(
                "entreprise_id",
                str(entreprise_id)
            )

        response = query.execute()

        return bool(response.data)

    except Exception as e:
        print(
            f"Erreur marquage notification comme lue : {e}"
        )
        raise


def mark_all_as_read(employe_id: str) -> int:
    """
    Marque toutes les notifications non lues d'un employé
    comme lues.
    """

    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        response = (
            supabase
            .table("notifications")
            .update({
                "statut": "lu",
                "lu_at": now_iso
            })
            .eq("employe_id", str(employe_id))
            .eq("destinataire", "employe")
            .eq("statut", "non_lu")
            .execute()
        )

        return len(response.data or [])

    except Exception as e:
        print(
            f"Erreur marquage toutes notifications employé : {e}"
        )
        raise


def mark_all_as_read_entreprise(
    entreprise_id: str
) -> int:
    """
    Marque toutes les notifications non lues d'une entreprise
    comme lues.
    """

    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        response = (
            supabase
            .table("notifications")
            .update({
                "statut": "lu",
                "lu_at": now_iso
            })
            .eq("entreprise_id", str(entreprise_id))
            .eq("destinataire", "entreprise")
            .eq("statut", "non_lu")
            .execute()
        )

        return len(response.data or [])

    except Exception as e:
        print(
            f"Erreur marquage toutes notifications entreprise : {e}"
        )
        raise
from fastapi import APIRouter, HTTPException, Depends
from auth import get_current_user
from database import supabase
from schemas.notification import NotificationCreate, NotificationDeploy
from services.notification_service import (
    create_notification,
    get_unread_notifications,
    get_all_notifications_for_employe,
    get_unread_notifications_for_entreprise,
    get_all_notifications_for_entreprise,
    mark_notification_as_read,
    mark_all_as_read,
    mark_all_as_read_entreprise,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# =========================================================
# 1. NOTIFICATION D'INSATISFACTION (Entreprise -> Employé)
# =========================================================
@router.post("/")
def send_dissatisfaction_notification(
    data: NotificationCreate,
    current_user=Depends(get_current_user)
):
    role = current_user.get("role")
    if role not in ["entreprise", "super_admin"]:
        raise HTTPException(
            status_code=403,
            detail="Seule l'entreprise peut envoyer une notification de signalement."
        )

    # Récupérer le chatbot
    bot_res = (
        supabase.table("chatbots")
        .select("id, nom, entreprise_id, employe_id")
        .eq("id", data.chatbot_id)
        .execute()
    )
    if not bot_res.data:
        raise HTTPException(status_code=404, detail="Chatbot introuvable.")

    chatbot = bot_res.data[0]

    # Vérification des droits sur le chatbot pour l'entreprise
    ent_id = chatbot.get("entreprise_id") or current_user.get("entreprise_id")
    if role == "entreprise" and chatbot.get("entreprise_id") and chatbot.get("entreprise_id") != current_user.get("entreprise_id"):
        raise HTTPException(status_code=403, detail="Ce chatbot n'appartient pas à votre entreprise.")

    # Déterminer l'employé cible
    target_employe_id = data.employe_id or chatbot.get("employe_id")
    if not target_employe_id and ent_id:
        # Repli : trouver un employé de cette entreprise si non renseigné sur le bot
        emp_res = supabase.table("employe").select("id").eq("entreprise_id", ent_id).limit(1).execute()
        if emp_res.data:
            target_employe_id = emp_res.data[0]["id"]

    if not target_employe_id:
        raise HTTPException(
            status_code=400,
            detail="Aucun employé n'est associé à ce chatbot ou à votre entreprise."
        )

    # Récupérer le nom de l'entreprise
    entreprise_nom = "L'Entreprise"
    if ent_id:
        ent_res = supabase.table("entreprise").select("nomentreprise").eq("id", ent_id).execute()
        if ent_res.data and ent_res.data[0].get("nomentreprise"):
            entreprise_nom = ent_res.data[0]["nomentreprise"]

    notif_data = {
        "employe_id": target_employe_id,
        "entreprise_id": ent_id or "",
        "entreprise_nom": entreprise_nom,
        "chatbot_id": chatbot["id"],
        "chatbot_nom": chatbot.get("nom", "Chatbot"),
        "question": data.question or "",
        "reponse": data.reponse or "",
        "motif": data.motif or "Résultat insatisfaisant lors du test.",
        "destinataire": "employe",
        "type": "insatisfaction",
    }

    created = create_notification(notif_data)
    return {
        "message": "Notification envoyée à l'employé avec succès.",
        "data": created
    }


# =========================================================
# 2. NOTIFICATION DE DÉPLOIEMENT (Employé -> Entreprise)
# =========================================================
@router.post("/deploiement")
def send_deployment_notification(
    data: NotificationDeploy,
    current_user=Depends(get_current_user)
):
    role = current_user.get("role")
    if role != "employe":
        raise HTTPException(
            status_code=403,
            detail="Seuls les employés peuvent notifier le déploiement d'un chatbot."
        )

    employe_id = current_user.get("employe_id")
    entreprise_id = current_user.get("entreprise_id")

    if not employe_id or not entreprise_id:
        raise HTTPException(status_code=400, detail="Informations de profil employé incomplètes.")

    # Récupérer le chatbot
    bot_res = (
        supabase.table("chatbots")
        .select("id, nom, entreprise_id, employe_id")
        .eq("id", data.chatbot_id)
        .execute()
    )
    if not bot_res.data:
        raise HTTPException(status_code=404, detail="Chatbot introuvable.")

    chatbot = bot_res.data[0]

    # Récupérer le nom de l'employé
    employe_nom = "L'employé"
    emp_res = supabase.table("employe").select("nom, prenom").eq("id", employe_id).execute()
    if emp_res.data:
        p = emp_res.data[0].get("prenom") or ""
        n = emp_res.data[0].get("nom") or ""
        fullname = f"{p} {n}".strip()
        if fullname:
            employe_nom = fullname

    # Récupérer le nom de l'entreprise
    entreprise_nom = "L'Entreprise"
    ent_res = supabase.table("entreprise").select("nomentreprise").eq("id", entreprise_id).execute()
    if ent_res.data and ent_res.data[0].get("nomentreprise"):
        entreprise_nom = ent_res.data[0]["nomentreprise"]

    chatbot_nom = chatbot.get("nom", "Chatbot")
    default_motif = f"Le chatbot « {chatbot_nom} » a été déployé avec succès par {employe_nom} et est désormais opérationnel."
    motif = data.message.strip() if data.message and data.message.strip() else default_motif

    notif_data = {
        "employe_id": employe_id,
        "employe_nom": employe_nom,
        "entreprise_id": entreprise_id,
        "entreprise_nom": entreprise_nom,
        "chatbot_id": chatbot["id"],
        "chatbot_nom": chatbot_nom,
        "question": "",
        "reponse": "",
        "motif": motif,
        "destinataire": "entreprise",
        "type": "deploiement",
    }

    created = create_notification(notif_data)
    return {
        "message": "L'entreprise a été notifiée du déploiement avec succès.",
        "data": created
    }


# =========================================================
# 3. NOTIFICATIONS NON LUES (Employé & Entreprise)
# =========================================================
@router.get("/unread")
def get_my_unread_notifications(current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role == "employe":
        employe_id = current_user.get("employe_id")
        if not employe_id:
            raise HTTPException(status_code=400, detail="Identifiant employé manquant.")
        return get_unread_notifications(employe_id)

    elif role in ["entreprise", "super_admin"]:
        entreprise_id = current_user.get("entreprise_id")
        if not entreprise_id:
            raise HTTPException(status_code=400, detail="Identifiant entreprise manquant.")
        return get_unread_notifications_for_entreprise(entreprise_id)

    raise HTTPException(status_code=403, detail="Rôle non autorisé.")


# =========================================================
# 4. HISTORIQUE DES NOTIFICATIONS
# =========================================================
@router.get("/")
def get_my_notifications(current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role == "employe":
        employe_id = current_user.get("employe_id")
        return get_all_notifications_for_employe(employe_id)
    elif role in ["entreprise", "super_admin"]:
        entreprise_id = current_user.get("entreprise_id")
        return get_all_notifications_for_entreprise(entreprise_id)
    raise HTTPException(status_code=403, detail="Rôle non autorisé.")


# =========================================================
# 5. MARQUER TOUTES COMME LUES
# =========================================================
@router.put("/read-all")
def mark_all_notifications_read(current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role == "employe":
        employe_id = current_user.get("employe_id")
        count = mark_all_as_read(employe_id)
        return {"message": "Notifications marquées comme lues.", "count": count}
    elif role in ["entreprise", "super_admin"]:
        entreprise_id = current_user.get("entreprise_id")
        count = mark_all_as_read_entreprise(entreprise_id)
        return {"message": "Notifications marquées comme lues.", "count": count}

    raise HTTPException(status_code=403, detail="Rôle non autorisé.")


# =========================================================
# 6. MARQUER UNE NOTIFICATION COMME LUE
# =========================================================
@router.put("/{notification_id}/read")
def mark_single_notification_read(
    notification_id: str,
    current_user=Depends(get_current_user)
):
    role = current_user.get("role")
    if role == "employe":
        employe_id = current_user.get("employe_id")
        success = mark_notification_as_read(notification_id, employe_id=employe_id)
    elif role in ["entreprise", "super_admin"]:
        entreprise_id = current_user.get("entreprise_id")
        success = mark_notification_as_read(notification_id, entreprise_id=entreprise_id)
    else:
        raise HTTPException(status_code=403, detail="Rôle non autorisé.")

    if not success:
        raise HTTPException(status_code=404, detail="Notification introuvable ou déjà traitée.")

    return {"message": "Notification marquée comme lue."}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Plus, Trash2, X, CheckCircle, AlertCircle,
  Loader2, UserCheck, UserX, Search, RefreshCw, Mail,
} from "lucide-react";

type Employe = {
  id: string; nom: string; prenom: string;
  email: string; 
  email_personnel: string;
  statut: "actif" | "inactif"; created_at: string;
};
const API = "http://127.0.0.1:8000";

export default function EmployesPage() {
  const router = useRouter();
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success"|"error"; msg: string | any }|null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employe|null>(null);
  const [resendTarget, setResendTarget] = useState<string|null>(null);
  const [nom, setNom] = useState(""); const [prenom, setPrenom] = useState(""); const [emailP, setEmailP] = useState("");
  const [preview, setPreview] = useState("");

  const tk = () => localStorage.getItem("token") ?? "";
  const toast_ = (type:"success"|"error", msg:string) => { setToast({type,msg}); setTimeout(()=>setToast(null),4000); };

    // ✅ FIX IMPORTANT : gestion erreurs FastAPI
  const getErrorMessage = (detail: any): string => {
    if (!detail) return "Erreur inconnue";

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      return detail.map((e) => e.msg || JSON.stringify(e)).join(", ");
    }

    if (typeof detail === "object") {
      return detail.msg || JSON.stringify(detail);
    }

    return "Erreur inconnue";
  };


  const fetchEmployes = async () => {
    try { setLoading(true);
      const r = await fetch(`${API}/employes/`,{headers:{Authorization:`Bearer ${tk()}`}});
      if(r.status===403){router.push("/dashboard");return;}
      const d = await r.json(); setEmployes(Array.isArray(d)?d:[]);
    } catch { toast_("error","Impossible de charger"); } finally { setLoading(false); }
  };
  useEffect(()=>{fetchEmployes();},[]);

  useEffect(()=>{
    if(!prenom&&!nom){setPreview("");return;}
    const sl=(t:string)=>t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,".");
    const company=(localStorage.getItem("nomentreprise")||"entreprise").toLowerCase().replace(/[^a-z0-9]/g,"");
    const p=sl(prenom.trim()), n=sl(nom.trim());
    setPreview(p&&n?`${p}.${n}@${company}.com`:"");
  },[prenom,nom]);

  const handleCreate = async () => {
    if(!nom.trim()||!prenom.trim()||!emailP.trim()){toast_("error","Tous les champs sont obligatoires");return;}
    setSaving(true);
    try {
      const r = await fetch(`${API}/employes/`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${tk()}`},body:JSON.stringify({nom:nom.trim(),prenom:prenom.trim(),email_personnel:emailP.trim()})});
      const d = await r.json();
      if (!r.ok) {
        toast_("error", getErrorMessage(d.detail));
        return;
      }
      toast_("success",`Employé créé — identifiants envoyés à ${emailP}`);
      setShowForm(false); setNom(""); setPrenom(""); setEmailP(""); fetchEmployes();
    } catch { toast_("error","Erreur réseau"); } finally { setSaving(false); }
  };

  const handleToggle = async (emp:Employe) => {
    try {
      const r = await fetch(`${API}/employes/${emp.id}/statut`,{method:"PATCH",headers:{Authorization:`Bearer ${tk()}`}});
      const d = await r.json();
      if(!r.ok){toast_("error",d.detail);return;}
      toast_("success",`Compte ${d.statut==="actif"?"activé":"désactivé"}`); fetchEmployes();
    } catch { toast_("error","Erreur"); }
  };

  const handleDelete = async () => {
    if(!deleteTarget)return;
    try {
      await fetch(`${API}/employes/${deleteTarget.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${tk()}`}});
      toast_("success","Employé supprimé"); setDeleteTarget(null); fetchEmployes();
    } catch { toast_("error","Erreur suppression"); }
  };

  const handleResend = async (id:string) => {
    setResendTarget(id);
    try {
      const r = await fetch(`${API}/employes/${id}/resend`,{method:"POST",headers:{Authorization:`Bearer ${tk()}`}});
      const d = await r.json();
      if(!r.ok){toast_("error",d.detail);return;}
      toast_("success","Nouveaux identifiants envoyés");
    } catch { toast_("error","Erreur"); } finally { setResendTarget(null); }
  };

  const filtered = employes.filter(e=>`${e.nom} ${e.prenom} ${e.email} ${e.email_personnel}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {toast&&<div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-medium ${toast.type==="success"?"bg-[#008080]":"bg-red-500"}`}>
        {toast.type==="success"?<CheckCircle size={16}/>:<AlertCircle size={16}/>}
        {typeof toast.msg === "string"? toast.msg: JSON.stringify(toast.msg)}
      </div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#008080]"/>Gestion des employés
          </h1>
          <p className="text-sm text-[#2F6F6F] mt-1">{employes.length} employé{employes.length>1?"s":""} — les accès sont envoyés automatiquement par email</p>
        </div>
        <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-4 py-2.5 rounded-xl transition text-sm font-semibold shadow-md">
          <Plus size={16}/>Ajouter un employé
        </button>
      </div>

      {showForm&&(
        <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] rounded-2xl p-6 shadow-lg space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-[#0B3C3C] dark:text-white">Nouvel employé</h2>
            <button onClick={()=>{setShowForm(false);setNom("");setPrenom("");setEmailP("");}} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">Prénom <span className="text-red-500">*</span></label>
              <input className="w-full border border-[#B8E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] dark:bg-gray-800 dark:text-white" placeholder="Marie" value={prenom} onChange={e=>setPrenom(e.target.value)}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">Nom <span className="text-red-500">*</span></label>
              <input className="w-full border border-[#B8E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] dark:bg-gray-800 dark:text-white" placeholder="Dupont" value={nom} onChange={e=>setNom(e.target.value)}/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0B3C3C] dark:text-gray-300 mb-1.5">Email personnel <span className="text-red-500">*</span></label>
            <input type="email" className="w-full border border-[#B8E0E0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008080] dark:bg-gray-800 dark:text-white" placeholder="marie.dupont@gmail.com" value={emailP} onChange={e=>setEmailP(e.target.value)}/>
            <p className="text-xs text-[#2F6F6F] mt-1.5">Les identifiants de connexion seront envoyés à cette adresse.</p>
          </div>
          {preview&&(
            <div className="bg-[#D9F3F3] border border-[#B8E0E0] rounded-xl px-4 py-3">
              <p className="text-xs text-[#2F6F6F] mb-1">Email de connexion qui sera créé :</p>
              <p className="text-sm font-mono font-bold text-[#005F5F]">{preview}</p>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={handleCreate} disabled={saving} className="flex items-center gap-2 bg-[#008080] hover:bg-[#005F5F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition shadow-md">
              {saving?<Loader2 size={15} className="animate-spin"/>:<Mail size={15}/>}
              {saving?"Création en cours...":"Créer et envoyer les accès"}
            </button>
            <button onClick={()=>{setShowForm(false);setNom("");setPrenom("");setEmailP("");}} className="px-4 py-2.5 border border-[#B8E0E0] rounded-xl text-sm hover:bg-[#D9F3F3] transition">Annuler</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00A8A8]"/>
        <input className="w-full pl-10 pr-4 py-2.5 border border-[#B8E0E0] rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-[#008080] text-sm" placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {loading?(
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#008080]" size={36}/></div>
      ):filtered.length===0?(
        <div className="text-center py-16 border border-[#B8E0E0] rounded-2xl bg-white dark:bg-gray-900">
          <Users className="w-14 h-14 mx-auto text-[#00A8A8] mb-4"/>
          <p className="font-semibold text-[#0B3C3C] dark:text-white mb-1">{search?"Aucun résultat":"Aucun employé encore"}</p>
          {!search&&<p className="text-sm text-[#2F6F6F]">Ajoutez votre premier employé pour lui donner accès à la plateforme.</p>}
        </div>
      ):(
        <div className="bg-white dark:bg-gray-900 border border-[#B8E0E0] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-[#D9F3F3] dark:bg-gray-800">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#005F5F] uppercase tracking-wide">Employé</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#005F5F] uppercase tracking-wide hidden sm:table-cell">Email connexion</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#005F5F] uppercase tracking-wide hidden md:table-cell">Email personnel</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#005F5F] uppercase tracking-wide">Statut</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#005F5F] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8F7F7] dark:divide-gray-800">
              {filtered.map(emp=>(
                <tr key={emp.id} className="hover:bg-[#F7FFFF] dark:hover:bg-gray-800 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {emp.prenom[0]?.toUpperCase()}{emp.nom[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#0B3C3C] dark:text-white">{emp.prenom} {emp.nom}</p>
                        <p className="text-xs text-[#2F6F6F]">Ajouté le {new Date(emp.created_at).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="font-mono text-xs text-[#005F5F] bg-[#D9F3F3] px-2 py-1 rounded-lg">{emp.email}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-[#2F6F6F] dark:text-gray-400">{emp.email_personnel}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${emp.statut==="actif"?"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400":"bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.statut==="actif"?"bg-green-500":"bg-red-500"}`}/>
                      {emp.statut==="actif"?"Actif":"Inactif"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={()=>handleResend(emp.id)} disabled={resendTarget===emp.id} className="p-2 rounded-lg hover:bg-[#D9F3F3] text-[#008080] transition" title="Renvoyer les identifiants">
                        {resendTarget===emp.id?<Loader2 size={15} className="animate-spin"/>:<RefreshCw size={15}/>}
                      </button>
                      <button onClick={()=>handleToggle(emp)} className={`p-2 rounded-lg transition ${emp.statut==="actif"?"hover:bg-red-50 text-red-500":"hover:bg-green-50 text-green-500"}`} title={emp.statut==="actif"?"Désactiver":"Activer"}>
                        {emp.statut==="actif"?<UserX size={15}/>:<UserCheck size={15}/>}
                      </button>
                      <button onClick={()=>setDeleteTarget(emp)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition" title="Supprimer">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget&&(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500"/>
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Supprimer l'employé</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Voulez-vous supprimer <strong>{deleteTarget.prenom} {deleteTarget.nom}</strong> ? Son accès à la plateforme sera révoqué.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={()=>setDeleteTarget(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition">Annuler</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center gap-2 transition">
                <Trash2 size={14}/>Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
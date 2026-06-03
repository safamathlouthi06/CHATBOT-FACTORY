"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  X,
  Upload,
  FileText,
  HelpCircle,
  Play,
  Globe,
  Zap,
  ChevronRight,
  Check,
  Loader2,
  CheckCircle,
  Database,
  TestTube,
  Rocket,
  AlertCircle
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

export default function CreateChatbotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlChatbotId = searchParams.get("id");
  const urlStep = searchParams.get("step");

  const getStepFromUrl = (): Step => {
    const step = Number(urlStep);
    if (step >= 1 && step <= 4) return step as Step;
    return 1;
  };

  const [currentStep, setCurrentStep] = useState<Step>(getStepFromUrl());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [chatbotId, setChatbotId] = useState<string | null>(urlChatbotId);
  const [chatbotName, setChatbotName] = useState("");

  const activeChatbotId = chatbotId || urlChatbotId;

  // STEP 1
  const [form, setForm] = useState({
    nom: "",
    domaine: "",
    role: "Support Client",
    tone: "Professionnel",
    welcomeMessage: "Bonjour ! En quoi puis-je vous être utile ?",
  });

  // STEP 2
  const [documents, setDocuments] = useState<File[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; reponse: string }[]>([]);
  const [newFaq, setNewFaq] = useState({ question: "", reponse: "" });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // STEP 3
  const [testMessage, setTestMessage] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testMessages, setTestMessages] = useState<{ role: string; content: string }[]>([]);

  // STEP 4
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [embedCode, setEmbedCode] = useState("");

  const steps = [
    { id: 1, title: "Informations", icon: Bot, description: "Configurez votre chatbot" },
    { id: 2, title: "Base de connaissances", icon: Database, description: "Ajoutez des données" },
    { id: 3, title: "Test", icon: TestTube, description: "Testez votre chatbot" },
    { id: 4, title: "Déploiement", icon: Rocket, description: "Mettez en ligne" },
  ];

  // sync URL → state
  useEffect(() => {
    setCurrentStep(getStepFromUrl());
  }, [urlStep]);

  // Charger le nom du chatbot si on a un ID
  useEffect(() => {
    const fetchChatbotName = async () => {
      if (activeChatbotId && !chatbotName) {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://127.0.0.1:8000/chatbot/${activeChatbotId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setChatbotName(data.nom);
          }
        } catch (error) {
          console.error("Erreur chargement nom:", error);
        }
      }
    };
    fetchChatbotName();
  }, [activeChatbotId]);

  const goToStep = (step: number) => {
    if (step === 1) {
      router.push("/employe/chatbots/create?step=1");
      return;
    }

    if (!activeChatbotId) {
      router.push("/employe/chatbots/create?step=1");
      return;
    }

    router.push(`/employe/chatbots/create?id=${activeChatbotId}&step=${step}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // CREATE CHATBOT
  const handleCreateChatbot = async () => {
    if (!form.nom || !form.domaine) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Vous devez être connecté");
        setLoading(false);
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: form.nom,
          domaine: form.domaine,
          statut: "brouillon",
        }),
      });

      const data = await res.json();

if (!res.ok) {

  // Erreur nom déjà utilisé
  if (res.status === 400) {
    setError(data.detail || "Nom du chatbot déjà utilisé");
    return;
  }

  // Non autorisé
  if (res.status === 401) {
    setError("Session expirée. Reconnectez-vous.");
    return;
  }

  // Autres erreurs
  setError(data.detail || `Erreur ${res.status}`);
  return;
}

      // ✅ CORRECTION: Extraire l'ID de la structure correcte
      // La réponse a cette structure: { message: "...", data: [{ id: "...", ... }] }
let newId = null;

if (data.data?.id) {
  newId = data.data.id;
}
else if (data.id) {
  newId = data.id;
}
else if (data.chatbot_id) {
  newId = data.chatbot_id;
}
      if (!newId) {
        console.error("Structure de la réponse:", JSON.stringify(data, null, 2));
        setError("ID chatbot manquant dans la réponse du serveur");
        return;
      }

      setChatbotId(newId);
      setChatbotName(form.nom);
      router.push(`/employe/chatbots/create?id=${newId}&step=2`);
      
    } catch (err: any) {
      console.error("Erreur création:", err);
      setError(err.message || "Erreur lors de la création du chatbot");
    } finally {
      setLoading(false);
    }
  };

  // SAVE KNOWLEDGE
  const handleSaveKnowledge = async () => {
    if (!activeChatbotId) return;

    setUploading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");

      for (const file of documents) {
        const formData = new FormData();
        formData.append("chatbot_id", activeChatbotId);
        formData.append("titre", file.name);
        formData.append("file", file);

        const res = await fetch("http://localhost:8000/documents/", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Erreur upload document");
        }
      }

      for (const faq of faqs) {
        const res = await fetch("http://localhost:8000/faq/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chatbot_id: activeChatbotId,
            question: faq.question,
            reponse: faq.reponse,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Erreur ajout FAQ");
        }
      }

      router.push(`/employe/chatbots/create?id=${activeChatbotId}&step=3`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setUploading(false);
    }
  };

  const goToTest = () => {
    if (activeChatbotId) {
      router.push(`/employe/chatbots/create?id=${activeChatbotId}&step=3`);
    }
  };

  // TEST CHAT
  const handleTestMessage = async () => {
    if (!testMessage.trim() || !activeChatbotId) return;

    setTestMessages(prev => [...prev, { role: "user", content: testMessage }]);
    setTestLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatbot_id: activeChatbotId,
          question: testMessage,
        }),
      });

      const data = await res.json();
      setTestMessages(prev => [...prev, { role: "bot", content: data.answer || "Pas de réponse." }]);

    } catch (err) {
      setTestMessages(prev => [...prev, { role: "bot", content: "Erreur serveur." }]);
    } finally {
      setTestLoading(false);
      setTestMessage("");
    }
  };

  // DEPLOY
  const handleDeploy = async () => {
    if (!activeChatbotId) return;

    setDeploying(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://127.0.0.1:8000/chatbot/${activeChatbotId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: "actif" }),
      });

      if (!res.ok) {
        throw new Error("Erreur déploiement");
      }

      const code = `<script>
  (function() {
    var s = document.createElement('script');
    s.src = 'https://cdn.chatbotstudio.com/widget.js';
    s.setAttribute('data-id', '${activeChatbotId}');
    document.body.appendChild(s);
  })();
</script>
<div id="chatbot-widget-${activeChatbotId}"></div>`;

      setEmbedCode(code);
      setDeployed(true);
    } catch (err: any) {
      setError(err.message || "Erreur déploiement");
    } finally {
      setDeploying(false);
    }
  };

  const addFaq = () => {
    if (newFaq.question && newFaq.reponse) {
      setFaqs([...faqs, newFaq]);
      setNewFaq({ question: "", reponse: "" });
    }
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D9F3F3] via-white to-[#E8FFFF]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => currentStep > 1 ? goToStep(currentStep - 1) : router.back()}
            className="flex items-center gap-2 text-[#008080] hover:text-[#005F5F] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Retour</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0B3C3C]">Créer un chatbot</h1>
              <p className="text-sm text-[#2F6F6F] mt-0.5">Créez votre assistant IA en 4 étapes simples</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div 
                key={step.id} 
                className="flex-1 relative cursor-pointer" 
                onClick={() => step.id <= currentStep && goToStep(step.id)}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      transition-all duration-300 z-10 relative
                      ${currentStep >= step.id 
                        ? "bg-[#008080] text-white shadow-lg" 
                        : "bg-gray-200 text-gray-500"}
                    `}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <div className="text-center mt-2">
                    <p className={`text-xs font-medium ${currentStep >= step.id ? "text-[#008080]" : "text-gray-400"}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-gray-400 hidden sm:block">{step.description}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`
                      absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2
                      ${currentStep > step.id ? "bg-[#008080]" : "bg-gray-200"}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Erreur</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1 - Informations */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-[#B8E0E0] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B8E0E0]">
              <Bot className="w-5 h-5 text-[#008080]" />
              <h2 className="font-semibold text-[#0B3C3C]">Informations générales</h2>
            </div>
            
            <div className="space-y-4">
<div>
  <label className="block text-sm font-medium text-[#0B3C3C] mb-1">
    Nom du chatbot <span className="text-red-500">*</span>
  </label>

  <input
    type="text"
    name="nom"
    value={form.nom}
    onChange={handleChange}
    placeholder="Ex: Assistant Client Pro"
    className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 transition
      ${
        error
          ? "border-red-400 focus:ring-red-400"
          : "border-[#B8E0E0] focus:ring-[#008080]"
      }`}
  />

  {error && (
    <p className="text-sm text-red-500 mt-1">
      {error}
    </p>
  )}
</div>

              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] mb-1">
                  Domaine d'activité <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="domaine"
                  value={form.domaine}
                  onChange={handleChange}
                  placeholder="Ex: E-commerce, Support client, RH..."
                  className="w-full border border-[#B8E0E0] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#008080] transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] mb-1">
                  Rôle du chatbot
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-[#B8E0E0] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#008080] transition"
                >
                  <option>Support Client</option>
                  <option>Assistant Commercial</option>
                  <option>Coach</option>
                  <option>Assistant RH</option>
                  <option>Conseiller Technique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] mb-1">
                  Ton de la conversation
                </label>
                <select
                  name="tone"
                  value={form.tone}
                  onChange={handleChange}
                  className="w-full border border-[#B8E0E0] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#008080] transition"
                >
                  <option>Professionnel</option>
                  <option>Amical</option>
                  <option>Fun</option>
                  <option>Formel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0B3C3C] mb-1">
                  Message d'accueil
                </label>
                <textarea
                  name="welcomeMessage"
                  value={form.welcomeMessage}
                  onChange={handleChange}
                  rows={2}
                  className="w-full border border-[#B8E0E0] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#008080] transition resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleCreateChatbot}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-lg font-medium hover:shadow-md transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                Créer et continuer
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 - Base de connaissances */}
        {currentStep === 2 && activeChatbotId && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-700">
                  Chatbot "{chatbotName}" créé avec succès !
                </p>
                <p className="text-xs text-green-600">ID: {activeChatbotId}</p>
              </div>
            </div>

            {/* Upload documents */}
            <div className="bg-white rounded-xl border border-[#B8E0E0] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B8E0E0]">
                <Upload className="w-5 h-5 text-[#008080]" />
                <h2 className="font-semibold text-[#0B3C3C]">Documents</h2>
              </div>

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[#B8E0E0] rounded-lg p-6 text-center cursor-pointer hover:border-[#008080] transition"
              >
                <Upload className="w-8 h-8 mx-auto text-[#00A8A8] mb-2" />
                <p className="text-sm text-[#2F6F6F]">Cliquez pour ajouter des documents</p>
                <p className="text-xs text-gray-400">PDF, PPTX, TXT - Max 20 Mo</p>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.pptx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setDocuments([...documents, ...Array.from(e.target.files)]);
                    }
                  }}
                />
              </div>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-[#D9F3F3] rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#008080]" />
                        <span className="text-sm text-[#0B3C3C]">{doc.name}</span>
                      </div>
                      <button onClick={() => removeDocument(idx)} className="text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl border border-[#B8E0E0] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B8E0E0]">
                <HelpCircle className="w-5 h-5 text-[#008080]" />
                <h2 className="font-semibold text-[#0B3C3C]">FAQ personnalisées</h2>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Question"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  className="w-full border border-[#B8E0E0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
                <textarea
                  placeholder="Réponse"
                  value={newFaq.reponse}
                  onChange={(e) => setNewFaq({ ...newFaq, reponse: e.target.value })}
                  rows={2}
                  className="w-full border border-[#B8E0E0] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#008080] resize-none"
                />
                <button onClick={addFaq} className="text-sm text-[#008080] hover:text-[#005F5F]">
                  + Ajouter une FAQ
                </button>
              </div>

              {faqs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="p-3 bg-[#D9F3F3] rounded-lg">
                      <p className="text-sm font-medium text-[#0B3C3C]">Q: {faq.question}</p>
                      <p className="text-xs text-[#2F6F6F] mt-1">R: {faq.reponse}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3">
              <button onClick={() => goToStep(1)} className="px-6 py-2.5 border border-[#B8E0E0] rounded-lg">
                Précédent
              </button>
              <div className="flex gap-3">
                <button onClick={goToTest} className="px-6 py-2.5 border border-[#008080] rounded-lg text-[#008080]">
                  Passer
                </button>
                <button onClick={handleSaveKnowledge} disabled={uploading} className="flex items-center gap-2 px-6 py-2.5 bg-[#008080] text-white rounded-lg">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 - Test */}
        {currentStep === 3 && activeChatbotId && (
          <div className="bg-white rounded-xl border border-[#B8E0E0] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#B8E0E0]">
              <Play className="w-5 h-5 text-[#008080]" />
              <h2 className="font-semibold text-[#0B3C3C]">Testez votre chatbot</h2>
            </div>

            <div className="h-96 bg-[#D9F3F3] rounded-lg p-4 overflow-y-auto mb-4">
              {testMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="w-12 h-12 text-[#00A8A8] mb-3" />
                  <p className="text-[#2F6F6F]">Commencez une conversation</p>
                </div>
              ) : (
                testMessages.map((msg, idx) => (
                  <div key={idx} className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-lg ${msg.role === "user" ? "bg-[#008080] text-white" : "bg-white border"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTestMessage()}
                placeholder="Tapez votre message..."
                className="flex-1 border rounded-lg px-4 py-2"
              />
              <button onClick={handleTestMessage} className="px-4 py-2 bg-[#008080] text-white rounded-lg">
                Envoyer
              </button>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => goToStep(2)} className="px-6 py-2.5 border rounded-lg">
                Précédent
              </button>
              <button onClick={() => goToStep(4)} className="px-6 py-2.5 bg-[#008080] text-white rounded-lg">
                Déployer
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 - Déploiement */}
        {currentStep === 4 && activeChatbotId && (
          <div className="bg-white rounded-xl border border-[#B8E0E0] p-6 shadow-sm">
            {!deployed ? (
              <div className="text-center py-8">
                <Rocket className="w-16 h-16 mx-auto text-[#00A8A8] mb-4" />
                <h3 className="text-lg font-semibold mb-2">Votre chatbot est prêt !</h3>
                <button onClick={handleDeploy} disabled={deploying} className="px-6 py-3 bg-[#008080] text-white rounded-lg">
                  {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Déployer"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-700">✅ Chatbot déployé avec succès !</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Code d'intégration</label>
                  <pre className="bg-gray-900 text-white p-4 rounded-lg text-xs overflow-x-auto">
                    {embedCode}
                  </pre>
                  <button onClick={() => navigator.clipboard.writeText(embedCode)} className="mt-2 text-[#008080]">
                    Copier le code
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
// app/employe/help/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  MessageSquare,
  BookOpen,
  Video,
  Mail,
  Phone,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Catégories de support
  const categories = [
    { id: "all", label: "Tous", icon: HelpCircle },
    { id: "getting-started", label: "Prise en main", icon: BookOpen },
    { id: "chatbots", label: "Chatbots", icon: MessageSquare },
    { id: "tutorials", label: "Tutoriels", icon: Video },
    { id: "contact", label: "Contact", icon: Mail },
  ];

  // FAQ
  const faqs = [
    {
      id: 1,
      question: "Comment créer mon premier chatbot ?",
      answer:
        "Pour créer votre premier chatbot, rendez-vous dans la section 'Chatbots' puis cliquez sur 'Nouveau chatbot'. Suivez ensuite l'assistant de création qui vous guidera pas à pas dans la configuration de votre chatbot personnalisé.",
      category: "getting-started",
    },
    {
      id: 2,
      question: "Comment personnaliser l'apparence de mon chatbot ?",
      answer:
        "Dans les paramètres de votre chatbot, vous pouvez personnaliser les couleurs, les polices, l'avatar et la position du widget de chat. Accédez à 'Paramètres > Apparence' pour modifier ces options.",
      category: "chatbots",
    },
    {
      id: 3,
      question: "Comment intégrer mon chatbot sur mon site web ?",
      answer:
        "Après avoir créé votre chatbot, rendez-vous dans 'Paramètres > Intégration'. Vous y trouverez un code JavaScript à copier-coller sur votre site web, à placer avant la fermeture de la balise </body>.",
      category: "chatbots",
    },
    {
      id: 4,
      question: "Comment suivre les performances de mon chatbot ?",
      answer:
        "La section 'Statistiques' vous permet de suivre les performances de vos chatbots : nombre de conversations, taux de satisfaction, temps de réponse moyen, etc. Vous pouvez également exporter ces données en CSV.",
      category: "tutorials",
    },
    {
      id: 5,
      question: "Comment gérer les utilisateurs de mon entreprise ?",
      answer:
        "Dans la section 'Paramètres > Utilisateurs', vous pouvez inviter de nouveaux collaborateurs, gérer leurs rôles et permissions, et suivre leur activité sur la plateforme.",
      category: "getting-started",
    },
    {
      id: 6,
      question: "Comment obtenir de l'aide supplémentaire ?",
      answer:
        "Notre équipe de support est disponible du lundi au vendredi de 9h à 18h. Vous pouvez nous contacter via le chat en direct, par email à support@chatbotfactory.com ou par téléphone au +33 1 23 45 67 89.",
      category: "contact",
    },
  ];

  // Tutoriels
  const tutorials = [
    {
      title: "Guide de création de chatbot",
      description: "Apprenez à créer un chatbot professionnel en 10 minutes",
      duration: "10 min",
      level: "Débutant",
      icon: BookOpen,
    },
    {
      title: "Personnalisation avancée",
      description: "Maîtrisez toutes les options de personnalisation",
      duration: "15 min",
      level: "Intermédiaire",
      icon: Video,
    },
    {
      title: "Optimisation des conversations",
      description: "Améliorez la qualité des interactions de votre chatbot",
      duration: "12 min",
      level: "Avancé",
      icon: Video,
    },
  ];

  // Filtrage des FAQ
  const filteredFaqs = faqs.filter(
    (faq) =>
      (activeCategory === "all" || faq.category === activeCategory) &&
      (searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle FAQ
  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

    


      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B3C3C] dark:text-white flex items-center gap-2">
            
             Aide & Support
          </h1>

          <p className="text-sm text-[#2F6F6F] dark:text-gray-400 mt-1">
            Trouvez des réponses à vos questions et obtenez de l'aide
          </p>
        </div>

</div>

      {/* =====================================================
          BARRE DE RECHERCHE
      ===================================================== */}

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher dans l'aide..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#0F172A] border border-[#D9E3E5] dark:border-[#1E293B] rounded-2xl focus:ring-2 focus:ring-[#007A80] focus:border-transparent transition-all text-[#134E52] dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* =====================================================
          CATÉGORIES
      ===================================================== */}

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white shadow-lg shadow-[#007A80]/20"
                  : "bg-white dark:bg-[#0F172A] text-[#134E52] dark:text-zinc-300 hover:bg-[#E8FAFB] dark:hover:bg-[#111827] border border-[#D9E3E5] dark:border-[#1E293B]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================
          RÉSULTATS
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* =====================================================
            COLONNE DE GAUCHE - FAQ
        ===================================================== */}

        <div className="lg:col-span-2 space-y-4">
          {/* EN-TÊTE FAQ */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#134E52] dark:text-white">
              Questions fréquentes
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredFaqs.length} résultats
            </span>
          </div>

          {/* LISTE DES FAQ */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#D9E3E5] dark:border-[#1E293B] overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#007A80]/5"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#F8FCFD] dark:hover:bg-[#111827] transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[#007A80] font-medium text-sm">
                          Q:
                        </span>
                        <span className="font-medium text-[#134E52] dark:text-white">
                          {faq.question}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {categories.find((c) => c.id === faq.category)?.label}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        expandedFaq === faq.id ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {expandedFaq === faq.id && (
                    <div className="px-6 pb-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1E293B]">
                        <div className="flex items-start gap-2 mt-2">
                          <span className="text-[#00B7C2] font-medium text-sm">
                            R:
                          </span>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                          <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#007A80] transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Utile
                          </button>
                          <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#007A80] transition-colors">
                            <ThumbsDown className="w-3.5 h-3.5" />
                            Pas utile
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#D9E3E5] dark:border-[#1E293B] p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Aucune question trouvée pour &quot;{searchQuery}&quot;
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Essayez d&apos;autres mots-clés ou contactez notre support
              </p>
            </div>
          )}
        </div>

        {/* =====================================================
            COLONNE DE DROITE - SIDEBAR
        ===================================================== */}

        <div className="space-y-6">
          {/* =====================================================
              TUTORIELS
          ===================================================== */}

         

          {/* =====================================================
              CONTACT
          ===================================================== */}

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#D9E3E5] dark:border-[#1E293B] p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-[#007A80]" />
              <h3 className="font-semibold text-[#134E52] dark:text-white">
                Besoin d&apos;aide ?
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FCFD] dark:bg-[#111827]">
                <div className="p-2 rounded-lg bg-[#007A80]/10 dark:bg-[#007A80]/20">
                  <Mail className="w-4 h-4 text-[#007A80]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#134E52] dark:text-white">
                    Email
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    support@chatbotfactory.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FCFD] dark:bg-[#111827]">
                <div className="p-2 rounded-lg bg-[#007A80]/10 dark:bg-[#007A80]/20">
                  <Phone className="w-4 h-4 text-[#007A80]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#134E52] dark:text-white">
                    Téléphone
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    +33 1 23 45 67 89
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FCFD] dark:bg-[#111827]">
                <div className="p-2 rounded-lg bg-[#007A80]/10 dark:bg-[#007A80]/20">
                  <Clock className="w-4 h-4 text-[#007A80]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#134E52] dark:text-white">
                    Horaires
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lun - Ven, 9h - 18h
                  </p>
                </div>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#007A80]/30 transition-all duration-300">
              Contacter le support
            </button>
          </div>

          {/* =====================================================
              STATUT
          ===================================================== */}

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#D9E3E5] dark:border-[#1E293B] p-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00B7C2] animate-pulse" />
                <span className="text-sm font-medium text-[#134E52] dark:text-white">
                  Tous les systèmes sont opérationnels
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Dernière vérification : il y a 2 minutes
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#D9E3E5] dark:border-[#1E293B] p-4 text-center">
          <p className="text-2xl font-bold text-[#007A80]">24/7</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Support disponible
          </p>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#D9E3E5] dark:border-[#1E293B] p-4 text-center">
          <p className="text-2xl font-bold text-[#007A80]">98%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Taux de satisfaction
          </p>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#D9E3E5] dark:border-[#1E293B] p-4 text-center">
          <p className="text-2xl font-bold text-[#007A80]">&lt; 2h</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Temps de réponse moyen
          </p>
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-[#D9E3E5] dark:border-[#1E293B] p-4 text-center">
          <p className="text-2xl font-bold text-[#007A80]">500+</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Articles d&apos;aide
          </p>
        </div>
      </div>

    
    </div>
  );
}
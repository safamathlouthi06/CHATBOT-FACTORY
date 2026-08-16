"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Shield,
  HelpCircle,
} from "lucide-react";

import { API_URL } from "@/services/api";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* =========================================================
     STATES
  ========================================================= */

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const pathname = usePathname() || "";

  const [user, setUser] = useState({
    name: "Chargement...",
    email: "",
    plan: "Employe",
    avatar: "...",
  });

  /* =========================================================
     REF DU MENU UTILISATEUR
  ========================================================= */

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  /* =========================================================
     DARK MODE
  ========================================================= */

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  /* =========================================================
     CHARGEMENT UTILISATEUR
  ========================================================= */

  useEffect(() => {
    const fetchEntreprise = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const res = await fetch(`${API_URL}/meEmploye`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(
            "Impossible de récupérer les informations de l'utilisateur."
          );
        }

        const data = await res.json();

        const finalName =
          data?.prenom && data?.nom
            ? `${data.prenom} ${data.nom}`
            : "Employé inconnu";

        setUser({
          name: finalName,
          email: data?.email || "",
          plan: "Employe",
          avatar: `${data?.prenom?.[0] || ""}${
            data?.nom?.[0] || ""
          }`.toUpperCase(),
        });
      } catch (error) {
        console.error(
          "Erreur chargement utilisateur:",
          error
        );
      }
    };

    fetchEntreprise();
  }, []);

  /* =========================================================
     CLICK EN DEHORS DU MENU UTILISATEUR
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const navItems = [
    {
      href: "/employe",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/employe/chatbots",
      label: "Chatbots",
      icon: Bot,
    },
    {
      href: "/employe/stats",
      label: "Statistiques",
      icon: BarChart3,
    },
    {
      href: "/employe/profile",
      label: "Profile",
      icon: User,
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F8] dark:bg-[#0B1120]">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B7C2]/10 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#007A80]/10 rounded-full blur-3xl" />
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-[#D9E3E5] dark:border-[#1E293B] bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl">

        <div className="px-4 md:px-6">

          <div className="flex items-center justify-between h-16">

            {/* =================================================
                LOGO
            ================================================= */}

            <Link
              href="/employe"
              className="flex items-center gap-3"
            >

              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#007A80] via-[#009CA6] to-[#00C7D1] flex items-center justify-center">

                <Bot className="w-4 h-4 text-white" />

              </div>

              <span className="font-black text-xl bg-gradient-to-r from-[#005C61] via-[#009CA6] to-[#00C7D1] bg-clip-text text-transparent">

                Chatbot Factory

              </span>

            </Link>

            {/* =================================================
                NAVIGATION DESKTOP
            ================================================= */}

            <div className="hidden md:flex items-center gap-2">

              {navItems.map((item) => {

                const Icon = item.icon;

                const isActive =
                  item.href === "/employe"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(
                        item.href + "/"
                      );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white shadow-lg shadow-[#007A80]/20"
                        : "text-[#134E52] dark:text-zinc-300 hover:bg-[#E8FAFB] dark:hover:bg-[#111827]"
                    }`}
                  >

                    <Icon className="w-4 h-4" />

                    <span className="text-sm font-semibold">
                      {item.label}
                    </span>

                  </Link>
                );
              })}

            </div>

            {/* =================================================
                RIGHT
            ================================================= */}

            <div className="flex items-center gap-2">

              {/* =================================================
                  USER MENU
              ================================================= */}

              <div
                ref={userMenuRef}
                className="relative"
              >

                {/* =================================================
                    BOUTON AVATAR
                ================================================= */}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();

                    setIsUserMenuOpen(
                      (prev) => !prev
                    );
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-[#E8FAFB] dark:hover:bg-[#111827] transition-all duration-300 group"
                >

                  {/* AVATAR */}

                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007A80] to-[#00D5DF] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-[#007A80]/20 group-hover:shadow-[#007A80]/40 transition-shadow">

                    {user.avatar}

                  </div>

                  {/* NOM + STATUT */}

                  <div className="hidden lg:block text-left">

                    <p className="text-sm font-semibold text-[#134E52] dark:text-white">

                      {user.name}

                    </p>

                    <div className="flex items-center gap-1.5">
                      
                      <span className="text-xs text-[#6CAFB4] dark:text-gray-400 font-medium">
                        {user.plan}
                      </span>
                    </div>

                  </div>

                  {/* CHEVRON */}

                  <ChevronDown
                    className={`hidden lg:block w-4 h-4 text-[#6CAFB4] transition-all duration-300 ${
                      isUserMenuOpen
                        ? "rotate-180 text-[#007A80]"
                        : ""
                    }`}
                  />

                </button>

                {/* =================================================
                    DROPDOWN USER - AMÉLIORÉ
                ================================================= */}

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-[#D7F3F5] dark:border-[#1E293B] overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >

                    {/* =================================================
                        INFORMATIONS UTILISATEUR - AMÉLIORÉ
                    ================================================= */}

                    <div className="p-5 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-gradient-to-br from-[#F8FCFD] to-white dark:from-[#0B1120] dark:to-[#0F172A]">

                      <div className="flex items-center gap-4">

                        {/* AVATAR GRAND */}

                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#007A80] to-[#00D5DF] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#007A80]/20 shrink-0">

                          {user.avatar}

                        </div>

                        <div className="flex-1 min-w-0">

                          <p className="font-bold text-[#134E52] dark:text-white text-base truncate">

                            {user.name}

                          </p>

                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">

                            {user.email}

                          </p>

                          {/* BADGE PLAN */}

                          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#007A80]/10 to-[#00B7C2]/10 dark:from-[#007A80]/20 dark:to-[#00B7C2]/20 border border-[#007A80]/20 dark:border-[#007A80]/30">

                            

                            <span className="text-xs font-semibold text-[#007A80] dark:text-[#00B7C2]">

                              {user.plan}

                            </span>

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        MENU - AMÉLIORÉ AVEC ICÔNES ET DESIGN
                    ================================================= */}

                    <div className="p-2 space-y-1">

                      {/* PROFIL */}

                      <Link
                        href="/employe/profile"
                        onClick={() =>
                          setIsUserMenuOpen(false)
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#134E52] dark:text-zinc-200 rounded-xl hover:bg-[#E8FAFB] dark:hover:bg-[#111827] transition-all duration-200 group"
                      >

                        <div className="w-8 h-8 rounded-lg bg-[#E8FAFB] dark:bg-[#111827] flex items-center justify-center group-hover:bg-[#007A80]/10 dark:group-hover:bg-[#007A80]/20 transition-colors">

                          <User className="w-4 h-4 text-[#007A80]" />

                        </div>

                        <div className="flex-1">

                          <span className="font-medium">
                            Mon profil
                          </span>

                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            Gérer vos informations personnelles
                          </p>

                        </div>

                      </Link>

                      {/* PARAMÈTRES */}

                      <Link
                        href="/employe/settings"
                        onClick={() =>
                          setIsUserMenuOpen(false)
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#134E52] dark:text-zinc-200 rounded-xl hover:bg-[#E8FAFB] dark:hover:bg-[#111827] transition-all duration-200 group"
                      >

                        <div className="w-8 h-8 rounded-lg bg-[#E8FAFB] dark:bg-[#111827] flex items-center justify-center group-hover:bg-[#007A80]/10 dark:group-hover:bg-[#007A80]/20 transition-colors">

                          <Settings className="w-4 h-4 text-[#007A80]" />

                        </div>

                        <div className="flex-1">

                          <span className="font-medium">
                            Paramètres
                          </span>

                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            Personnaliser votre expérience
                          </p>

                        </div>

                      </Link>

                      {/* AIDE & SUPPORT - NOUVEAU */}

                      <Link
                        href="/employe/help"
                        onClick={() =>
                          setIsUserMenuOpen(false)
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#134E52] dark:text-zinc-200 rounded-xl hover:bg-[#E8FAFB] dark:hover:bg-[#111827] transition-all duration-200 group"
                      >

                        <div className="w-8 h-8 rounded-lg bg-[#E8FAFB] dark:bg-[#111827] flex items-center justify-center group-hover:bg-[#007A80]/10 dark:group-hover:bg-[#007A80]/20 transition-colors">

                          <HelpCircle className="w-4 h-4 text-[#007A80]" />

                        </div>

                        <div className="flex-1">

                          <span className="font-medium">
                            Aide & Support
                          </span>

                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            Obtenir de l'aide et des ressources
                          </p>

                        </div>

                      </Link>

                      {/* SEPARATION AVEC DESIGN */}

                      <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[#E5E7EB] dark:border-[#1E293B]"></div>
                        </div>
                        
                      </div>

                      {/* DÉCONNEXION - AMÉLIORÉE AVEC EFFET */}

                      <Link
                        href="/"
                        onClick={() =>
                          setIsUserMenuOpen(false)
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                      >

                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">

                          <LogOut className="w-4 h-4 text-red-500" />

                        </div>

                        <div className="flex-1">

                          <span className="font-medium">
                            Déconnexion
                          </span>

                          <p className="text-[10px] text-red-400/60 dark:text-red-400/50">
                            Quitter votre session
                          </p>

                        </div>

                        {/* INDICATEUR DE SÉCURITÉ */}

                        <Shield className="w-3 h-3 text-red-400/40" />

                      </Link>

                    </div>

                   
                  </div>
                )}

              </div>

              {/* =================================================
                  MOBILE MENU
              ================================================= */}

              <button
                type="button"
                className="md:hidden p-2 rounded-xl text-[#134E52] dark:text-zinc-200 hover:bg-[#E8FAFB] dark:hover:bg-[#111827] transition"
                onClick={() =>
                  setIsMobileMenuOpen(
                    (prev) => !prev
                  )
                }
              >

                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}

              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ===================================================== */}

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#D9E3E5] dark:border-[#1E293B] bg-white dark:bg-[#0F172A] p-3">

            <div className="space-y-1">

              {navItems.map((item) => {

                const Icon = item.icon;

                const isActive =
                  item.href === "/employe"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(
                        item.href + "/"
                      );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      isActive
                        ? "bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white"
                        : "text-[#134E52] dark:text-zinc-300 hover:bg-[#E8FAFB] dark:hover:bg-[#111827]"
                    }`}
                  >

                    <Icon className="w-5 h-5" />

                    <span className="text-sm font-semibold">
                      {item.label}
                    </span>

                  </Link>
                );
              })}

            </div>

          </div>
        )}

      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex-1 p-6 md:p-8 relative z-10">

        {children}

      </main>

    </div>
  );
}
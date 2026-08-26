"use client";

import { useEffect, useRef, useState } from "react";
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
  Rocket,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pathname = usePathname() || "";

  // REF DU MENU UTILISATEUR
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // FERMER LE MENU SI ON CLIQUE EN DEHORS
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // ============================================================
  // COMPTE ADMIN FIXE
  // ============================================================

  const user = {
    name: "Admin",
    email: "admin@chatbotfactory.com",
    role: "Administrateur",
    plan: "Pro",
    avatar: "AD",
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/entreprise",
      label: "Entreprises",
      icon: Bot,
    },
    {
      href: "/admin/widget-preview",
      label: "Test déploiement",
      icon: Rocket,
    },
    {
      href: "/admin/stats",
      label: "Statistiques",
      icon: BarChart3,
    },
    {
      href: "/admin/settings",
      label: "Paramètres",
      icon: Settings,
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F8] dark:bg-[#0B1120]">
      {/* ========================================================
          BACKGROUND
      ======================================================== */}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B7C2]/10 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#007A80]/10 rounded-full blur-3xl" />
      </div>

      {/* ========================================================
          NAVBAR
      ======================================================== */}

      <nav className="sticky top-0 z-50 border-b border-[#D9E3E5] dark:border-[#1E293B] bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl">
        <div className="px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* ==================================================
                LOGO
            ================================================== */}

            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#007A80] via-[#009CA6] to-[#00C7D1] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>

              <span className="font-black text-xl bg-gradient-to-r from-[#005C61] via-[#009CA6] to-[#00C7D1] bg-clip-text text-transparent">
                Chatbot Factory Admin
              </span>
            </Link>

            {/* ==================================================
                NAVIGATION
            ================================================== */}

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                const isActive =
                  item.href === "/admin"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white"
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

            {/* ==================================================
                RIGHT
            ================================================== */}

            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* ==================================================
                  USER MENU
              ================================================== */}

              <div
                ref={userMenuRef}
                className="relative"
              >
                {/* BOUTON PROFIL */}

                <button
                  onClick={() =>
                    setIsUserMenuOpen((prev) => !prev)
                  }
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-[#E8FAFB] dark:hover:bg-[#111827] transition-all duration-300"
                >
                  {/* AVATAR */}

                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007A80] to-[#00D5DF] flex items-center justify-center text-white text-sm font-bold">
                    {user.avatar}
                  </div>

                  {/* USER INFOS */}

                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-[#134E52] dark:text-white">
                      {user.name}
                    </p>

                    <p className="text-xs text-[#6CAFB4] dark:text-zinc-400">
                      {user.role}
                    </p>
                  </div>

                  <ChevronDown
                    className={`hidden lg:block w-4 h-4 text-[#6CAFB4] transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* ==================================================
                    DROPDOWN
                ================================================== */}

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-[#D7F3F5] dark:border-[#1E293B] overflow-hidden z-20">
                    {/* HEADER */}

                    <div className="p-4 border-b border-gray-100 dark:border-[#1E293B]">
                      <p className="font-bold text-[#134E52] dark:text-white">
                        {user.name}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>

                    {/* MENU */}

                    <div className="p-2">
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-gray-100 dark:hover:bg-[#111827] transition-all text-gray-700 dark:text-zinc-300"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />

                        Mon profil
                      </button>

                    

                      <hr className="my-2 border-gray-200 dark:border-[#1E293B]" />

                      <Link
                        href="/"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" />

                        Déconnexion
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* ==================================================
                  MOBILE MENU BUTTON
              ================================================== */}

              <button
                className="md:hidden p-2 rounded-xl hover:bg-[#E8FAFB] dark:hover:bg-[#111827]"
                onClick={() =>
                  setIsMobileMenuOpen((prev) => !prev)
                }
              >
                {isMobileMenuOpen ? (
                  <X />
                ) : (
                  <Menu />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================
            MOBILE MENU
        ====================================================== */}

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#D9E3E5] dark:border-[#1E293B] bg-white dark:bg-[#0F172A]">
            <div className="p-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                const isActive =
                  item.href === "/admin"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white"
                        : "text-[#134E52] dark:text-zinc-300 hover:bg-[#E8FAFB] dark:hover:bg-[#111827]"
                    }`}
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                  >
                    <Icon className="w-5 h-5" />

                    <span className="font-semibold">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* ========================================================
          MAIN
      ======================================================== */}

      <main className="flex-1 p-6 md:p-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
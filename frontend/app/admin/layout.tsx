"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Settings,
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

  // ============================================================
  // REF DU MENU UTILISATEUR
  // ============================================================

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
  // COMPTE ADMIN
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
              href="/admin"
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#007A80] via-[#009CA6] to-[#00C7D1] flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>

              <span className="font-black text-xl bg-gradient-to-r from-[#005C61] via-[#009CA6] to-[#00C7D1] bg-clip-text text-transparent">
                Chatbot Factory Admin
              </span>
            </Link>

            {/* ==================================================
                NAVIGATION DESKTOP
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
                    className={`
                      flex items-center gap-2
                      px-4 py-2
                      rounded-2xl
                      transition-all duration-300
                      ${
                        isActive
                          ? "bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white shadow-sm"
                          : "text-[#134E52] dark:text-zinc-300 hover:bg-[#E8FAFB] dark:hover:bg-[#111827]"
                      }
                    `}
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
                RIGHT SIDE
            ================================================== */}

            <div className="flex items-center gap-2">

              {/* THEME */}
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
                  type="button"
                  onClick={() =>
                    setIsUserMenuOpen((prev) => !prev)
                  }
                  className="
                    flex items-center gap-2
                    p-1.5
                    rounded-2xl
                    hover:bg-[#E8FAFB]
                    dark:hover:bg-[#111827]
                    transition-all duration-300
                  "
                >

                  {/* AVATAR */}

                  <div className="
                    w-9 h-9
                    rounded-xl
                    bg-gradient-to-br
                    from-[#007A80]
                    to-[#00D5DF]
                    flex items-center justify-center
                    text-white
                    text-sm
                    font-bold
                    shadow-sm
                  ">
                    {user.avatar}
                  </div>

                  {/* USER INFOS */}

                  <div className="hidden lg:block text-left">

                    <p className="
                      text-sm
                      font-semibold
                      text-[#134E52]
                      dark:text-white
                    ">
                      {user.name}
                    </p>

                    <p className="
                      text-xs
                      text-[#6CAFB4]
                      dark:text-zinc-400
                    ">
                      {user.role}
                    </p>

                  </div>

                  {/* CHEVRON */}

                  <ChevronDown
                    className={`
                      hidden lg:block
                      w-4 h-4
                      text-[#6CAFB4]
                      transition-transform duration-200
                      ${
                        isUserMenuOpen
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />

                </button>

                {/* ==================================================
                    DROPDOWN USER
                ================================================== */}

                {isUserMenuOpen && (
                  <div
                    className="
                      absolute
                      right-0
                      mt-3
                      w-64
                      bg-white
                      dark:bg-[#0F172A]
                      rounded-2xl
                      shadow-xl
                      border
                      border-gray-200
                      dark:border-[#1E293B]
                      overflow-hidden
                      z-50
                      animate-in
                      fade-in
                      slide-in-from-top-2
                      duration-200
                    "
                  >

                    {/* ==================================================
                        USER HEADER
                    ================================================== */}

                    <div className="px-4 py-3.5">

                      <div className="flex items-center gap-3">

                        {/* AVATAR */}

                        <div
                          className="
                            w-10 h-10
                            rounded-xl
                            bg-gradient-to-br
                            from-[#007A80]
                            to-[#00B7C2]
                            flex items-center justify-center
                            text-white
                            text-sm
                            font-bold
                            shrink-0
                          "
                        >
                          {user.avatar}
                        </div>

                        {/* INFORMATIONS */}

                        <div className="min-w-0">

                          <p className="
                            text-sm
                            font-semibold
                            text-gray-900
                            dark:text-white
                            truncate
                          ">
                            {user.name}
                          </p>

                          <p className="
                            text-xs
                            text-gray-500
                            dark:text-zinc-400
                            truncate
                          ">
                            {user.email}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* SEPARATOR */}

                    <div className="
                      border-t
                      border-gray-100
                      dark:border-[#1E293B]
                    " />

                    {/* ==================================================
                        MENU ITEMS
                    ================================================== */}

                    <div className="p-2">

                      {/* PARAMÈTRES */}

                      <Link
                        href="/admin/settings"
                        onClick={() =>
                          setIsUserMenuOpen(false)
                        }
                        className="
                          flex items-center gap-3
                          w-full
                          px-3 py-2.5
                          rounded-xl
                          text-sm
                          font-medium
                          text-gray-700
                          dark:text-zinc-300
                          hover:bg-gray-100
                          dark:hover:bg-[#111827]
                          transition-colors duration-200
                        "
                      >

                        <Settings className="
                          w-4 h-4
                          text-gray-500
                          dark:text-zinc-400
                        " />

                        <span>
                          Paramètres
                        </span>

                      </Link>

                      {/* SEPARATOR */}

                      <div className="
                        my-1.5
                        border-t
                        border-gray-100
                        dark:border-[#1E293B]
                      " />

                      {/* DÉCONNEXION */}

                      <Link
                        href="/"
                        onClick={() =>
                          setIsUserMenuOpen(false)
                        }
                        className="
                          flex items-center gap-3
                          w-full
                          px-3 py-2.5
                          rounded-xl
                          text-sm
                          font-medium
                          text-red-500
                          hover:bg-red-50
                          dark:hover:bg-red-500/10
                          transition-colors duration-200
                        "
                      >

                        <LogOut className="w-4 h-4" />

                        <span>
                          Déconnexion
                        </span>

                      </Link>

                    </div>

                  </div>
                )}

              </div>

              {/* ==================================================
                  MOBILE MENU BUTTON
              ================================================== */}

              <button
                type="button"
                aria-label={
                  isMobileMenuOpen
                    ? "Fermer le menu"
                    : "Ouvrir le menu"
                }
                className="
                  md:hidden
                  p-2
                  rounded-xl
                  hover:bg-[#E8FAFB]
                  dark:hover:bg-[#111827]
                  transition-colors
                "
                onClick={() =>
                  setIsMobileMenuOpen((prev) => !prev)
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

        {/* ======================================================
            MOBILE MENU
        ====================================================== */}

        {isMobileMenuOpen && (
          <div className="
            md:hidden
            border-t
            border-[#D9E3E5]
            dark:border-[#1E293B]
            bg-white
            dark:bg-[#0F172A]
          ">

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
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                    className={`
                      flex items-center gap-3
                      px-4 py-3
                      rounded-2xl
                      transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-r from-[#007A80] to-[#00B7C2] text-white shadow-sm"
                          : "text-[#134E52] dark:text-zinc-300 hover:bg-[#E8FAFB] dark:hover:bg-[#111827]"
                      }
                    `}
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

      <main className="
        flex-1
        p-6
        md:p-8
        relative
        z-10
      ">
        {children}
      </main>

    </div>
  );
}
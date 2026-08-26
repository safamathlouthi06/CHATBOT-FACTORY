"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  FileText,
  Settings,
  CreditCard,
  LifeBuoy,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,

  ChevronRight,
} from "lucide-react";
import { API_URL } from "@/services/api";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const pathname = usePathname() || "";
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState({
    name: "Chargement...",
    email: "",
    role: " ",
    plan: "Pro",
    avatar: "...",
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  // ─── Gestion du clic en dehors du dropdown ──────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchEntreprise = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_URL}/meEntreprise`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const finalName = data?.nomentreprise ?? "Entreprise inconnue";

        setUser({
          name: finalName,
          email: data?.email || "",
          role: "Entreprise",
          plan: "Pro",
          avatar: finalName
            .split(" ")
            .map((w: string) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
        });
      } catch (error) {
        console.error("Erreur chargement entreprise:", error);
      }
    };

    fetchEntreprise();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/employes", label: "Employés", icon: FileText },
    { href: "/dashboard/chatbots", label: "Chatbots", icon: Bot },
    { href: "/dashboard/stats", label: "Statistiques", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F8] dark:bg-[#0B1120]">

      {/* BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00B7C2]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#007A80]/10 rounded-full blur-3xl" />
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-[#D9E3E5] dark:border-[#1E293B] bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl">
        <div className="px-4 md:px-6">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#007A80] via-[#009CA6] to-[#00C7D1] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-xl bg-gradient-to-r from-[#005C61] via-[#009CA6] to-[#00C7D1] bg-clip-text text-transparent">
                Chatbot Factory
              </span>
            </Link>

            {/* NAV */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");

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

            {/* RIGHT */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* USER MENU */}
<div className="relative" ref={userMenuRef}>
  {/* ───────────────── User Button ───────────────── */}
  <button
    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
    className={`
      flex items-center gap-2.5 p-1.5 pr-2
      rounded-2xl
      transition-all duration-300
      border
      ${
        isUserMenuOpen
          ? "bg-[#E8FAFB] dark:bg-[#13232A] border-[#B8E8EB] dark:border-[#1F454C] shadow-sm"
          : "bg-transparent border-transparent hover:bg-[#E8FAFB] dark:hover:bg-[#111827]"
      }
    `}
  >
    {/* Avatar */}
    <div className="relative">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007A80] via-[#009BA3] to-[#00D5DF] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-[#007A80]/20">
        {user.avatar || user.name?.charAt(0)?.toUpperCase()}
      </div>

      {/* Online indicator */}
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0F172A]" />
    </div>

    {/* User information */}
    <div className="hidden lg:block text-left min-w-[110px]">
      <p className="text-sm font-semibold text-[#134E52] dark:text-white truncate max-w-[140px]">
        {user.name}
      </p>

      <p className="text-[11px] text-[#6CAFB4] dark:text-zinc-400 capitalize">
        {user.role}
      </p>
    </div>

    {/* Chevron */}
    <ChevronDown
      className={`
        hidden lg:block w-4 h-4
        text-[#6CAFB4] dark:text-zinc-500
        transition-transform duration-300
        ${isUserMenuOpen ? "rotate-180" : ""}
      `}
    />
  </button>

  {/* ───────────────── Dropdown ───────────────── */}
  {isUserMenuOpen && (
    <div
      className="
        absolute right-0 mt-3
        w-[290px]
        bg-white/95 dark:bg-[#0F172A]/95
        backdrop-blur-xl
        rounded-3xl
        shadow-2xl
        shadow-black/10 dark:shadow-black/30
        border border-[#D7F3F5] dark:border-[#1E293B]
        overflow-hidden
        z-50
        animate-in fade-in zoom-in-95 slide-in-from-top-2
        duration-200
      "
    >
      {/* ───────── Profile Header ───────── */}
      <div className="p-4 bg-gradient-to-br from-[#F0FCFD] to-white dark:from-[#10252A] dark:to-[#0F172A] border-b border-[#E3F4F5] dark:border-[#1E293B]">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007A80] to-[#00D5DF] flex items-center justify-center text-white font-bold shadow-lg shadow-[#007A80]/20">
              {user.avatar || user.name?.charAt(0)?.toUpperCase()}
            </div>

            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0F172A]" />
          </div>

          {/* Name / email */}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[#134E52] dark:text-white truncate">
              {user.name}
            </p>

            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
              {user.email}
            </p>

            {/* Role badge */}
            <div className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full bg-[#DDF7F8] dark:bg-[#12383D]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008C94] mr-1.5" />

              <span className="text-[10px] font-semibold text-[#007A80] dark:text-teal-300 capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── Menu ───────── */}
      <div className="p-2.5">
        {/* Profile */}
        <Link
          href="/dashboard/profile"
          onClick={() => setIsUserMenuOpen(false)}
          className="
            group flex items-center gap-3
            w-full px-3 py-2.5
            rounded-xl
            text-sm
            text-[#274E52] dark:text-zinc-300
            hover:bg-[#EAFBFC] dark:hover:bg-[#13232A]
            transition-all duration-200
          "
        >
          <div className="w-9 h-9 rounded-xl bg-[#E7F8F9] dark:bg-[#12363B] flex items-center justify-center group-hover:bg-[#D4F3F5] dark:group-hover:bg-[#17454B] transition-colors">
            <User className="w-4 h-4 text-[#007A80]" />
          </div>

          <div className="flex-1">
            <p className="font-medium">Mon profil</p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500">
              Gérer mes informations
            </p>
          </div>

          <ChevronRight
            className="
              w-4 h-4
              text-gray-300
              group-hover:text-[#007A80]
              group-hover:translate-x-0.5
              transition-all
            "
          />
        </Link>

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          onClick={() => setIsUserMenuOpen(false)}
          className="
            group flex items-center gap-3
            w-full px-3 py-2.5
            rounded-xl
            text-sm
            text-[#274E52] dark:text-zinc-300
            hover:bg-[#EAFBFC] dark:hover:bg-[#13232A]
            transition-all duration-200
          "
        >
          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-zinc-700 transition-colors">
            <Settings className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
          </div>

          <div className="flex-1">
            <p className="font-medium">Paramètres</p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500">
              Préférences du compte
            </p>
          </div>

          <ChevronRight
            className="
              w-4 h-4
              text-gray-300
              group-hover:text-[#007A80]
              group-hover:translate-x-0.5
              transition-all
            "
          />
        </Link>

       

        {/* Separator */}
        <div className="my-2.5 border-t border-gray-100 dark:border-zinc-800" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
            group flex items-center gap-3
            w-full px-3 py-2.5
            rounded-xl
            text-sm
            text-red-500
            hover:bg-red-50
            dark:hover:bg-red-950/30
            transition-all duration-200
          "
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-950/50 transition-colors">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>

          <div className="flex-1 text-left">
            <p className="font-semibold">Déconnexion</p>
            <p className="text-[10px] text-red-400 dark:text-red-500/70">
              Quitter votre session
            </p>
          </div>
        </button>
      </div>

      {/* ───────── Footer ───────── */}
      <div className="px-4 py-3 bg-gray-50/80 dark:bg-[#0B1220] border-t border-gray-100 dark:border-zinc-800">
        <p className="text-[10px] text-center text-gray-400 dark:text-zinc-600">
          Votre compte est sécurisé
        </p>
      </div>
    </div>
  )}
</div>

              {/* MOBILE MENU */}
              <button
                className="md:hidden p-2 rounded-xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 p-6 md:p-8 relative z-10">
        {children}
      </main>

    </div>
  );
}
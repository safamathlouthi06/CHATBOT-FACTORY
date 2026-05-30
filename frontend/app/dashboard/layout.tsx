"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const pathname = usePathname() || "";

  const [user, setUser] = useState({
    name: "Chargement...",
    email: "",
    
    plan: "Pro",
    avatar: "...",
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    const fetchEntreprise = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res=await fetch("http://127.0.0.1:8000/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const finalName = data?.nomentreprise ?? "Entreprise inconnue";

        setUser({
          name: finalName,
          email: data?.email || "",
         
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

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/chatbots", label: "Chatbots", icon: Bot },
    { href: "/dashboard/stats", label: "Statistiques", icon: BarChart3 },
    { href: "/dashboard/employes", label: "Employes", icon: FileText },
    
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
                  pathname === item.href ||
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

            {/* RIGHT */}
            <div className="flex items-center gap-2">

              {/* USER MENU */}
              <div className="relative">

                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-[#E8FAFB] dark:hover:bg-[#111827] transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007A80] to-[#00D5DF] flex items-center justify-center text-white text-sm font-bold">
                    {user.avatar}
                  </div>

                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-[#134E52] dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#6CAFB4] dark:text-zinc-400">
                      {user.role}
                    </p>
                  </div>

                  <ChevronDown className="hidden lg:block w-4 h-4 text-[#6CAFB4]" />
                </button>

                {/* DROPDOWN */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />

                    <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-[#D7F3F5] dark:border-[#1E293B] overflow-hidden z-20">

                      <div className="p-4 border-b">
                        <p className="font-bold">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                      <div className="p-2">

                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-gray-100">
                          <User className="w-4 h-4" />
                          Mon profil
                        </button>

                        <Link
                          href="/dashboard/settings"
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl hover:bg-gray-100"
                        >
                          <Settings className="w-4 h-4" />
                          Paramètres
                        </Link>

                        <hr className="my-2" />

                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl text-red-500 hover:bg-red-50">
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>

                      </div>
                    </div>
                  </>
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
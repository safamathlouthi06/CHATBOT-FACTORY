"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Bot,
  BarChart3,
  Users,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LifeBuoy,
  Sparkles
} from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const pathname = usePathname() || "";

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // fake user (à remplacer plus tard par API)
  const user = {
    name: "Jean Dupont",
    role: "admin",
    plan: "pro",
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/chatbots", label: "Chatbots", icon: Bot },
    { href: "/dashboard/stats", label: "Statistiques", icon: BarChart3 },
    { href: "/dashboard/teams", label: "Équipes", icon: Users },
    { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
  ];

  const extraNavItems = [
    { href: "/dashboard/billing", label: "Facturation", icon: CreditCard },
    { href: "/dashboard/docs", label: "Docs", icon: FileText },
    { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-900">

      {/* SIDEBAR */}
      <aside className={`
        fixed md:relative z-40 h-screen
        ${sidebarCollapsed ? "w-20" : "w-72"}
        bg-white dark:bg-zinc-950
        border-r border-zinc-200 dark:border-zinc-800
        transition-all duration-300
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        flex flex-col
      `}>

        {/* LOGO */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>

            {!sidebarCollapsed && (
              <span className="font-bold text-lg">
                ChatBotStudio
              </span>
            )}
          </Link>

          {/* collapse */}
          <button onClick={toggleSidebar} className="hidden md:block">
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>

          {/* mobile close */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden">
            <X />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  transition
                  ${isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}
                `}
              >
                <Icon className="w-5 h-5" />
                {!sidebarCollapsed && item.label}
              </Link>
            );
          })}

          <div className="border-t my-3 border-zinc-200 dark:border-zinc-800" />

          {extraNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Icon className="w-5 h-5" />
                {!sidebarCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-center">
          {!sidebarCollapsed ? (
            <>
              <p>{user.name}</p>
              <p className="text-zinc-500">Plan {user.plan}</p>
            </>
          ) : (
            <Sparkles className="mx-auto" />
          )}
        </div>

      </aside>

      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu />
          </button>

          <h1 className="font-semibold">
            Dashboard
          </h1>

          <div className="hidden md:flex items-center gap-2">
            <Search className="w-4 h-4" />
            <input
              placeholder="Rechercher..."
              className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg text-sm outline-none"
            />
          </div>

        </header>

        {/* CONTENT */}
        <main className="p-6">
          {children}
        </main>

      </div>
    </div>
  );
}
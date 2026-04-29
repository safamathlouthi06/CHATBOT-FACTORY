"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin");

  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">

        {/* NAVBAR PUBLIC */}
        {!isDashboard && !isAuthPage && (
          <nav className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition">
                ChatbotStudio
              </Link>
              <div className="flex gap-3">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Inscription
                </Link>
              </div>
            </div>
          </nav>
        )}

        {/* CONTENT */}
        <main className="flex-1">{children}</main>

        {/* FOOTER PUBLIC */}
        {!isDashboard && !isAuthPage && (
          <footer className="px-6 py-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} ChatbotStudio. Tous droits réservés.
            </div>
          </footer>
        )}

      </body>
    </html>
  );
}
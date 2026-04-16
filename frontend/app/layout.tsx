import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import LoginPage from "./auth/login";
import RegisterPage from "./register/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatBotStudio | Créez votre chatbot IA en quelques minutes",
  description: "Plateforme SaaS de création de chatbots IA sans code. Entraînez, personnalisez et déployez votre assistant virtuel facilement.",
  keywords: "chatbot, IA, intelligence artificielle, SaaS, service client, automatisation",
  authors: [{ name: "ChatBotStudio" }],
  openGraph: {
    title: "ChatBotStudio - Créez votre chatbot IA",
    description: "La plateforme tout-en-un pour créer des chatbots intelligents sans coder",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          {/* Navigation améliorée */}
          <nav className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                  </div>
                  <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ChatBotStudio
                  </span>
                </Link>

                {/* Navigation desktop */}
                <div className="hidden md:flex items-center gap-8">
                  <Link 
                    href="/features" 
                    className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
                  >
                    Fonctionnalités
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
                  >
                    Tarifs
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
                  >
                    À propos
                  </Link>
                  <Link 
                    href="/blog" 
                    className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
                  >
                    Blog
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors px-3 py-2"
                  >
                    Se connecter
                  </Link>

                  <Link href="/register">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium text-sm px-5 py-2 hover:shadow-lg hover:scale-105 transition-all duration-200">
                      Essayer gratuitement
                    </button>
                  </Link>

                  {/* Menu mobile button */}
                  <button className="md:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Contenu principal */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer amélioré */}
          <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Colonne 1 - Logo et description */}
                <div className="col-span-1 md:col-span-2">
                  <Link href="/" className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ChatBotStudio
                    </span>
                  </Link>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 max-w-md">
                    La plateforme tout-en-un pour créer des chatbots IA intelligents sans coder. 
                    Améliorez votre service client 24/7.
                  </p>
                  <div className="flex gap-4">
                    <a href="#" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                      <span className="sr-only">Twitter</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a href="#" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                      <span className="sr-only">GitHub</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a href="#" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Colonne 2 - Liens rapides */}
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Produit</h3>
                  <ul className="space-y-2">
                    <li><Link href="/features" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Fonctionnalités</Link></li>
                    <li><Link href="/pricing" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Tarifs</Link></li>
                    <li><Link href="/demo" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Démo</Link></li>
                    <li><Link href="/integrations" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Intégrations</Link></li>
                  </ul>
                </div>

                {/* Colonne 3 - Support */}
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Support</h3>
                  <ul className="space-y-2">
                    <li><Link href="/help" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Centre d'aide</Link></li>
                    <li><Link href="/contact" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Contact</Link></li>
                    <li><Link href="/privacy" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Confidentialité</Link></li>
                    <li><Link href="/terms" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">Conditions</Link></li>
                  </ul>
                </div>
              </div>

              {/* Copyright */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 mt-8 pt-8 text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  &copy; {new Date().getFullYear()} ChatBotStudio. Tous droits réservés.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
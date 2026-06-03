"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  Bot, 
  ChevronRight,
  Mail,
  Heart,
  Leaf,
  Sparkles,
  Shield,
  Zap
} from "lucide-react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAuthPage =
    pathname === "/login" || 
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  const isDashboard =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin");

  const isEmploye =
    pathname?.startsWith("/employe") ||
    pathname === "/employe/profile" ;

  // Fonction pour scroller vers une section
  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false); // Fermer le menu mobile
    if (pathname !== "/") {
      // Si on n'est pas sur la page d'accueil, rediriger d'abord
      window.location.href = `/#${sectionId}`;
    } else {
      // Sinon scroller directement
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80; // Hauteur de la navbar fixe
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  // Détecter le scroll pour l'effet de navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Gérer le hash dans l'URL au chargement
  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      const sectionId = window.location.hash.slice(1);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 100);
    }
  }, [pathname]);

  const navLinks = [
    { id: "features", label: "Fonctionnalités" },
    { id: "pricing", label: "Tarifs" },
    { id: "about", label: "À propos" },
    { id: "contact", label: "Contact" },
  ];

  const footerLinks = {
    Produit: [
      { label: "Fonctionnalités", href: "/#features", isInternal: true },
      { label: "Tarifs", href: "/#pricing", isInternal: true },
      { label: "API", href: "/api-docs" },
      { label: "Intégrations", href: "/integrations" },
    ],
    Entreprise: [
      { label: "À propos", href: "/#about", isInternal: true },
      { label: "Blog", href: "/blog" },
      { label: "Carrières", href: "/careers" },
      { label: "Presse", href: "/press" },
    ],
    Support: [
      { label: "Centre d'aide", href: "/help" },
      { label: "Contact", href: "/#contact", isInternal: true },
      { label: "Statut", href: "/status" },
      { label: "Documentation", href: "/docs" },
    ],
    Légal: [
      { label: "Confidentialité", href: "/privacy" },
      { label: "Conditions", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
      { label: "Mentions légales", href: "/legal" },
    ],
  };

 
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-[#F0FDFC] via-[#E6F7F5] to-[#DCF5F2] dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        
        {/* Decorative background elements - Insomea colors */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#008080] rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 "></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#00A8A8] rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5  delay-1000"></div>
        </div>

        {/* NAVBAR PUBLIC - INSOMEA STYLE */}
        {!isDashboard && !isAuthPage && !isEmploye &&(
          <>
            <nav 
              className={`
                fixed top-0 w-full z-50 transition-all duration-300
                ${scrolled 
                  ? "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-lg border-b border-[#D0EAE8] dark:border-zinc-800" 
                  : "bg-transparent"
                }
              `}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                      <Bot className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-[#0B3C3C] to-[#008080] bg-clip-text text-transparent dark:from-white dark:to-[#00A8A8]">
                      ChatbotStudio
                    </span>
                  </Link>

                  {/* Desktop Navigation - avec scroll */}
                  <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => scrollToSection(link.id)}
                        className="text-sm font-medium text-[#0B3C3C] dark:text-zinc-300 hover:text-[#008080] dark:hover:text-[#00A8A8] transition-colors cursor-pointer"
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>

                  {/* Desktop Buttons */}
                  <div className="hidden md:flex items-center gap-3">
                    <Link 
                      href="/login" 
                      className="px-4 py-2 text-sm font-medium text-[#0B3C3C] dark:text-zinc-300 hover:text-[#008080] dark:hover:text-white transition"
                    >
                      Connexion
                    </Link>
                    <Link 
                      href="/register" 
                      className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-lg hover:from-[#005F5F] hover:to-[#008080] transition shadow-md hover:shadow-lg"
                    >
                      Inscription gratuite
                    </Link>
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    className="md:hidden p-2 rounded-lg hover:bg-[#E6F7F5] dark:hover:bg-zinc-800 transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    {isMobileMenuOpen ? 
                      <X className="w-5 h-5 text-[#0B3C3C] dark:text-white" /> : 
                      <Menu className="w-5 h-5 text-[#0B3C3C] dark:text-white" />
                    }
                  </button>
                </div>
              </div>

              {/* Mobile Menu - avec scroll */}
              {isMobileMenuOpen && (
                <div className="md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-[#D0EAE8] dark:border-zinc-800">
                  <div className="px-4 py-4 space-y-3">
                    {navLinks.map((link) => (
                      <button
                        key={link.id}
                        onClick={() => scrollToSection(link.id)}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-[#0B3C3C] dark:text-zinc-300 hover:bg-[#E6F7F5] dark:hover:bg-zinc-800 rounded-lg transition"
                      >
                        {link.label}
                      </button>
                    ))}
                    <div className="pt-4 space-y-2 border-t border-[#D0EAE8] dark:border-zinc-800">
                      <Link
                        href="/login"
                        className="block px-3 py-2 text-base font-medium text-[#0B3C3C] dark:text-zinc-300 hover:bg-[#E6F7F5] dark:hover:bg-zinc-800 rounded-lg transition"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/register"
                        className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-lg text-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Inscription gratuite
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* Spacer pour compenser la navbar fixed */}
            <div className="h-16"></div>
          </>
        )}

        {/* CONTENT */}
        <main className="flex-1">{children}</main>

        {/* FOOTER PUBLIC - INSOMEA STYLE */}
        {!isDashboard && !isAuthPage && !isEmploye && (
          <footer className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-[#D0EAE8] dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              
              {/* Footer Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                {Object.entries(footerLinks).map(([category, links]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-[#0B3C3C] dark:text-white mb-4">
                      {category}
                    </h3>
                    <ul className="space-y-2">
                      {links.map((link) => (
                        <li key={link.label}>
                          {link.isInternal ? (
                            <button
                              onClick={() => scrollToSection(link.href.slice(2))}
                              className="text-sm text-[#008080] dark:text-zinc-400 hover:text-[#00A8A8] dark:hover:text-[#00A8A8] transition-colors"
                            >
                              {link.label}
                            </button>
                          ) : (
                            <Link
                              href={link.href}
                              className="text-sm text-[#008080] dark:text-zinc-400 hover:text-[#00A8A8] dark:hover:text-[#00A8A8] transition-colors"
                            >
                              {link.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Newsletter Section */}
              <div className="border-t border-[#D0EAE8] dark:border-zinc-800 pt-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-center md:text-left">
                    <h4 className="font-semibold text-[#0B3C3C] dark:text-white mb-1">
                      Restez informé
                    </h4>
                    <p className="text-sm text-[#008080]">
                      Recevez nos actualités et offres exclusives
                    </p>
                  </div>
                  <div className="flex w-full md:w-auto gap-2">
                    <input
                      type="email"
                      placeholder="Votre email"
                      className="flex-1 md:w-64 px-4 py-2 bg-[#F0FDFC] dark:bg-zinc-800 border border-[#D0EAE8] dark:border-zinc-700 rounded-lg text-sm outline-none focus:border-[#008080] transition-colors"
                    />
                    <button className="px-4 py-2 bg-gradient-to-r from-[#008080] to-[#00A8A8] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                      S'inscrire
                    </button>
                  </div>
                </div>
              </div>

              {/* Social & Copyright */}
              <div className="border-t border-[#D0EAE8] dark:border-zinc-800 pt-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#008080] to-[#00A8A8] flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-[#008080]">
                      © {new Date().getFullYear()} ChatbotStudio. Tous droits réservés.
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-[#008080]">
                    <span>Made with</span>
                    <Heart className="w-3 h-3 text-[#00A8A8] fill-[#00A8A8]" />
                    <span>in France</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        )}

      </body>
    </html>
  );
}
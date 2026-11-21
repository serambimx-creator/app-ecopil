import type { Metadata, Viewport } from "next";
import { Inter, Jost } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import RegistrarSW from "@/components/pwa/RegistrarSW";

// Tipografía oficial de Ecopil: Androgyne (títulos), Futura y Helvetica.
// Futura y Helvetica son de licencia comercial, así que se usan sus equivalentes
// libres (OFL) más cercanos: Jost por Futura e Inter por Helvetica.
const jost = Jost({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jost" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Encuentro de Nodos 2026 · Ecopil MX",
  description: "7º Encuentro Nacional Ecopil MX · Hidalgo, 17–21 dic 2026",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${jost.variable} ${inter.variable}`} suppressHydrationWarning>
      <body
        className={`bg-dark-surface text-foreground antialiased min-h-screen pb-32 app-shell-width mx-auto overflow-x-hidden shadow-2xl border-x border-white/5`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="px-4">
              {children}
            </main>
            <BottomNav />
            <RegistrarSW />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import Header from "@/components/layout/Header";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AccesoProvider } from "@/context/AccesoContext";
import RegistrarSW from "@/components/pwa/RegistrarSW";

// Tipografía oficial de Ecopil: Androgyne (títulos), Futura y Helvetica.
// Futura y Helvetica son de licencia comercial, así que se usan sus equivalentes
// libres (OFL) más cercanos: Jost por Futura e Inter por Helvetica.
// Fuentes autoalojadas: el build no depende de descargar de Google Fonts
const jost = localFont({ src: "./jost.woff2", weight: "100 900", variable: "--font-jost" });
const inter = localFont({ src: "./inter.woff2", weight: "100 900", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "7º Encuentro Nacional de Innovación Social y Liderazgo Ambiental 2026 · Ecopil MX",
  description: "7º Encuentro Nacional de Innovación Social y Liderazgo Ambiental · Hidalgo, 17–21 dic 2026",
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
          <AccesoProvider>
            <Header />
            <main className="px-4">
              {children}
            </main>
            <BottomNav />
            <RegistrarSW />
          </AccesoProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

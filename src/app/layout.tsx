import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import AssistantFab from "@/components/ai/AssistantFab";
import Header from "@/components/layout/Header";

import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "App-Ecopil Organización",
  description: "Plataforma de gestión App-Ecopil",
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
    <html lang="es" suppressHydrationWarning>
      <body
        className={`bg-dark-surface text-foreground antialiased min-h-screen pb-32 max-w-md mx-auto overflow-x-hidden shadow-2xl border-x border-white/5`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Header />
          <main className="p-4">
            {children}
          </main>
          <BottomNav />
          <AssistantFab />
        </AuthProvider>
      </body>
    </html>
  );
}

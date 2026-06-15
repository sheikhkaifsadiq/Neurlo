import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Neurlo — AI that thinks before you ask", template: "%s | Neurlo" },
  description: "AI-powered workflow intelligence. Connect your tools, let Neurlo learn, and watch it predict your next 10 moves.",
  keywords: ["AI", "productivity", "workflow automation", "SaaS", "artificial intelligence"],
  authors: [{ name: "Neurlo, Inc." }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://neurlo.tech"),
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Neurlo — AI that thinks before you ask",
    description: "AI-powered workflow intelligence.",
    siteName: "Neurlo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Neurlo",
    description: "AI-powered workflow intelligence.",
    creator: "@neurlo",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#040408",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="overflow-x-hidden" suppressHydrationWarning>
        <SessionProvider session={session}>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}

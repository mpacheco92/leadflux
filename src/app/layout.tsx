import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadFlux | CRM TECH",
  description: "CRM TECH de Conversão WhatsApp e Atribuição Meta Ads",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${dmSans.className} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}

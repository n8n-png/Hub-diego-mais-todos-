import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hub MaisTODOS",
    template: "%s · Hub MaisTODOS",
  },
  description:
    "Plataforma interna da MaisTODOS: conhecimento operacional de todos os times e atendimento ao filiado em uma tela só.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${lexend.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

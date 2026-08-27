import type { Metadata } from "next";
import { Prata } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AppDataProvider } from "@/components/providers/app-data-provider";
import { TooltipProvider } from "@/components/ui/atoms/tooltip";
import { AppShell } from "@/components/shell/app-shell";

const cabinetGrotesk = localFont({
  src: "./fonts/CabinetGrotesk-Variable.woff2",
  variable: "--font-cabinet-grotesk",
  weight: "100 900",
});

const prata = Prata({
  variable: "--font-prata",
  weight: "400",
  subsets: ["latin"],
});

const benedict = localFont({
  src: "./fonts/Benedict-Regular.otf",
  variable: "--font-benedict",
});

export const metadata: Metadata = {
  title: "Point de vente — Beauty and Co",
  description: "Plateforme de point de vente Beauty and Co.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${cabinetGrotesk.variable} ${prata.variable} ${benedict.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppDataProvider>
          <TooltipProvider>
            <AppShell>{children}</AppShell>
          </TooltipProvider>
        </AppDataProvider>
      </body>
    </html>
  );
}

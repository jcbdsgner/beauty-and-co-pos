import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppDataProvider } from "@/components/providers/app-data-provider";
import { TooltipProvider } from "@/components/ui/atoms/tooltip";
import { AppShell } from "@/components/shell/app-shell";

const outfit = localFont({
  src: "./fonts/Outfit-Variable.woff2",
  variable: "--font-outfit",
  weight: "100 900",
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
      className={`${outfit.variable} ${benedict.variable} h-full antialiased`}
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

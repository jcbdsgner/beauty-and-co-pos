import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppDataProvider } from "@/components/providers/app-data-provider";
import { TooltipProvider } from "@/components/ui/atoms/tooltip";
import { AppShell } from "@/components/shell/app-shell";

const poppins = localFont({
  src: [
    { path: "./fonts/Poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Poppins-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
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
      className={`${poppins.variable} h-full antialiased`}
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

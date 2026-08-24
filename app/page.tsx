import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <Logo size="header" className="h-16 w-auto" />
      <h1 className="font-[var(--font-heading)] text-3xl text-[var(--color-gray-900)]">
        Point de vente
      </h1>
      <p className="max-w-md text-[var(--color-gray-500)]">
        Base du projet en place — écrans de caisse, catalogue et back-office restent à concevoir.
      </p>
    </main>
  );
}

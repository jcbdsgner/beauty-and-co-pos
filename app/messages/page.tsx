import { MessagesView } from "@/components/messages/messages-view";

/**
 * Messages — la messagerie cliente (ADR 0011). Layout maître-détail : inbox à gauche, fil à
 * droite. Pas d'en-tête de section : l'inbox parle d'elle-même. Sélection portée par `?client=`
 * pour que « Voir les échanges » de la Fiche cliente ouvre le bon fil.
 */
export default function MessagesPage() {
  // Fill the work area: cancel the shell's `py-8` gutter (-my-8) and subtract the docked
  // Comptoir bar (~76–85px depending on its state) so the composer never hides behind it.
  return (
    <div className="-my-8 h-[calc(100dvh-5.5rem)] pt-6">
      <MessagesView />
    </div>
  );
}

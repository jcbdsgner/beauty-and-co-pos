import Image from "next/image";
import { Banknote, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMode } from "@/lib/data/types";

/**
 * The four payment rails of the counter, in tile order. Carte and Espèces are drawn as big line
 * icons, Wave and Orange Money carry their own brand mark; every mode keeps its word label under
 * the glyph so a tile never relies on recognising a logo. `hint` is what the receptionist checks
 * before confirming.
 */
export const PAYMENT_MODES: {
  value: PaymentMode;
  label: string;
  hint: string;
  logo?: { src: string; width: number; height: number };
}[] = [
  { value: "carte", label: "Carte", hint: "Passez la carte sur le terminal, attendez le ticket « accepté »." },
  { value: "especes", label: "Espèces", hint: "Saisissez ce que la cliente vous remet — le rendu s'affiche." },
  { value: "wave", label: "Wave", hint: "Vérifiez la réception sur le téléphone du salon.", logo: { src: "/images/payment/wave.png", width: 512, height: 506 } },
  { value: "orange_money", label: "Orange Money", hint: "Vérifiez la réception sur le téléphone du salon.", logo: { src: "/images/payment/orange-money.png", width: 512, height: 343 } },
];

export const PAYMENT_MODE_LABEL: Record<PaymentMode, string> = {
  carte: "Carte",
  especes: "Espèces",
  wave: "Wave",
  orange_money: "Orange Money",
};

/** A mode's glyph at any size: the line icon for Carte / Espèces, the brand mark otherwise. */
export function PaymentModeGlyph({ mode, className }: { mode: PaymentMode; className?: string }) {
  const meta = PAYMENT_MODES.find((m) => m.value === mode)!;
  if (meta.logo) {
    return (
      <Image
        src={meta.logo.src}
        alt=""
        width={meta.logo.width}
        height={meta.logo.height}
        className={cn("w-auto object-contain", className)}
      />
    );
  }
  const Icon = mode === "carte" ? CreditCard : Banknote;
  return <Icon aria-hidden strokeWidth={1.5} className={className} />;
}

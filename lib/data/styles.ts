import type { Style } from "@/lib/data/types";

export const STYLES: Style[] = [
  { id: "sty-1", category: "coiffure", name: "Closure Behind The Hair Line", price: 74900, trending: true },
  { id: "sty-2", category: "coiffure", name: "Knotless Braids", price: 69000, trending: true },
  { id: "sty-3", category: "coiffure", name: "Silk Press", price: 79000, trending: false },
  { id: "sty-4", category: "coiffure", name: "Coiffure Mariée", price: 89000, trending: false },
  { id: "sty-5", category: "ongles", name: "Finition Cat Eye / Chrome / Baby Boomer", price: 10000, trending: true },
  { id: "sty-6", category: "ongles", name: "Perfect Manucure Russe", price: 43000, trending: false },
  { id: "sty-7", category: "soin-visage", name: "Hydrafacial signature", price: 55000, trending: true },
  { id: "sty-8", category: "massage", name: "Massage duo relaxant", price: 60000, trending: false },
];

export function styleById(id: string) {
  return STYLES.find((s) => s.id === id);
}

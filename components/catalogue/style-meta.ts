import { Scissors, Gem, Sparkles, Waves } from "lucide-react";
import type { StyleCategory } from "@/lib/data/types";

export const STYLE_CATEGORY_LABEL: Record<StyleCategory, string> = {
  coiffure: "Coiffure",
  ongles: "Ongles",
  "soin-visage": "Soin visage",
  massage: "Massage",
};

export const STYLE_ICON: Record<StyleCategory, typeof Scissors> = {
  coiffure: Scissors,
  ongles: Gem,
  "soin-visage": Sparkles,
  massage: Waves,
};

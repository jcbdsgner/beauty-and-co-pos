import type { ClientTier } from "@/lib/data/types";

export type Tier = Exclude<ClientTier, null>;

/** Libellés des paliers de fidélité, du plus bas au plus haut. */
export const TIER_LABEL: Record<Tier, string> = {
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  vip: "VIP",
};

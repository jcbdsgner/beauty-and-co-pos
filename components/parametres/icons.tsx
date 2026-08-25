import { cn } from "@/lib/utils";
import { Clock, Folder, Globe, Lightbulb, Package, Sparkles, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";

type IconProps = { className?: string };

/** Small icon set specific to the Parametres module (produits, services, conseils beauté) — kept local per module conventions. */

export function SparkleIcon({ className }: IconProps) {
  return <Sparkles className={cn("size-5", className)} />;
}

export function ProductIcon({ className }: IconProps) {
  return <Package className={cn("size-5", className)} />;
}

export function TrendingUpIcon({ className }: IconProps) {
  return <TrendingUp className={cn("size-3.5", className)} />;
}

export function TrendingDownIcon({ className }: IconProps) {
  return <TrendingDown className={cn("size-3.5", className)} />;
}

export function GlobeIcon({ className }: IconProps) {
  return <Globe className={cn("size-3.5", className)} />;
}

export function FolderIcon({ className }: IconProps) {
  return <Folder className={cn("size-4", className)} />;
}

export function AlertTriangleIcon({ className }: IconProps) {
  return <TriangleAlert className={cn("size-4", className)} />;
}

export function LightbulbIcon({ className }: IconProps) {
  return <Lightbulb className={cn("size-5", className)} />;
}

export function ClockIcon({ className }: IconProps) {
  return <Clock className={cn("size-4", className)} />;
}

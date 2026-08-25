import { cn } from "@/lib/utils";
import {
  TriangleAlert,
  Package,
  Send,
  FileText,
  Clock,
  Hourglass,
  Building2,
  Store,
  Droplet,
  MessageSquare,
  Warehouse,
} from "lucide-react";

type IconProps = { className?: string };

/** Small icon set specific to the Stock module (not in the shared icon set — kept local per module conventions). */

export function AlertTriangleIcon({ className }: IconProps) {
  return <TriangleAlert className={cn("size-5", className)} />;
}

export function BoxIcon({ className }: IconProps) {
  return <Package className={cn("size-4", className)} />;
}

export function PaperPlaneIcon({ className }: IconProps) {
  return <Send className={cn("size-4", className)} />;
}

export function DocumentIcon({ className }: IconProps) {
  return <FileText className={cn("size-4", className)} />;
}

export function ClockIcon({ className }: IconProps) {
  return <Clock className={cn("size-4", className)} />;
}

export function HourglassIcon({ className }: IconProps) {
  return <Hourglass className={cn("size-4", className)} />;
}

export function BuildingIcon({ className }: IconProps) {
  return <Building2 className={cn("size-4", className)} />;
}

export function StoreIcon({ className }: IconProps) {
  return <Store className={cn("size-4", className)} />;
}

export function DropIcon({ className }: IconProps) {
  return <Droplet className={cn("size-4", className)} />;
}

export function CommentIcon({ className }: IconProps) {
  return <MessageSquare className={cn("size-4", className)} />;
}

export function WarehouseIcon({ className }: IconProps) {
  return <Warehouse className={cn("size-12", className)} />;
}

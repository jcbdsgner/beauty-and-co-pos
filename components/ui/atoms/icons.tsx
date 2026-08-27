import { cn } from "@/lib/utils";
import { House, Calendar, Users, HeartPulse, Tag, ShoppingBag, Settings, LogOut, Bell, ChevronRight, Plus, Trash2, Pencil, Check, X } from "lucide-react";

type IconProps = { className?: string };

/** Small set of generic outline icons reused across modules (nav, headers, empty states). Prefer these over one-off inline SVGs when the shape already exists here. */

export function HomeIcon({ className }: IconProps) {
  return <House className={cn("size-5", className)} />;
}

export function CalendarIcon({ className }: IconProps) {
  return <Calendar className={cn("size-5", className)} />;
}

export function PeopleIcon({ className }: IconProps) {
  return <Users className={cn("size-5", className)} />;
}

export function HeartPulseIcon({ className }: IconProps) {
  return <HeartPulse className={cn("size-5", className)} />;
}

export function TagHeartIcon({ className }: IconProps) {
  return <Tag className={cn("size-5", className)} />;
}

export function BagIcon({ className }: IconProps) {
  return <ShoppingBag className={cn("size-5", className)} />;
}

export function GearIcon({ className }: IconProps) {
  return <Settings className={cn("size-5", className)} />;
}

export function LogoutIcon({ className }: IconProps) {
  return <LogOut className={cn("size-5", className)} />;
}

export function BellIcon({ className }: IconProps) {
  return <Bell className={cn("size-5", className)} />;
}

export function ChevronIcon({ className }: IconProps) {
  return <ChevronRight className={cn("size-4", className)} />;
}

export function PlusIcon({ className }: IconProps) {
  return <Plus className={cn("size-4", className)} />;
}

export function TrashIcon({ className }: IconProps) {
  return <Trash2 className={cn("size-4", className)} />;
}

export function PencilIcon({ className }: IconProps) {
  return <Pencil className={cn("size-4", className)} />;
}

export function CheckIcon({ className }: IconProps) {
  return <Check className={cn("size-4", className)} />;
}

export function XIcon({ className }: IconProps) {
  return <X className={cn("size-4", className)} />;
}

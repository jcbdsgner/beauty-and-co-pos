import { Avatar } from "@/components/ui/avatar";
import { BellIcon } from "@/components/ui/icons";

/** Top-right identity row (avatar + role + name + notifications) used on dashboard-style pages that don't use PageHeader. */
export function Topbar() {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        aria-label="Notifications"
        className="flex size-9 items-center justify-center rounded-full text-[var(--color-gray-500)] hover:bg-[var(--color-gray-100)]"
      >
        <BellIcon />
      </button>
      <Avatar
        initial="PE"
        size={36}
        className="border-2 border-[var(--brand-taupe-muted)] bg-[var(--brand-rose-soft)] font-semibold text-[var(--brand-taupe-muted)]"
      />
      <div className="text-sm">
        <p className="text-[11px] font-semibold tracking-wide text-[var(--color-gray-400)] uppercase">Admin</p>
        <p className="font-semibold text-[var(--color-gray-900)]">Proprietaire Elite</p>
      </div>
    </div>
  );
}

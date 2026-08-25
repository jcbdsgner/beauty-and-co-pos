import { BellIcon } from "@/components/ui/icons";

/** Top-right notification affordance used on dashboard-style pages that don't use PageHeader.
 *  Identity (avatar + role + name) already lives permanently in the sidebar footer — no need
 *  to repeat it here. */
export function Topbar() {
  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        aria-label="Notifications"
        className="flex size-9 items-center justify-center rounded-full text-[var(--color-gray-500)] hover:bg-[var(--color-gray-100)]"
      >
        <BellIcon />
      </button>
    </div>
  );
}

import { Bell, Search, ChevronDown } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/90 px-5 backdrop-blur sm:px-6">
      {/* Search */}
      <div className="hidden w-full max-w-md md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="search"
            placeholder="Search products, suppliers, or transactions..."
            className="h-9 w-full rounded-lg border bg-background/80 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
            aria-label="Search products, suppliers, or transactions"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted/60"
          aria-label="Open account menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            N
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium">Nadia</p>

            <p className="text-[11px] text-muted-foreground">Business Owner</p>
          </div>

          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </button>
      </div>
    </header>
  );
}

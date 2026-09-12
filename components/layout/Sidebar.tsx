"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Boxes,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Settings,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

const navigation = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Boxes },
  { title: "Suppliers", href: "/suppliers", icon: Truck },
  { title: "Transactions", href: "/transactions", icon: ShoppingCart },
  { title: "Analysis", href: "/analysis", icon: BarChart3 },
  { title: "Insights", href: "/insights", icon: Lightbulb },
  { title: "Alerts", href: "/alerts", icon: Bell },
  { title: "Reports", href: "/reports", icon: FileText },
];

export function Sidebar({ alertCount }: { alertCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/dashboard" className="group">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>

            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                Margin Intelligence
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Business analytics
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />

              <span>{item.title}</span>

              {item.title === "Alerts" && alertCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive/10 px-1.5 text-[10px] font-semibold text-destructive">
                  {alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t p-3">
        <Link
          href="/settings"
          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4 group-hover:text-foreground" />
          <span>Settings</span>
        </Link>

        <div className="mt-3 rounded-lg bg-muted/60 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              N
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">Nadia</p>
              <p className="truncate text-[11px] text-muted-foreground">
                Business Owner
              </p>
            </div>
          </div>

          <div className="mt-3 border-t pt-3">
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}

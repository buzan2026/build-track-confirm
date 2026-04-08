import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Truck,
  FileText,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Package, label: "Products", path: "/products" },
  { icon: ShoppingCart, label: "Cart", path: "/cart" },
  { icon: ClipboardList, label: "Orders", path: "/" },
  { icon: Truck, label: "Delivery Today", path: "/delivery-today" },
  { icon: FileText, label: "Quotes", path: "/quotes" },
  { icon: User, label: "Account", path: "/account" },
];

export default function LeftSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sticky top-14 flex h-[calc(100vh-3.5rem)] w-14 flex-col items-center border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] py-3 gap-1">
      {navItems.map((item) => {
        const isActive =
          item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            title={item.label}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-[var(--border-radius-sm)] transition-colors",
              isActive
                ? "bg-[var(--color-rexel-primary-10)] text-[var(--color-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-layer-01)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <item.icon className="h-5 w-5" />
          </button>
        );
      })}
    </aside>
  );
}

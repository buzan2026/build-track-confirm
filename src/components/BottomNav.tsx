import { ClipboardList, FileText, Package } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: ClipboardList, label: "Commandes" },
  { path: "/reception", icon: Package, label: "Réception" },
  { path: "/documents", icon: FileText, label: "Documents" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path || 
            (tab.path !== "/" && location.pathname.startsWith(tab.path));
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { Link } from "react-router-dom";
import { Zap, Phone, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartDrawer } from "./CartDrawer";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      {/* Top bar */}
      <div className="bg-foreground">
        <div className="container flex items-center justify-between py-1.5 text-xs text-primary-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> 01 23 45 67 89</span>
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> pro@elecdistrib.fr</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Livraison express chantier</span>
            <span>•</span>
            <span>Devis sous 24h</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container flex items-center justify-between gap-8 py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-display text-xl font-bold text-foreground">ElecDistrib</span>
            <span className="block text-[10px] leading-none text-muted-foreground tracking-wide">MATÉRIEL ÉLECTRIQUE PRO</span>
          </div>
        </Link>

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un produit, une référence..." className="pl-10 bg-background" />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" size="sm" asChild><Link to="/orders">Mes commandes</Link></Button>
          <CartDrawer />
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-border">
        <nav className="container flex items-center gap-1 py-0">
          {["Câblage", "Appareillage", "Tableaux", "Éclairage", "Outillage", "VDI / Réseau", "Promotions"].map((cat) => (
            <button
              key={cat}
              className="px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
            >
              {cat}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

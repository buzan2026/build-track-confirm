import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground tracking-tight">ElecDistrib</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Votre partenaire matériel électrique professionnel. Livraison express sur chantier partout en France.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Catalogue</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Câblage</li>
              <li>Appareillage</li>
              <li>Tableaux électriques</li>
              <li>Éclairage</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Devis en ligne</li>
              <li>Livraison chantier</li>
              <li>Compte professionnel</li>
              <li>Programme fidélité</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>01 23 45 67 89</li>
              <li>pro@elecdistrib.fr</li>
              <li>Lun-Ven 7h-18h</li>
              <li>Sam 8h-12h</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 ElecDistrib — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}

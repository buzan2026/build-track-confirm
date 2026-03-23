import { Button } from "@/components/ui/button";
import { Truck, Shield, Clock, Users } from "lucide-react";

export default function HeroSection() {
  return (
    <section>
      {/* Hero */}
      <div className="bg-foreground">
        <div className="container py-16">
          <div className="max-w-2xl">
            <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight text-primary-foreground mb-4">
              Matériel électrique professionnel, livré sur chantier
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 leading-relaxed">
              Câbles, appareillage, tableaux, éclairage — tout le matériel pour vos chantiers. 
              Prix pros, stock disponible, livraison express.
            </p>
            <div className="flex gap-3">
              <Button size="lg" className="font-semibold">Voir le catalogue</Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
                Demander un devis
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-b border-border bg-card">
        <div className="container py-5">
          <div className="grid grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Livraison chantier", desc: "Express J+1 partout en France" },
              { icon: Shield, title: "Qualité garantie", desc: "Marques certifiées NF / CE" },
              { icon: Clock, title: "Devis sous 24h", desc: "Réponse rapide sur mesure" },
              { icon: Users, title: "Pros & entreprises", desc: "Tarifs dégressifs, compte dédié" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <item.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

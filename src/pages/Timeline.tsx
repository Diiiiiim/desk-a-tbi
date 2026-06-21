/**
 * Page Timeline — Ligne du temps de la journée
 * Affiche les moments de la journée sous forme de ligne horizontale.
 * Le moment actuel est mis en évidence en très grand, toujours centré
 * automatiquement à l'écran (même si l'heure change pendant l'affichage).
 */
import { useEffect, useRef, useState } from "react";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import { useData } from "@/contexts/DataContext";

function heureEnMinutes(heure: string): number {
  const [h, m] = heure.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default function Timeline() {
  const { data } = useData();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const [nowMinutes, setNowMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  // Rafraîchir l'heure actuelle chaque minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNowMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const moments = [...data.timeline].sort((a, b) => heureEnMinutes(a.heure) - heureEnMinutes(b.heure));

  // Déterminer le moment actuel : le dernier dont l'heure est <= maintenant
  let activeIndex = -1;
  for (let i = 0; i < moments.length; i++) {
    if (heureEnMinutes(moments[i].heure) <= nowMinutes) activeIndex = i;
  }

  // Centrer automatiquement le moment actif — à l'ouverture ET chaque fois
  // que l'heure change (changement de moment actif), pour qu'il reste
  // toujours visible et bien au centre sans action de l'utilisateur.
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const scrollTo = el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2;
      container.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moments.length, activeIndex]);

  const heureActuelle = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "oklch(0.13 0.04 240)",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "oklch(0.10 0.04 240 / 0.10)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <KiosqueHeader title="🕐 Ma journée" showBack />

        <main
          className="page-enter"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            gap: "1.5rem",
            overflow: "hidden",
          }}
        >
          {/* Heure actuelle */}
          <div
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              color: "#FFD600",
            }}
          >
            🕐 {heureActuelle}
          </div>

          {moments.length === 0 ? (
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 600,
                fontSize: "1.3rem",
                color: "oklch(0.55 0.02 240)",
                textAlign: "center",
              }}
            >
              Aucun moment configuré. Ajoutez-en dans Administration → Paramètres.
            </div>
          ) : (
            <div
              ref={scrollRef}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                width: "100%",
                overflowX: "hidden",
                padding: "1rem 0",
                position: "relative",
                flex: 1,
              }}
            >
              {/* Ligne horizontale continue */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "4vw",
                  right: "4vw",
                  height: 6,
                  background: "oklch(0.30 0.04 240)",
                  borderRadius: 3,
                  zIndex: 0,
                  transform: "translateY(-50%)",
                }}
              />

              {moments.map((m, i) => {
                const isPast = i < activeIndex;
                const isActive = i === activeIndex;
                const isFuture = i > activeIndex;
                const taille = isActive ? 170 : 64;

                return (
                  <div
                    key={m.id}
                    ref={isActive ? activeRef : undefined}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: isActive ? "0.9rem" : "0.4rem",
                      minWidth: isActive ? 220 : 110,
                      flexShrink: 0,
                      position: "relative",
                      zIndex: isActive ? 2 : 1,
                    }}
                  >
                    {/* Pastille emoji */}
                    <div
                      style={{
                        width: taille,
                        height: taille,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isActive ? "4.2rem" : "1.6rem",
                        background: isActive
                          ? "linear-gradient(135deg, #FFD600 0%, #FFC107 100%)"
                          : isPast
                            ? "oklch(0.30 0.06 145)"
                            : "oklch(0.22 0.04 240)",
                        border: isActive ? "6px solid #fff" : "3px solid oklch(0.35 0.04 240)",
                        boxShadow: isActive
                          ? "0 0 0 10px oklch(0.85 0.18 95 / 0.25), 0 16px 40px rgba(255, 214, 0, 0.6)"
                          : "none",
                        transition: "all 250ms ease",
                        opacity: isFuture ? 0.85 : 1,
                      }}
                    >
                      {isPast ? "✅" : m.emoji}
                    </div>

                    {/* Heure */}
                    <div
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 800,
                        fontSize: isActive ? "1.7rem" : "0.9rem",
                        color: isActive ? "#FFD600" : "#fff",
                        transition: "all 250ms ease",
                      }}
                    >
                      {m.heure}
                    </div>

                    {/* Label */}
                    <div
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 700,
                        fontSize: isActive ? "1.5rem" : "0.78rem",
                        color: isActive ? "#fff" : "oklch(0.70 0.02 240)",
                        textAlign: "center",
                        lineHeight: 1.2,
                        maxWidth: isActive ? 220 : 100,
                        transition: "all 250ms ease",
                      }}
                    >
                      {m.label}
                    </div>

                    {isActive && (
                      <div
                        style={{
                          fontFamily: "'Baloo 2', sans-serif",
                          fontWeight: 800,
                          fontSize: "1rem",
                          color: "#0D1B2A",
                          background: "#FFD600",
                          padding: "0.35rem 1.1rem",
                          borderRadius: "1.2rem",
                        }}
                      >
                        ✨ Maintenant
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <CommunicationBar />
      </div>
    </div>
  );
}


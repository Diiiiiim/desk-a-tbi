/**
 * Page Timeline — Ligne du temps de la journée
 * Le moment actuel reste fixe, bien centré sous l'horloge.
 * C'est le ruban entier de moments qui glisse derrière lui au fil
 * de la journée (effet "curseur fixe, ruban qui défile").
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
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const viewportRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

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

  // Calcule le décalage du ruban pour que le centre de la pastille active
  // tombe exactement au centre du viewport — recalculé à chaque changement
  // de moment actif, de taille de fenêtre, ou de liste de moments.
  useEffect(() => {
    function recalcule() {
      const viewport = viewportRef.current;
      const activeEl = itemRefs.current[activeIndex];
      if (!viewport || !activeEl) {
        setOffset(0);
        return;
      }
      const viewportCenter = viewport.clientWidth / 2;
      const activeCenter = activeEl.offsetLeft + activeEl.clientWidth / 2;
      setOffset(viewportCenter - activeCenter);
    }
    recalcule();
    window.addEventListener("resize", recalcule);
    return () => window.removeEventListener("resize", recalcule);
  }, [activeIndex, moments.length]);

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
            gap: "1rem",
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
            /* Viewport fixe : le repère central (pastille active) reste toujours ici */
            <div
              ref={viewportRef}
              style={{
                position: "relative",
                width: "100%",
                flex: 1,
                overflow: "hidden",
              }}
            >
              {/* Ligne horizontale continue, fixe dans le viewport */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: 6,
                  background: "oklch(0.30 0.04 240)",
                  borderRadius: 3,
                  zIndex: 0,
                  transform: "translateY(-50%)",
                }}
              />

              {/* Ruban qui glisse — translaté pour garder l'actif au centre */}
              <div
                ref={trackRef}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  display: "flex",
                  alignItems: "center",
                  transform: `translate(${offset}px, -50%)`,
                  transition: "transform 600ms ease",
                }}
              >
                {moments.map((m, i) => {
                  const isPast = i < activeIndex;
                  const isActive = i === activeIndex;
                  const isFuture = i > activeIndex;
                  const taille = isActive ? 170 : 64;

                  return (
                    <div
                      key={m.id}
                      ref={el => { itemRefs.current[i] = el; }}
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

              {/* Repère central fixe (discret, juste pour le marquage visuel) */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "50%",
                  width: 0,
                  pointerEvents: "none",
                }}
              />
            </div>
          )}
        </main>

        <CommunicationBar />
      </div>
    </div>
  );
}



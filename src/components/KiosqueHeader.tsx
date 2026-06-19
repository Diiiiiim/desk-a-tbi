/**
 * KiosqueHeader — En-tête fixe de la borne
 * Affiche la date du jour (mise à jour automatique), titre, et bouton retour en haut à gauche.
 * Design : fond bleu foncé, date en jaune soleil, titre en blanc
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useData } from "@/contexts/DataContext";

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function formatDate(d: Date): string {
  return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}

interface KiosqueHeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function KiosqueHeader({ title, showBack = false }: KiosqueHeaderProps) {
  const [dateStr, setDateStr] = useState(() => formatDate(new Date()));
  const [, navigate] = useLocation();
  const { data } = useData();

  useEffect(() => {
    // Mise à jour à minuit
    const update = () => setDateStr(formatDate(new Date()));
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => {
      update();
    }, msUntilMidnight);
    return () => clearTimeout(timer);
  }, [dateStr]);

  return (
    <header
      className="kiosque-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        gap: "1rem",
      }}
    >
      {/* Bouton retour — toujours en haut à gauche */}
      <button
        onClick={() => navigate("/")}
        style={{
          background: showBack ? "#1565C0" : "oklch(0.22 0.04 240)",
          border: showBack ? "2px solid #1565C0" : "2px solid oklch(0.35 0.04 240)",
          borderRadius: "0.75rem",
          color: "#fff",
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          padding: "0.5rem 1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
          minWidth: 140,
          transition: "all 120ms ease-out",
        }}
        onPointerDown={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.94)";
        }}
        onPointerUp={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        {showBack ? "← Accueil" : "🏠"}
      </button>

      {/* Titre central */}
      <div style={{ flex: 1, textAlign: "center" }}>
        {title ? (
          <span
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
              color: "#FFD600",
              letterSpacing: "0.02em",
            }}
          >
            {title}
          </span>
        ) : (
          <span
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
              color: "#FFD600",
            }}
          >
            🏠 {data.nomFoyer}
          </span>
        )}
      </div>

      {/* Date */}
      <div
        style={{
          minWidth: 260,
          textAlign: "right",
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(0.95rem, 1.5vw, 1.2rem)",
          color: "oklch(0.85 0.02 240)",
        }}
      >
        📅 {dateStr}
      </div>
    </header>
  );
}

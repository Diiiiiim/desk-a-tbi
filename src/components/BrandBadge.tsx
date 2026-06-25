/**
 * BrandBadge — Petit badge discret "ToBi by Desk-A"
 * Affiché en superposition fixe (coin haut-droit), sur toutes les pages,
 * sans gêner l'usage tactile ni surcharger l'interface.
 */
import ToBiLogo from "@/assets/tobi-logo";

export default function BrandBadge() {
  return (
    <div
      style={{
        position: "fixed",
        top: "0.5rem",
        right: "0.6rem",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        gap: "0.35rem",
        opacity: 0.55,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <ToBiLogo size={15} />
      <span
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: "0.68rem",
          color: "#FFD600",
          letterSpacing: "0.01em",
        }}
      >
        ToBi
      </span>
      <span
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 500,
          fontSize: "0.58rem",
          color: "oklch(0.65 0.02 240)",
        }}
      >
        by Desk-A
      </span>
    </div>
  );
}

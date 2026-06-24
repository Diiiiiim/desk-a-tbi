/**
 * Page de choix — Menu du jour
 * Premier écran après clic sur "Menu du jour" depuis l'accueil.
 * Permet de choisir entre le menu du midi et celui du soir.
 */
import { useLocation } from "wouter";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";

export default function MenuChoix() {
  const [, navigate] = useLocation();

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
        <KiosqueHeader title="🍽️ Menu du jour" showBack />

        <main
          className="page-enter"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2.5rem",
            padding: "2rem",
          }}
        >
          {/* Midi */}
          <button
            onClick={() => navigate("/menu-midi")}
            style={{
              flex: 1,
              maxWidth: 480,
              height: "70vh",
              maxHeight: 520,
              borderRadius: "1.5rem",
              border: "3px solid #2E7D32",
              background: "linear-gradient(160deg, oklch(0.22 0.06 145) 0%, oklch(0.16 0.04 240) 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.2rem",
              cursor: "pointer",
              transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
              boxShadow: "0 8px 24px rgba(46, 125, 50, 0.15)",
            }}
            onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)"; }}
            onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(46, 125, 50, 0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(46, 125, 50, 0.15)"; }}
          >
            <div style={{ fontSize: "5rem" }}>🍽️</div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "2rem", color: "#81C784" }}>
              Midi
            </div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "1.2rem", color: "#fff" }}>
              🕛 12h00
            </div>
          </button>

          {/* Soir */}
          <button
            onClick={() => navigate("/menu-soir")}
            style={{
              flex: 1,
              maxWidth: 480,
              height: "70vh",
              maxHeight: 520,
              borderRadius: "1.5rem",
              border: "3px solid #4A148C",
              background: "linear-gradient(160deg, oklch(0.22 0.06 300) 0%, oklch(0.16 0.04 240) 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.2rem",
              cursor: "pointer",
              transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
              boxShadow: "0 8px 24px rgba(74, 20, 140, 0.15)",
            }}
            onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)"; }}
            onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(74, 20, 140, 0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(74, 20, 140, 0.15)"; }}
          >
            <div style={{ fontSize: "5rem" }}>🌙</div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "2rem", color: "#CE93D8" }}>
              Soir
            </div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "1.2rem", color: "#fff" }}>
              🕖 19h00
            </div>
          </button>
        </main>

        <CommunicationBar />
      </div>
    </div>
  );
}

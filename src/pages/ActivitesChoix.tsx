/**
 * Page de choix — Activités du jour
 * Premier écran après clic sur "Activités du jour" depuis l'accueil.
 * Permet de choisir entre le créneau du matin et celui de l'après-midi.
 */
import { useLocation } from "wouter";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import { useData, getActivitesDuJour } from "@/contexts/DataContext";

export default function ActivitesChoix() {
  const [, navigate] = useLocation();
  const { data } = useData();

  const activitesDuJour = getActivitesDuJour(data.activites);
  const nbMatin = activitesDuJour.filter(a => a.horaire === "matin").length;
  const nbApresMidi = activitesDuJour.filter(a => a.horaire === "apres-midi").length;

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
        <KiosqueHeader title="🎨 Activités du jour" showBack />

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
          {/* Matin */}
          <button
            onClick={() => navigate("/activites/matin")}
            style={{
              flex: 1,
              maxWidth: 480,
              height: "70vh",
              maxHeight: 520,
              borderRadius: "1.5rem",
              border: "3px solid #FFD600",
              background: "linear-gradient(160deg, oklch(0.22 0.06 95) 0%, oklch(0.16 0.04 240) 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.2rem",
              cursor: "pointer",
              transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
              boxShadow: "0 8px 24px rgba(255, 214, 0, 0.15)",
            }}
            onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)"; }}
            onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(255, 214, 0, 0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 214, 0, 0.15)"; }}
          >
            <div style={{ fontSize: "5rem" }}>🌅</div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "2rem", color: "#FFD600" }}>
              Matin
            </div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "1.2rem", color: "#fff" }}>
              🕙 10h – 12h
            </div>
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#0D1B2A",
                background: "#FFD600",
                padding: "0.4rem 1.2rem",
                borderRadius: "1rem",
                marginTop: "0.5rem",
              }}
            >
              {nbMatin} activité{nbMatin !== 1 ? "s" : ""}
            </div>
          </button>

          {/* Après-midi */}
          <button
            onClick={() => navigate("/activites/apres-midi")}
            style={{
              flex: 1,
              maxWidth: 480,
              height: "70vh",
              maxHeight: 520,
              borderRadius: "1.5rem",
              border: "3px solid #4FC3F7",
              background: "linear-gradient(160deg, oklch(0.22 0.06 220) 0%, oklch(0.16 0.04 240) 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.2rem",
              cursor: "pointer",
              transition: "transform 150ms ease-out, box-shadow 150ms ease-out",
              boxShadow: "0 8px 24px rgba(79, 195, 247, 0.15)",
            }}
            onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.96)"; }}
            onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(79, 195, 247, 0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(79, 195, 247, 0.15)"; }}
          >
            <div style={{ fontSize: "5rem" }}>☀️</div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "2rem", color: "#4FC3F7" }}>
              Après-midi
            </div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "1.2rem", color: "#fff" }}>
              🕑 14h – 16h
            </div>
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "#0D1B2A",
                background: "#4FC3F7",
                padding: "0.4rem 1.2rem",
                borderRadius: "1rem",
                marginTop: "0.5rem",
              }}
            >
              {nbApresMidi} activité{nbApresMidi !== 1 ? "s" : ""}
            </div>
          </button>
        </main>

        <CommunicationBar />
      </div>
    </div>
  );
}

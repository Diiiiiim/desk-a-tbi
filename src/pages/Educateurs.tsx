/**
 * Page Éducateurs du jour — Borne Kiosque Éducative
 * Affiche les éducateurs présents avec photo et prénom
 */
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import PhotoCircle from "@/components/PhotoCircle";
import { useData } from "@/contexts/DataContext";

export default function Educateurs() {
  const { data } = useData();
  const presents = data.educateurs.filter(e => e.presentAujourdhui);

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
        <KiosqueHeader title="👥 Éducateurs du jour" showBack />

        <main
          className="page-enter"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            overflow: "hidden",
          }}
        >
          {presents.length === 0 ? (
          <div
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 600,
              fontSize: "1.5rem",
              color: "oklch(0.55 0.02 240)",
              textAlign: "center",
            }}
          >
            Aucun éducateur enregistré comme présent aujourd'hui.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: "1100px",
            }}
          >
            {presents.map(e => (
              <div
                key={e.id}
                className="kiosque-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "2rem 2.5rem",
                  borderLeft: "6px solid #E65100",
                  minWidth: 180,
                }}
              >
                <PhotoCircle
                  photo={e.photo}
                  prenom={e.prenom}
                  size={120}
                  borderColor="#E65100"
                />
                <span
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
                    color: "#fff",
                    textAlign: "center",
                  }}
                >
                  {e.prenom}
                </span>
                <span
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#E65100",
                    background: "#E6510022",
                    border: "1px solid #E65100",
                    borderRadius: "0.5rem",
                    padding: "0.2rem 0.8rem",
                  }}
                >
                  Présent(e) aujourd'hui
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

        <CommunicationBar />
      </div>
    </div>
  );
}

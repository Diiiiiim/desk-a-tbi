/**
 * Page Activités du jour — Borne Kiosque Éducative
 * Affiche 2 blocs : 10h-12h et 14h-16h
 * Chaque bloc affiche TOUTES les activités de ce créneau dans une grille scrollable
 * Clic sur une activité = zoom modal
 */
import { useState } from "react";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import PhotoCircle from "@/components/PhotoCircle";
import { useData, getActivitesDuJour } from "@/contexts/DataContext";
import type { Activite } from "@/contexts/DataContext";

interface ActiviteZoomModalProps {
  activite: Activite;
  color: string;
  onClose: () => void;
}

function ActiviteZoomModal({ activite, color, onClose }: ActiviteZoomModalProps) {
  const { data } = useData();
  const residents = data.residents.filter(r => activite.residentIds.includes(r.id));
  const educateurs = data.educateurs.filter(e => activite.educateurIds.includes(e.id));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="kiosque-card"
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          width: "auto",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          borderLeft: `8px solid ${color}`,
          position: "relative",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "#E53935",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            fontSize: "1.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            transition: "transform 0.2s ease, background 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.background = "#C62828";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "#E53935";
          }}
          title="Fermer"
        >
          ✕
        </button>

        {/* Titre + pictogramme */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", paddingRight: "3rem" }}>
          {activite.pictogramme && (
            <img
              src={activite.pictogramme}
              alt={activite.nom}
              style={{
                width: 120,
                height: 120,
                objectFit: "contain",
                borderRadius: "0.75rem",
                background: "oklch(0.18 0.04 240)",
                padding: "0.5rem",
                flexShrink: 0,
              }}
            />
          )}
          <h2
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              color: "#FFD600",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {activite.nom}
          </h2>
        </div>

        {/* Participants */}
        {residents.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "1.4rem",
                color,
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              👥 Participants ({residents.length})
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {residents.map(r => (
                <div key={r.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <PhotoCircle
                    photo={r.photo}
                    prenom={r.prenom}
                    size={100}
                    borderColor="#FFD600"
                  />
                  <span
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    {r.prenom}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Éducateurs */}
        {educateurs.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "1.4rem",
                color: "#E65100",
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              👨‍🏫 Éducateurs ({educateurs.length})
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {educateurs.map(e => (
                <div key={e.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <PhotoCircle
                    photo={e.photo}
                    prenom={e.prenom}
                    size={100}
                    borderColor="#E65100"
                  />
                  <span
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    {e.prenom}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Styles d'animation */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

function ActiviteBloc({
  horaire,
  label,
  color,
}: {
  horaire: "matin" | "apres-midi";
  label: string;
  color: string;
}) {
  const { data } = useData();
  const [selectedActiviteId, setSelectedActiviteId] = useState<string | null>(null);

  const activites = getActivitesDuJour(data.activites).filter(a => a.horaire === horaire);

  const selectedActivite = activites.find(a => a.id === selectedActiviteId);

  return (
    <>
      <div
        className="kiosque-card"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          borderLeft: `6px solid ${color}`,
          overflow: "hidden",
        }}
      >
        {/* Horaire */}
        <div
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.3rem, 2.2vw, 1.8rem)",
            color,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexShrink: 0,
          }}
        >
          🕙 {label}
        </div>

        {activites.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 600,
              fontSize: "1.2rem",
              color: "oklch(0.55 0.02 240)",
            }}
          >
            Aucune activité programmée
          </div>
        ) : (
          /* Grille scrollable des activités */
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1rem",
              overflowY: "auto",
              paddingRight: "0.5rem",
            }}
          >
            {activites.map(activite => {
              const residents = data.residents.filter(r => activite.residentIds.includes(r.id));
              const educateurs = data.educateurs.filter(e => activite.educateurIds.includes(e.id));

              return (
                <div
                  key={activite.id}
                  onClick={() => setSelectedActiviteId(activite.id)}
                  style={{
                    background: "oklch(0.22 0.04 240)",
                    border: `2px solid ${color}44`,
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    minHeight: 0,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: "scale(1)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${color}44`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.borderColor = `${color}44`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  title="Cliquez pour agrandir"
                >
                  {/* Nom + pictogramme */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {activite.pictogramme && (
                      <img
                        src={activite.pictogramme}
                        alt={activite.nom}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "contain",
                          borderRadius: "0.5rem",
                          background: "oklch(0.18 0.04 240)",
                          padding: "0.2rem",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        color: "#FFD600",
                        lineHeight: 1.2,
                      }}
                    >
                      {activite.nom}
                    </span>
                  </div>

                  {/* Résidents */}
                  {residents.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontFamily: "'Baloo 2', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          color: "oklch(0.65 0.02 240)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "0.3rem",
                        }}
                      >
                        Participants
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {residents.map(r => (
                          <PhotoCircle
                            key={r.id}
                            photo={r.photo}
                            prenom={r.prenom}
                            size={48}
                            borderColor="#FFD600"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Éducateurs */}
                  {educateurs.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontFamily: "'Baloo 2', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          color: "oklch(0.65 0.02 240)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "0.3rem",
                        }}
                      >
                        Éducateurs
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {educateurs.map(e => (
                          <PhotoCircle
                            key={e.id}
                            photo={e.photo}
                            prenom={e.prenom}
                            size={48}
                            borderColor="#E65100"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de zoom */}
      {selectedActivite && (
        <ActiviteZoomModal
          activite={selectedActivite}
          color={color}
          onClose={() => setSelectedActiviteId(null)}
        />
      )}
    </>
  );
}

interface ActivitesProps {
  horaire: "matin" | "apres-midi";
}

export default function Activites({ horaire }: ActivitesProps) {
  const label = horaire === "matin" ? "🌅 Activités du matin" : "☀️ Activités de l'après-midi";
  const color = horaire === "matin" ? "#FFD600" : "#4FC3F7";
  const creneauLabel = horaire === "matin" ? "10h – 12h" : "14h – 16h";

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
        <KiosqueHeader title={label} showBack />

        <main
          className="page-enter"
          style={{
            flex: 1,
            display: "flex",
            padding: "1.5rem",
            overflow: "hidden",
          }}
        >
          <ActiviteBloc horaire={horaire} label={creneauLabel} color={color} />
        </main>

        <CommunicationBar />
      </div>
    </div>
  );
}

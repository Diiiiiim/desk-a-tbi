/**
 * Page Informations — Borne Kiosque Éducative
 * Affiche tous les événements à venir avec date, résidents, éducateurs et photo
 * Clic sur un événement = zoom modal (même comportement que les activités)
 */
import { useState } from "react";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import PhotoCircle from "@/components/PhotoCircle";
import { useData } from "@/contexts/DataContext";
import type { Evenement } from "@/contexts/DataContext";

function formatDateFR(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
}

const EVENT_COLOR = "#9C27B0";

interface EvenementZoomModalProps {
  evenement: Evenement;
  onClose: () => void;
}

function EvenementZoomModal({ evenement, onClose }: EvenementZoomModalProps) {
  const { data } = useData();
  const residents = data.residents.filter(r => evenement.residentIds.includes(r.id));
  const educateurs = data.educateurs.filter(e => evenement.educateurIds.includes(e.id));

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
          borderLeft: `8px solid ${EVENT_COLOR}`,
          position: "relative",
          overflowY: "auto",
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
            flexShrink: 0,
            zIndex: 1,
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

        {/* Photo en grand */}
        {evenement.photo && (
          <img
            src={evenement.photo}
            alt={evenement.titre}
            style={{
              width: "100%",
              maxHeight: "40vh",
              objectFit: "cover",
              borderRadius: "1rem",
            }}
          />
        )}

        {/* Titre */}
        <h2
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            color: "#FFD600",
            margin: 0,
            lineHeight: 1.2,
            paddingRight: "3rem",
          }}
        >
          {evenement.titre}
        </h2>

        {/* Date */}
        <div
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            fontSize: "1.3rem",
            color: EVENT_COLOR,
            background: `${EVENT_COLOR}22`,
            border: `2px solid ${EVENT_COLOR}`,
            borderRadius: "0.75rem",
            padding: "0.6rem 1.2rem",
            display: "inline-block",
            width: "fit-content",
          }}
        >
          📅 {formatDateFR(evenement.date)}
        </div>

        {/* Description */}
        {evenement.description && (
          <p
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 500,
              fontSize: "1.2rem",
              color: "#fff",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {evenement.description}
          </p>
        )}

        {/* Participants */}
        {residents.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "1.4rem",
                color: "#FFD600",
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              👤 Participants ({residents.length})
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {residents.map(r => (
                <div key={r.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <PhotoCircle photo={r.photo} prenom={r.prenom} size={100} borderColor="#FFD600" />
                  <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#fff", textAlign: "center" }}>
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
              👥 Encadrants ({educateurs.length})
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {educateurs.map(e => (
                <div key={e.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <PhotoCircle photo={e.photo} prenom={e.prenom} size={100} borderColor="#E65100" />
                  <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#fff", textAlign: "center" }}>
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
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function Informations() {
  const { data } = useData();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Trier les événements par date
  const evenementsTries = [...data.evenements].sort((a, b) => a.date.localeCompare(b.date));
  const selectedEvent = evenementsTries.find(e => e.id === selectedEventId);

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
        <KiosqueHeader title="ℹ️ Informations & Événements" showBack />

        <main
          className="page-enter"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem",
            gap: "1rem",
            overflow: "hidden",
          }}
        >
          {evenementsTries.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 600,
                fontSize: "1.4rem",
                color: "oklch(0.55 0.02 240)",
                textAlign: "center",
              }}
            >
              Aucun événement programmé pour le moment.
            </div>
          ) : (
            /* Grille scrollable des événements */
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
                overflowY: "auto",
                paddingRight: "0.5rem",
              }}
            >
              {evenementsTries.map(evt => {
                const residents = data.residents.filter(r => evt.residentIds.includes(r.id));
                const educateurs = data.educateurs.filter(e => evt.educateurIds.includes(e.id));

                return (
                  <div
                    key={evt.id}
                    className="kiosque-card"
                    onClick={() => setSelectedEventId(evt.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      borderLeft: `6px solid ${EVENT_COLOR}`,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      transform: "scale(1)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.03)";
                      e.currentTarget.style.boxShadow = `0 4px 12px ${EVENT_COLOR}44`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    title="Cliquez pour agrandir"
                  >
                    {/* Photo */}
                    {evt.photo && (
                      <img
                        src={evt.photo}
                        alt={evt.titre}
                        style={{
                          width: "100%",
                          height: 160,
                          objectFit: "cover",
                          borderRadius: "0.75rem",
                          marginTop: "-0.5rem",
                          marginLeft: "-0.5rem",
                          marginRight: "-0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      />
                    )}

                    {/* Titre */}
                    <div
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 800,
                        fontSize: "1.3rem",
                        color: "#FFD600",
                      }}
                    >
                      {evt.titre}
                    </div>

                    {/* Date */}
                    <div
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: EVENT_COLOR,
                        background: `${EVENT_COLOR}22`,
                        border: `1px solid ${EVENT_COLOR}`,
                        borderRadius: "0.5rem",
                        padding: "0.4rem 0.8rem",
                        display: "inline-block",
                        width: "fit-content",
                      }}
                    >
                      📅 {formatDateFR(evt.date)}
                    </div>

                    {/* Description */}
                    {evt.description && (
                      <p
                        style={{
                          fontFamily: "'Baloo 2', sans-serif",
                          fontWeight: 500,
                          fontSize: "0.95rem",
                          color: "#fff",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {evt.description}
                      </p>
                    )}

                    {/* Résidents */}
                    {residents.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontFamily: "'Baloo 2', sans-serif",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            color: "oklch(0.65 0.02 240)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.4rem",
                          }}
                        >
                          👤 Participants
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {residents.map(r => (
                            <div key={r.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                              <PhotoCircle photo={r.photo} prenom={r.prenom} size={52} borderColor="#FFD600" />
                              <span
                                style={{
                                  fontFamily: "'Baloo 2', sans-serif",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  color: "#fff",
                                  textAlign: "center",
                                  maxWidth: 52,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
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
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            color: "oklch(0.65 0.02 240)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.4rem",
                          }}
                        >
                          👥 Encadrants
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {educateurs.map(e => (
                            <div key={e.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                              <PhotoCircle photo={e.photo} prenom={e.prenom} size={52} borderColor="#E65100" />
                              <span
                                style={{
                                  fontFamily: "'Baloo 2', sans-serif",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  color: "#fff",
                                  textAlign: "center",
                                  maxWidth: 52,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {e.prenom}
                              </span>
                            </div>
                          ))}
                        </div>
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

      {/* Modal de zoom */}
      {selectedEvent && (
        <EvenementZoomModal evenement={selectedEvent} onClose={() => setSelectedEventId(null)} />
      )}
    </div>
  );
}

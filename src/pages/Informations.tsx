/**
 * Page Informations — Borne Kiosque Éducative
 * Affiche tous les événements à venir avec date, résidents, éducateurs et photo
 */
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import PhotoCircle from "@/components/PhotoCircle";
import { useData } from "@/contexts/DataContext";

function formatDateFR(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
}

export default function Informations() {
  const { data } = useData();
  
  // Trier les événements par date
  const evenementsTries = [...data.evenements].sort((a, b) => a.date.localeCompare(b.date));

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
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    borderLeft: "6px solid #9C27B0",
                    overflow: "hidden",
                  }}
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
                      color: "#9C27B0",
                      background: "#9C27B022",
                      border: "1px solid #9C27B0",
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
                          <div
                            key={r.id}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "0.2rem",
                            }}
                          >
                            <PhotoCircle
                              photo={r.photo}
                              prenom={r.prenom}
                              size={52}
                              borderColor="#FFD600"
                            />
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
                          <div
                            key={e.id}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "0.2rem",
                            }}
                          >
                            <PhotoCircle
                              photo={e.photo}
                              prenom={e.prenom}
                              size={52}
                              borderColor="#E65100"
                            />
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
    </div>
  );
}

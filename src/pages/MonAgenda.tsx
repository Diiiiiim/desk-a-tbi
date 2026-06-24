/**
 * Page Mon Agenda — Agenda personnel par résident
 * Accessible depuis l'accueil : on choisit un résident, on voit ses événements
 * personnels (retour en famille, vacances, rendez-vous...) classés par proximité.
 */
import { useState } from "react";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import PhotoCircle from "@/components/PhotoCircle";
import { useData } from "@/contexts/DataContext";
import type { AgendaEvenement } from "@/contexts/DataContext";

function formatDateFR(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
}

function joursRestants(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function EventCard({ ev }: { ev: AgendaEvenement }) {
  const jours = joursRestants(ev.dateDebut);
  const enCours = ev.dateFin && jours <= 0 && joursRestants(ev.dateFin) >= 0;
  const passe = enCours ? false : jours < 0;

  let badge = "";
  if (passe) badge = "Terminé";
  else if (enCours) badge = "En cours";
  else if (jours === 0) badge = "Aujourd'hui !";
  else if (jours === 1) badge = "Demain !";
  else badge = `Dans ${jours} jours`;

  return (
    <div
      className="kiosque-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.2rem",
        borderLeft: `6px solid ${passe ? "oklch(0.40 0.02 240)" : "#FFD600"}`,
        opacity: passe ? 0.6 : 1,
        padding: "1.2rem",
      }}
    >
      <div style={{ fontSize: "2.8rem", flexShrink: 0 }}>{ev.emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#FFD600" }}>
          {ev.titre}
        </div>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#fff", marginTop: "0.2rem" }}>
          📅 {formatDateFR(ev.dateDebut)}
          {ev.dateFin && ev.dateFin !== ev.dateDebut && <> → {formatDateFR(ev.dateFin)}</>}
        </div>
        {ev.description && (
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 500, fontSize: "0.95rem", color: "oklch(0.70 0.02 240)", marginTop: "0.4rem" }}>
            {ev.description}
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: "0.95rem",
          color: passe ? "oklch(0.55 0.02 240)" : "#0D1B2A",
          background: passe ? "oklch(0.25 0.02 240)" : "#FFD600",
          padding: "0.5rem 1rem",
          borderRadius: "1rem",
          flexShrink: 0,
          textAlign: "center",
        }}
      >
        {badge}
      </div>
    </div>
  );
}

export default function MonAgenda() {
  const { data } = useData();
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);

  const selectedResident = data.residents.find(r => r.id === selectedResidentId);
  const evenements = data.agenda
    .filter(a => a.residentId === selectedResidentId)
    .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));

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
        <KiosqueHeader title="🗓️ Mon agenda" showBack />

        <main
          className="page-enter"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem",
            gap: "1.2rem",
            overflow: "hidden",
          }}
        >
          {/* Sélecteur de résident */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              overflowX: "auto",
              paddingBottom: "0.5rem",
              flexShrink: 0,
            }}
          >
            {data.residents.map(r => (
              <div
                key={r.id}
                onClick={() => setSelectedResidentId(r.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  cursor: "pointer",
                  flexShrink: 0,
                  opacity: selectedResidentId && selectedResidentId !== r.id ? 0.5 : 1,
                  transition: "opacity 150ms",
                }}
              >
                <PhotoCircle
                  photo={r.photo}
                  prenom={r.prenom}
                  size={84}
                  borderColor={selectedResidentId === r.id ? "#FFD600" : "oklch(0.40 0.04 240)"}
                />
                <span
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: selectedResidentId === r.id ? "#FFD600" : "#fff",
                  }}
                >
                  {r.prenom}
                </span>
              </div>
            ))}
            {data.residents.length === 0 && (
              <div style={{ color: "oklch(0.55 0.02 240)", fontFamily: "'Baloo 2', sans-serif" }}>
                Aucun résident enregistré.
              </div>
            )}
          </div>

          {/* Contenu */}
          {!selectedResident ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 600,
                fontSize: "1.3rem",
                color: "oklch(0.55 0.02 240)",
                textAlign: "center",
              }}
            >
              👆 Choisissez votre prénom pour voir votre agenda
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                overflowY: "auto",
                paddingRight: "0.5rem",
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.6rem",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                Agenda de {selectedResident.prenom}
              </div>

              {evenements.length === 0 ? (
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
                  Aucun événement programmé pour le moment.
                </div>
              ) : (
                evenements.map(ev => <EventCard key={ev.id} ev={ev} />)
              )}
            </div>
          )}
        </main>

        <CommunicationBar />
      </div>
    </div>
  );
}

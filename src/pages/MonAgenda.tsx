/**
 * Page Mon Espace — Espace personnel par résident
 * Accessible depuis l'accueil : on choisit un résident (grandes photos),
 * puis l'écran se divise en deux colonnes :
 *  - à gauche : Événements (dates, retour en famille, vacances, rendez-vous...)
 *  - à droite : Loisirs / Divertissement (musiques, vidéos préférées, sans date)
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

function getBadgeInfo(ev: AgendaEvenement): { badge: string; passe: boolean } {
  if (!ev.dateDebut) return { badge: "", passe: false };
  const jours = joursRestants(ev.dateDebut);
  const enCours = ev.dateFin && jours <= 0 && joursRestants(ev.dateFin) >= 0;
  const passe = enCours ? false : jours < 0;
  let badge = "";
  if (passe) badge = "Terminé";
  else if (enCours) badge = "En cours";
  else if (jours === 0) badge = "Aujourd'hui !";
  else if (jours === 1) badge = "Demain !";
  else badge = `Dans ${jours} jours`;
  return { badge, passe };
}

// ─── Carte Événement (avec date et badge de proximité) ───────────────────────
function EventCard({ ev, onClick }: { ev: AgendaEvenement; onClick: () => void }) {
  const { badge, passe } = getBadgeInfo(ev);

  return (
    <div
      className="kiosque-card"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        borderLeft: `6px solid ${passe ? "oklch(0.40 0.02 240)" : "#4FC3F7"}`,
        opacity: passe ? 0.6 : 1,
        padding: "1rem",
        cursor: "pointer",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.015)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      title="Cliquez pour agrandir"
    >
      {ev.photoUrl ? (
        <img
          src={ev.photoUrl}
          alt={ev.titre}
          style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "0.65rem", flexShrink: 0 }}
        />
      ) : (
        <div style={{ fontSize: "2.2rem", flexShrink: 0 }}>{ev.emoji}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#4FC3F7" }}>
          {ev.titre} {ev.lienUrl && <span style={{ fontSize: "1rem" }}>🔗</span>}
        </div>
        {ev.dateDebut && (
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#fff", marginTop: "0.15rem" }}>
            📅 {formatDateFR(ev.dateDebut)}
            {ev.dateFin && ev.dateFin !== ev.dateDebut && <> → {formatDateFR(ev.dateFin)}</>}
          </div>
        )}
      </div>
      {badge && (
        <div
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "0.8rem",
            color: passe ? "oklch(0.55 0.02 240)" : "#0D1B2A",
            background: passe ? "oklch(0.25 0.02 240)" : "#4FC3F7",
            padding: "0.4rem 0.7rem",
            borderRadius: "0.8rem",
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

// ─── Carte Loisir (pas de date, plus simple) ──────────────────────────────────
function LoisirCard({ ev, onClick }: { ev: AgendaEvenement; onClick: () => void }) {
  return (
    <div
      className="kiosque-card"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        borderLeft: "6px solid #CE93D8",
        padding: "1rem",
        cursor: "pointer",
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.015)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      title="Cliquez pour agrandir"
    >
      {ev.photoUrl ? (
        <img
          src={ev.photoUrl}
          alt={ev.titre}
          style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "0.65rem", flexShrink: 0 }}
        />
      ) : (
        <div style={{ fontSize: "2.2rem", flexShrink: 0 }}>{ev.emoji}</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#CE93D8" }}>
          {ev.titre} {ev.lienUrl && <span style={{ fontSize: "1rem" }}>🔗</span>}
        </div>
        {ev.description && (
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 500, fontSize: "0.88rem", color: "oklch(0.70 0.02 240)", marginTop: "0.15rem" }}>
            {ev.description}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal de zoom, commun aux deux catégories ────────────────────────────────
function EventZoomModal({ ev, onClose }: { ev: AgendaEvenement; onClose: () => void }) {
  const { badge } = getBadgeInfo(ev);
  const accent = ev.categorie === "evenement" ? "#4FC3F7" : "#CE93D8";

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
          borderLeft: `8px solid ${accent}`,
          position: "relative",
          overflowY: "auto",
          animation: "slideUp 0.3s ease-out",
        }}
        onClick={e => e.stopPropagation()}
      >
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
            zIndex: 1,
          }}
          title="Fermer"
        >
          ✕
        </button>

        {ev.photoUrl ? (
          <img
            src={ev.photoUrl}
            alt={ev.titre}
            style={{ width: "100%", maxHeight: "45vh", objectFit: "cover", borderRadius: "1rem" }}
          />
        ) : (
          <div style={{ fontSize: "5rem", textAlign: "center" }}>{ev.emoji}</div>
        )}

        <h2
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            color: accent,
            margin: 0,
            paddingRight: "3rem",
          }}
        >
          {ev.titre}
        </h2>

        {ev.categorie === "evenement" && ev.dateDebut && (
          <div
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: "1.3rem",
              color: "#0D1B2A",
              background: accent,
              borderRadius: "0.75rem",
              padding: "0.7rem 1.3rem",
              display: "inline-block",
              width: "fit-content",
            }}
          >
            📅 {formatDateFR(ev.dateDebut)}
            {ev.dateFin && ev.dateFin !== ev.dateDebut && <> → {formatDateFR(ev.dateFin)}</>}
            {badge && <>{" · "}{badge}</>}
          </div>
        )}

        {ev.description && (
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
            {ev.description}
          </p>
        )}

        {ev.lienUrl && (
          <a
            href={ev.lienUrl}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "1.3rem",
              color: "#0D1B2A",
              background: accent,
              borderRadius: "1rem",
              padding: "1rem 1.6rem",
              textAlign: "center",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              boxShadow: `0 4px 14px ${accent}66`,
            }}
          >
            {ev.lienLabel || "▶️ Voir / Écouter"}
          </a>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}

export default function MonAgenda() {
  const { data } = useData();
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const selectedResident = data.residents.find(r => r.id === selectedResidentId);
  const itemsResident = data.agenda.filter(a => a.residentId === selectedResidentId);
  const evenements = itemsResident
    .filter(a => a.categorie === "evenement")
    .sort((a, b) => (a.dateDebut || "").localeCompare(b.dateDebut || ""));
  const loisirs = itemsResident
    .filter(a => a.categorie === "loisir")
    .sort((a, b) => a.titre.localeCompare(b.titre));
  const selectedEvent = data.agenda.find(a => a.id === selectedEventId);

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
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
      <div style={{ position: "absolute", inset: 0, background: "oklch(0.10 0.04 240 / 0.10)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <KiosqueHeader title="🗓️ Mon espace" showBack />

        <main
          className="page-enter"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: selectedResidentId ? "flex-start" : "center",
            padding: "1.5rem",
            gap: "1.2rem",
            overflow: "hidden",
          }}
        >
          {/* Sélecteur de résident — grandes photos (x3), se réduit une fois choisi */}
          <div
            className="hide-scrollbar"
            style={{
              display: "flex",
              gap: selectedResidentId ? "1rem" : "1.8rem",
              overflowX: "auto",
              paddingBottom: "0.2rem",
              flexShrink: 0,
              transition: "gap 250ms ease",
            }}
          >
            {data.residents.map(r => {
              const isSelected = selectedResidentId === r.id;
              const tileSize = selectedResidentId ? (isSelected ? 110 : 70) : 252;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedResidentId(r.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    flexShrink: 0,
                    opacity: selectedResidentId && !isSelected ? 0.5 : 1,
                    transition: "opacity 150ms",
                  }}
                >
                  <PhotoCircle
                    photo={r.photo}
                    prenom={r.prenom}
                    size={tileSize}
                    borderColor={isSelected ? "#FFD600" : "oklch(0.40 0.04 240)"}
                  />
                  <span
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 700,
                      fontSize: selectedResidentId ? "1rem" : "1.4rem",
                      color: isSelected ? "#FFD600" : "#fff",
                      transition: "font-size 250ms ease",
                    }}
                  >
                    {r.prenom}
                  </span>
                </div>
              );
            })}
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 600,
                fontSize: "1.3rem",
                color: "oklch(0.55 0.02 240)",
                textAlign: "center",
                padding: "2rem 0",
              }}
            >
              👆 Choisissez votre prénom pour voir votre espace
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.8rem", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                <button
                  onClick={() => setSelectedResidentId(null)}
                  style={{
                    background: "oklch(0.22 0.04 240)",
                    border: "2px solid oklch(0.35 0.04 240)",
                    borderRadius: "0.7rem",
                    color: "#fff",
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    flexShrink: 0,
                    transition: "transform 120ms ease-out",
                  }}
                  onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.94)"; }}
                  onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
                  title="Choisir un autre résident"
                >
                  ← Changer de résident
                </button>
                <div
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    color: "#fff",
                  }}
                >
                  Espace de {selectedResident.prenom}
                </div>
              </div>

              {/* Deux colonnes : Événements à gauche, Loisirs à droite */}
              <div style={{ flex: 1, display: "flex", gap: "1.2rem", overflow: "hidden" }}>
                {/* Colonne Événements */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem", overflow: "hidden" }}>
                  <div
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 800,
                      fontSize: "1.15rem",
                      color: "#4FC3F7",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    📅 Événements
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.7rem", overflowY: "auto", paddingRight: "0.3rem" }}>
                    {evenements.length === 0 ? (
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'Baloo 2', sans-serif",
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "oklch(0.55 0.02 240)",
                          textAlign: "center",
                        }}
                      >
                        Aucun événement programmé.
                      </div>
                    ) : (
                      evenements.map(ev => (
                        <EventCard key={ev.id} ev={ev} onClick={() => setSelectedEventId(ev.id)} />
                      ))
                    )}
                  </div>
                </div>

                {/* Séparateur vertical */}
                <div style={{ width: 2, background: "oklch(0.28 0.04 240)", flexShrink: 0 }} />

                {/* Colonne Loisirs / Divertissement */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem", overflow: "hidden" }}>
                  <div
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 800,
                      fontSize: "1.15rem",
                      color: "#CE93D8",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    🎵 Loisirs & Divertissement
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.7rem", overflowY: "auto", paddingRight: "0.3rem" }}>
                    {loisirs.length === 0 ? (
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'Baloo 2', sans-serif",
                          fontWeight: 600,
                          fontSize: "1rem",
                          color: "oklch(0.55 0.02 240)",
                          textAlign: "center",
                        }}
                      >
                        Aucun loisir enregistré.
                      </div>
                    ) : (
                      loisirs.map(ev => (
                        <LoisirCard key={ev.id} ev={ev} onClick={() => setSelectedEventId(ev.id)} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <CommunicationBar />
      </div>

      {selectedEvent && (
        <EventZoomModal ev={selectedEvent} onClose={() => setSelectedEventId(null)} />
      )}
    </div>
  );
}

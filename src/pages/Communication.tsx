/**
 * Page Communication — Borne Kiosque Éducative
 * Deux sous-onglets : "J'aimerais..." et "J'ai mal..."
 * Synthèse vocale pour les phrases complètes
 * Pictogrammes sur chaque choix
 */
import { useState } from "react";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";

type SubTab = "aimerais" | "mal";

const AIMERAIS_CHOICES = [
  { label: "sortir", emoji: "🚶" },
  { label: "aller dans ma chambre", emoji: "🛏️" },
  { label: "prendre un bain", emoji: "🛁" },
  { label: "regarder la télévision", emoji: "📺" },
  { label: "jouer", emoji: "🎲" },
  { label: "manger", emoji: "🍽️" },
  { label: "boire", emoji: "🥤" },
  { label: "me reposer", emoji: "😴" },
];

const MAL_CHOICES = [
  { label: "à la tête", emoji: "🤕" },
  { label: "au bras", emoji: "💪" },
  { label: "au ventre", emoji: "🤢" },
  { label: "à la jambe", emoji: "🦵" },
  { label: "au dos", emoji: "🙇" },
  { label: "à la main", emoji: "🤚" },
  { label: "au pied", emoji: "🦶" },
  { label: "à la gorge", emoji: "🥵" },
];

function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

export default function Communication() {
  const [activeTab, setActiveTab] = useState<SubTab>("aimerais");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  function handleChoice(choice: { label: string; emoji: string }) {
    setSelectedChoice(choice.label);
    const fullPhrase = activeTab === "aimerais"
      ? `J'aimerais ${choice.label}`
      : `J'ai mal ${choice.label}`;
    speak(fullPhrase);
    setTimeout(() => setSelectedChoice(null), 2000);
  }

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
        <KiosqueHeader title="💬 Communication" showBack />

        {/* Sous-onglets agrandis et centrés */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            padding: "2rem",
            justifyContent: "center",
            borderBottom: "2px solid oklch(0.35 0.04 240)",
          }}
        >
          <button
            onClick={() => setActiveTab("aimerais")}
            style={{
              background: activeTab === "aimerais" ? "#FFD600" : "oklch(0.22 0.04 240)",
              color: activeTab === "aimerais" ? "#0D1B2A" : "#fff",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "1.8rem",
              border: "none",
              borderRadius: "1rem",
              padding: "1.5rem 3rem",
              cursor: "pointer",
              transition: "all 120ms ease-out",
              minWidth: "300px",
              textAlign: "center",
            }}
            onPointerDown={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
            }}
            onPointerUp={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            ✨ J'aimerais...
          </button>
          <button
            onClick={() => setActiveTab("mal")}
            style={{
              background: activeTab === "mal" ? "#FF6B6B" : "oklch(0.22 0.04 240)",
              color: "#fff",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "1.8rem",
              border: "none",
              borderRadius: "1rem",
              padding: "1.5rem 3rem",
              cursor: "pointer",
              transition: "all 120ms ease-out",
              minWidth: "300px",
              textAlign: "center",
            }}
            onPointerDown={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
            }}
            onPointerUp={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            🤕 J'ai mal...
          </button>
        </div>

        {/* Contenu des onglets */}
        <main
          className="page-enter"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            overflow: "auto",
          }}
        >
          {activeTab === "aimerais" ? (
            <div style={{ width: "100%", maxWidth: "1000px" }}>
              <div
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: "2.5rem",
                  color: "#FFD600",
                  marginBottom: "3rem",
                  textAlign: "center",
                }}
              >
                J'aimerais...
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {AIMERAIS_CHOICES.map(choice => (
                  <button
                    key={choice.label}
                    onClick={() => handleChoice(choice)}
                    style={{
                      background: selectedChoice === choice.label
                        ? "linear-gradient(135deg, #FFD600 0%, #FFC107 100%)"
                        : "oklch(0.22 0.04 240)",
                      color: selectedChoice === choice.label ? "#0D1B2A" : "#fff",
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      border: "2px solid oklch(0.35 0.04 240)",
                      borderRadius: "1.2rem",
                      padding: "2rem 1.5rem",
                      cursor: "pointer",
                      transition: "all 120ms ease-out",
                      textTransform: "capitalize",
                      boxShadow: selectedChoice === choice.label
                        ? "0 6px 20px rgba(255, 214, 0, 0.4)"
                        : "0 2px 8px rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.8rem",
                    }}
                    onPointerDown={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
                    }}
                    onPointerUp={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    }}
                  >
                    <span style={{ fontSize: "2.5rem" }}>{choice.emoji}</span>
                    <span>{choice.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: "1000px" }}>
              <div
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: "2.5rem",
                  color: "#FF6B6B",
                  marginBottom: "3rem",
                  textAlign: "center",
                }}
              >
                J'ai mal...
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {MAL_CHOICES.map(choice => (
                  <button
                    key={choice.label}
                    onClick={() => handleChoice(choice)}
                    style={{
                      background: selectedChoice === choice.label
                        ? "linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)"
                        : "oklch(0.22 0.04 240)",
                      color: "#fff",
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      border: "2px solid oklch(0.35 0.04 240)",
                      borderRadius: "1.2rem",
                      padding: "2rem 1.5rem",
                      cursor: "pointer",
                      transition: "all 120ms ease-out",
                      textTransform: "capitalize",
                      boxShadow: selectedChoice === choice.label
                        ? "0 6px 20px rgba(255, 107, 107, 0.4)"
                        : "0 2px 8px rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.8rem",
                    }}
                    onPointerDown={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
                    }}
                    onPointerUp={e => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    }}
                  >
                    <span style={{ fontSize: "2.5rem" }}>{choice.emoji}</span>
                    <span>{choice.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <CommunicationBar />
      </div>
    </div>
  );
}

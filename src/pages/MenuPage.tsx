/**
 * MenuPage — Page menu midi ou soir
 * Affiche l'image du repas principal et l'image du dessert (optionnel)
 */
import { useState } from "react";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import { useData } from "@/contexts/DataContext";

interface MenuPageProps {
  type: "midi" | "soir";
}

export default function MenuPage({ type }: MenuPageProps) {
  const { data } = useData();
  const menu = data.menus[type];
  const isMidi = type === "midi";
  const [isPlaying, setIsPlaying] = useState(false);

  const title = isMidi ? "🍽️ Menu du midi" : "🌙 Menu du soir";
  const accentColor = isMidi ? "#2E7D32" : "#4A148C";
  const horaire = isMidi ? "12h00" : "19h00";

  const handleTextToSpeech = (text: string) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

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
        <KiosqueHeader title={title} showBack />

        <main
          className="page-enter"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem 2rem",
            gap: "1.5rem",
            overflow: "hidden",
          }}
        >
          {/* Horaire */}
        <div
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
            color: accentColor === "#2E7D32" ? "#81C784" : "#CE93D8",
            background: `${accentColor}22`,
            border: `2px solid ${accentColor}`,
            borderRadius: "0.75rem",
            padding: "0.4rem 1.5rem",
          }}
        >
          🕛 Repas à {horaire}
        </div>

        {/* Images */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            justifyContent: "center",
            alignItems: "stretch",
            width: "100%",
            maxWidth: "1100px",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* Repas principal */}
          <div
            className="kiosque-card"
            style={{
              flex: menu.imageDessert ? 1.5 : 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              borderLeft: `6px solid ${accentColor}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
                color: "#FFD600",
              }}
            >
              Plat principal
            </div>
            {menu.imageRepas ? (
              <img
                src={menu.imageRepas}
                alt="Repas principal"
                style={{
                  flex: 1,
                  maxHeight: "100%",
                  width: "100%",
                  objectFit: "cover",
                  borderRadius: "0.75rem",
                  minHeight: 0,
                }}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "4rem",
                  color: "oklch(0.40 0.04 240)",
                }}
              >
                🍽️
              </div>
            )}
            {menu.description && (
              <div
                onClick={() => handleTextToSpeech(menu.description)}
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 600,
                  fontSize: "clamp(1rem, 1.8vw, 1.4rem)",
                  color: "#fff",
                  textAlign: "center",
                  padding: "0.75rem",
                  background: isPlaying ? "oklch(0.30 0.04 240)" : "oklch(0.22 0.04 240)",
                  borderRadius: "0.5rem",
                  width: "100%",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: isPlaying ? "2px solid #FFD600" : "2px solid transparent",
                  userSelect: "none",
                }}
                title="Cliquez pour écouter"
              >
                {isPlaying ? "🔊 Lecture..." : `🔉 ${menu.description}`}
              </div>
            )}
          </div>

          {/* Dessert (optionnel) */}
          {menu.imageDessert && (
            <div
              className="kiosque-card"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                borderLeft: `6px solid #FFD600`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
                  color: "#FFD600",
                }}
              >
                🍮 Dessert
              </div>
              <img
                src={menu.imageDessert}
                alt="Dessert"
                style={{
                  flex: 1,
                  maxHeight: "100%",
                  width: "100%",
                  objectFit: "cover",
                  borderRadius: "0.75rem",
                  minHeight: 0,
                }}
              />
            </div>
          )}
        </div>
      </main>

        <CommunicationBar />
      </div>
    </div>
  );
}

/**
 * MenuPage — Page menu midi ou soir
 * Affiche jusqu'à 4 catégories du repas (plat, féculent, légume, accompagnement)
 * + dessert optionnel, en grille adaptative.
 */
import { useState } from "react";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import { useData } from "@/contexts/DataContext";

interface MenuPageProps {
  type: "midi" | "soir";
}

interface Categorie {
  key: "imageRepas" | "imageFeculent" | "imageLegume" | "imageAccompagnement" | "imageDessert";
  descKey: "descriptionRepas" | "descriptionFeculent" | "descriptionLegume" | "descriptionAccompagnement" | "descriptionDessert";
  label: string;
  emoji: string;
  fallbackEmoji: string;
}

const CATEGORIES: Categorie[] = [
  { key: "imageRepas", descKey: "descriptionRepas", label: "Plat principal", emoji: "🍖", fallbackEmoji: "🍽️" },
  { key: "imageFeculent", descKey: "descriptionFeculent", label: "Féculent", emoji: "🍚", fallbackEmoji: "🍚" },
  { key: "imageLegume", descKey: "descriptionLegume", label: "Légume", emoji: "🥦", fallbackEmoji: "🥦" },
  { key: "imageAccompagnement", descKey: "descriptionAccompagnement", label: "Accompagnement", emoji: "🥗", fallbackEmoji: "🥗" },
  { key: "imageDessert", descKey: "descriptionDessert", label: "Dessert", emoji: "🍮", fallbackEmoji: "🍮" },
];

export default function MenuPage({ type }: MenuPageProps) {
  const { data } = useData();
  const menu = data.menus[type];
  const isMidi = type === "midi";
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const title = isMidi ? "🍽️ Menu du midi" : "🌙 Menu du soir";
  const accentColor = isMidi ? "#2E7D32" : "#4A148C";
  const horaire = isMidi ? "12h00" : "19h00";

  const handleTextToSpeech = (text: string, key: string) => {
    if (playingKey === key) {
      window.speechSynthesis.cancel();
      setPlayingKey(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setPlayingKey(key);
    utterance.onend = () => setPlayingKey(null);
    utterance.onerror = () => setPlayingKey(null);
    window.speechSynthesis.speak(utterance);
  };

  // Catégories qui ont une image renseignée (le plat principal s'affiche toujours)
  const categoriesActives = CATEGORIES.filter(
    c => c.key === "imageRepas" || menu[c.key]
  );

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
            gap: "1.2rem",
            overflow: "hidden",
          }}
        >
          {/* Horaire */}
          <div
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.2rem, 2.2vw, 1.8rem)",
              color: accentColor === "#2E7D32" ? "#81C784" : "#CE93D8",
              background: `${accentColor}22`,
              border: `2px solid ${accentColor}`,
              borderRadius: "0.75rem",
              padding: "0.4rem 1.5rem",
              flexShrink: 0,
            }}
          >
            🕛 Repas à {horaire}
          </div>

          {/* Grille des catégories */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(categoriesActives.length, 5)}, 1fr)`,
              gap: "1.2rem",
              justifyContent: "center",
              alignItems: "stretch",
              width: "100%",
              maxWidth: "1400px",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {categoriesActives.map(cat => {
              const imageUrl = menu[cat.key];
              const descText = menu[cat.descKey];
              const isDessert = cat.key === "imageDessert";
              const isCatPlaying = playingKey === cat.key;
              return (
                <div
                  key={cat.key}
                  className="kiosque-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.6rem",
                    borderLeft: `6px solid ${isDessert ? "#FFD600" : accentColor}`,
                    overflow: "hidden",
                    minHeight: 0,
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      fontWeight: 800,
                      fontSize: "clamp(0.95rem, 1.6vw, 1.3rem)",
                      color: "#FFD600",
                      textAlign: "center",
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </div>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={cat.label}
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
                        fontSize: "3rem",
                        color: "oklch(0.40 0.04 240)",
                        width: "100%",
                      }}
                    >
                      {cat.fallbackEmoji}
                    </div>
                  )}
                  {descText && (
                    <div
                      onClick={() => handleTextToSpeech(descText, cat.key)}
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 600,
                        fontSize: "clamp(0.8rem, 1.3vw, 1rem)",
                        color: "#fff",
                        textAlign: "center",
                        padding: "0.5rem 0.8rem",
                        background: isCatPlaying ? "oklch(0.32 0.06 95)" : "oklch(0.20 0.04 240)",
                        borderRadius: "0.5rem",
                        width: "100%",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        border: isCatPlaying ? "2px solid #FFD600" : "2px solid transparent",
                        userSelect: "none",
                        flexShrink: 0,
                      }}
                      title="Cliquez pour écouter"
                    >
                      {isCatPlaying ? "🔊 Lecture..." : `🔉 ${descText}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Description globale (repli si aucune description par aliment renseignée) */}
          {menu.description && !categoriesActives.some(c => menu[c.descKey]) && (
            <div
              onClick={() => handleTextToSpeech(menu.description, "global")}
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 600,
                fontSize: "clamp(1rem, 1.8vw, 1.4rem)",
                color: "#fff",
                textAlign: "center",
                padding: "0.75rem 1.5rem",
                background: playingKey === "global" ? "oklch(0.30 0.04 240)" : "oklch(0.22 0.04 240)",
                borderRadius: "0.5rem",
                maxWidth: "1100px",
                width: "100%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: playingKey === "global" ? "2px solid #FFD600" : "2px solid transparent",
                userSelect: "none",
                flexShrink: 0,
              }}
              title="Cliquez pour écouter"
            >
              {playingKey === "global" ? "🔊 Lecture..." : `🔉 ${menu.description}`}
            </div>
          )}
        </main>

        <CommunicationBar />
      </div>
    </div>
  );
}

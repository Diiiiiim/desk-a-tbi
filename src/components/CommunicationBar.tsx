/**
 * CommunicationBar — Bandeau fixe en bas de toutes les pages
 * 5 boutons de communication avec synthèse vocale (Web Speech API)
 * Design : fond vert forêt, boutons colorés selon catégorie
 */
import { useState } from "react";

interface CommButton {
  label: string;
  speech: string;
  icon: string;
  color: string;
  textColor: string;
}

const COMM_BUTTONS: CommButton[] = [
  {
    label: "OUI",
    speech: "oui",
    icon: "✅",
    color: "#2E7D32",
    textColor: "#ffffff",
  },
  {
    label: "NON",
    speech: "non",
    icon: "❌",
    color: "#C62828",
    textColor: "#ffffff",
  },
  {
    label: "JE VEUX DE L'EAU",
    speech: "je veux de l'eau",
    icon: "💧",
    color: "#1565C0",
    textColor: "#ffffff",
  },
  {
    label: "JE VEUX ALLER AUX TOILETTES",
    speech: "je veux aller aux toilettes",
    icon: "🚻",
    color: "#6A1B9A",
    textColor: "#ffffff",
  },
  {
    label: "J'AI BESOIN D'AIDE",
    speech: "j'ai besoin d'aide",
    icon: "🆘",
    color: "#E65100",
    textColor: "#ffffff",
  },
];

function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
}

export default function CommunicationBar() {
  const [active, setActive] = useState<string | null>(null);

  function handlePress(btn: CommButton) {
    setActive(btn.label);
    speak(btn.speech);
    setTimeout(() => setActive(null), 600);
  }

  return (
    <div
      className="comm-bar"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 1rem",
        gap: "0.75rem",
      }}
    >
      {COMM_BUTTONS.map(btn => (
        <button
          key={btn.label}
          className="btn-comm"
          style={{
            background: active === btn.label
              ? `color-mix(in oklch, ${btn.color} 80%, white)`
              : btn.color,
            color: btn.textColor,
            boxShadow: active === btn.label
              ? "none"
              : `0 4px 12px ${btn.color}55`,
            transform: active === btn.label ? "scale(0.93)" : "scale(1)",
            transition: "transform 100ms ease-out, box-shadow 100ms ease-out",
          }}
          onPointerDown={() => handlePress(btn)}
        >
          <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{btn.icon}</span>
          <span style={{ fontSize: "clamp(0.75rem, 1.3vw, 1rem)", fontWeight: 800, lineHeight: 1.1 }}>
            {btn.label}
          </span>
        </button>
      ))}
    </div>
  );
}

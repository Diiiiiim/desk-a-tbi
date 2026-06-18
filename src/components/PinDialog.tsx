/**
 * PinDialog — Saisie du code PIN pour accès administration
 * Clavier numérique tactile, code PIN par défaut : 1234
 */
import { useState } from "react";

const PIN_CODE = "1234";

interface PinDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PinDialog({ onSuccess, onCancel }: PinDialogProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleDigit(d: string) {
    if (input.length >= 4) return;
    const next = input + d;
    setInput(next);
    setError(false);
    if (next.length === 4) {
      if (next === PIN_CODE) {
        onSuccess();
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setInput("");
          setShake(false);
        }, 700);
      }
    }
  }

  function handleDelete() {
    setInput(prev => prev.slice(0, -1));
    setError(false);
  }

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  return (
    <div className="pin-overlay">
      <div
        style={{
          background: "oklch(0.18 0.04 240)",
          border: "2px solid oklch(0.30 0.04 240)",
          borderRadius: "1.5rem",
          padding: "2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          minWidth: 340,
          boxShadow: "0 20px 60px oklch(0 0 0 / 0.5)",
          animation: shake ? "pinShake 0.5s ease" : undefined,
        }}
      >
        <style>{`
          @keyframes pinShake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-12px); }
            40% { transform: translateX(12px); }
            60% { transform: translateX(-8px); }
            80% { transform: translateX(8px); }
          }
        `}</style>

        {/* Titre */}
        <div
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "1.6rem",
            color: "#FFD600",
          }}
        >
          🔐 Code PIN
        </div>

        {/* Indicateur de saisie */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: i < input.length
                  ? (error ? "#C62828" : "#FFD600")
                  : "oklch(0.30 0.04 240)",
                transition: "background 150ms",
              }}
            />
          ))}
        </div>

        {error && (
          <div
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#EF9A9A",
            }}
          >
            Code incorrect. Réessayez.
          </div>
        )}

        {/* Clavier numérique */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.75rem",
          }}
        >
          {digits.map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              style={{
                width: 80,
                height: 80,
                borderRadius: "0.75rem",
                background: "oklch(0.22 0.04 240)",
                border: "2px solid oklch(0.35 0.04 240)",
                color: "#fff",
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "1.8rem",
                cursor: "pointer",
                transition: "transform 100ms, background 100ms",
                gridColumn: d === "0" ? "2 / 3" : undefined,
              }}
              onPointerDown={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.92)";
                (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.30 0.04 240)";
              }}
              onPointerUp={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.22 0.04 240)";
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Boutons action */}
        <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
          <button
            onClick={handleDelete}
            style={{
              flex: 1,
              height: 56,
              borderRadius: "0.75rem",
              background: "oklch(0.22 0.04 240)",
              border: "2px solid oklch(0.35 0.04 240)",
              color: "#fff",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            ⌫ Effacer
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 56,
              borderRadius: "0.75rem",
              background: "#C62828",
              border: "none",
              color: "#fff",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            ✕ Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

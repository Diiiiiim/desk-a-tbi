/**
 * PinDialog — Saisie du code PIN pour accès administration
 * Vérifie le PIN contre Supabase (table foyers)
 */
import { useState } from "react";
import { supabase, FOYER_ID } from "@/lib/supabase";

interface PinDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PinDialog({ onSuccess, onCancel }: PinDialogProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);

  async function checkPin(pin: string) {
    setChecking(true);
    try {
      const { data } = await supabase
        .from("foyers")
        .select("code_pin")
        .eq("id", FOYER_ID)
        .single();

      const correct = data?.code_pin || "1234";
      if (pin === correct) {
        onSuccess();
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => {
          setInput("");
          setShake(false);
        }, 700);
      }
    } catch {
      // Fallback si Supabase inaccessible
      if (pin === "1234") {
        onSuccess();
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => { setInput(""); setShake(false); }, 700);
      }
    } finally {
      setChecking(false);
    }
  }

  function handleDigit(d: string) {
    if (input.length >= 8 || checking) return;
    const next = input + d;
    setInput(next);
    setError(false);
  }

  function handleDelete() {
    setInput(prev => prev.slice(0, -1));
    setError(false);
  }

  async function handleConfirm() {
    if (input.length < 4 || checking) return;
    await checkPin(input);
  }

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  const btnStyle = {
    width: 80, height: 80,
    borderRadius: "0.75rem",
    background: "oklch(0.22 0.04 240)",
    border: "2px solid oklch(0.35 0.04 240)",
    color: "#fff",
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 800,
    fontSize: "1.8rem",
    cursor: "pointer",
    transition: "transform 100ms, background 100ms",
  } as React.CSSProperties;

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

        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#FFD600" }}>
          🔐 Code PIN
        </div>

        {/* Indicateur de saisie — jusqu'à 8 chiffres */}
        <div style={{ display: "flex", gap: "0.6rem" }}>
          {Array.from({ length: Math.max(input.length, 4) }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 16, height: 16,
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
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#EF9A9A" }}>
            Code incorrect. Réessayez.
          </div>
        )}

        {/* Clavier numérique */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
          {digits.map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              style={{ ...btnStyle, gridColumn: d === "0" ? "2 / 3" : undefined }}
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

        {/* Bouton Valider (apparaît dès 4 chiffres) */}
        {input.length >= 4 && (
          <button
            onClick={handleConfirm}
            disabled={checking}
            style={{
              width: "100%", height: 56,
              borderRadius: "0.75rem",
              background: checking ? "oklch(0.35 0.04 240)" : "#FFD600",
              border: "none",
              color: "#0D1B2A",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "1.1rem",
              cursor: checking ? "wait" : "pointer",
            }}
          >
            {checking ? "⏳ Vérification..." : "✅ Valider"}
          </button>
        )}

        <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
          <button
            onClick={handleDelete}
            style={{
              flex: 1, height: 56,
              borderRadius: "0.75rem",
              background: "oklch(0.22 0.04 240)",
              border: "2px solid oklch(0.35 0.04 240)",
              color: "#fff",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700, fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            ⌫ Effacer
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: 56,
              borderRadius: "0.75rem",
              background: "#C62828",
              border: "none", color: "#fff",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700, fontSize: "1.1rem",
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

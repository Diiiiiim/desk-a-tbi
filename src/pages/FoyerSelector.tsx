/**
 * FoyerSelector — Page d'accueil sans slug
 * Liste tous les foyers existants pour y accéder rapidement.
 * Pratique en interne (démo, tests) et pour montrer les clients existants.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface FoyerSummary {
  id: string;
  nom: string;
  slug: string;
}

export default function FoyerSelector() {
  const [foyers, setFoyers] = useState<FoyerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("foyers")
      .select("id, nom, slug")
      .order("nom")
      .then(({ data }) => {
        if (data) setFoyers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "oklch(0.13 0.04 240)",
        padding: "2rem",
        gap: "2rem",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>🏠</div>
        <h1
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "2rem",
            color: "#FFD600",
            margin: 0,
          }}
        >
          Desk-A TBI
        </h1>
        <p
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 600,
            color: "oklch(0.65 0.02 240)",
            marginTop: "0.5rem",
          }}
        >
          Choisissez votre foyer
        </p>
      </div>

      {loading && (
        <div style={{ color: "oklch(0.65 0.02 240)", fontFamily: "'Baloo 2', sans-serif" }}>
          ⏳ Chargement...
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        {foyers.map(f => (
          <a
            key={f.id}
            href={`/f/${f.slug}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.2rem 1.5rem",
              background: "oklch(0.18 0.04 240)",
              border: "2px solid oklch(0.30 0.04 240)",
              borderRadius: "1rem",
              textDecoration: "none",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#fff",
              transition: "transform 150ms, border-color 150ms",
            }}
          >
            <span>🏠 {f.nom}</span>
            <span style={{ color: "#FFD600" }}>→</span>
          </a>
        ))}

        {!loading && foyers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "oklch(0.55 0.02 240)",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 600,
            }}
          >
            Aucun foyer configuré pour le moment.
          </div>
        )}
      </div>

      <a
        href="/super-admin"
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 600,
          fontSize: "0.85rem",
          color: "oklch(0.40 0.02 240)",
          textDecoration: "none",
        }}
      >
        Administration
      </a>
    </div>
  );
}

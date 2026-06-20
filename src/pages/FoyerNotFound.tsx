/**
 * FoyerNotFound — Slug d'URL ne correspondant à aucun foyer
 */
interface FoyerNotFoundProps {
  slug: string;
}

export default function FoyerNotFound({ slug }: FoyerNotFoundProps) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "oklch(0.13 0.04 240)",
        gap: "1.5rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "4rem" }}>🔍</div>
      <h1
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: "1.8rem",
          color: "#FFD600",
          margin: 0,
        }}
      >
        Foyer introuvable
      </h1>
      <p
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 600,
          color: "oklch(0.65 0.02 240)",
          maxWidth: 480,
        }}
      >
        Aucun foyer ne correspond à l'adresse « <strong style={{ color: "#fff" }}>/f/{slug}</strong> ».
        Vérifiez l'URL ou contactez votre administrateur.
      </p>
      <a
        href="/"
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 700,
          color: "#0D1B2A",
          background: "#FFD600",
          padding: "0.8rem 1.5rem",
          borderRadius: "0.75rem",
          textDecoration: "none",
        }}
      >
        ← Voir tous les foyers
      </a>
    </div>
  );
}

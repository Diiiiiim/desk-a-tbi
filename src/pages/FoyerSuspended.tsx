/**
 * FoyerSuspended — Affiché quand un foyer a été mis en pause par le Super Admin
 */
interface FoyerSuspendedProps {
  nom: string | null;
}

export default function FoyerSuspended({ nom }: FoyerSuspendedProps) {
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
      <div style={{ fontSize: "4rem" }}>⏸️</div>
      <h1
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          fontSize: "1.8rem",
          color: "#FFD600",
          margin: 0,
        }}
      >
        Service suspendu
      </h1>
      <p
        style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 600,
          color: "oklch(0.65 0.02 240)",
          maxWidth: 480,
        }}
      >
        {nom ? <>L'accès pour <strong style={{ color: "#fff" }}>{nom}</strong> est temporairement suspendu.</> : "Ce service est temporairement suspendu."}
        <br />
        Contactez <strong style={{ color: "#fff" }}>Goemaere Dimitri</strong> pour plus d'informations.
      </p>
    </div>
  );
}

/**
 * PhotoCircle — Avatar en cercle avec fallback initiales
 * Utilisé pour résidents et éducateurs
 */
interface PhotoCircleProps {
  photo: string;
  prenom: string;
  size?: number;
  borderColor?: string;
}

export default function PhotoCircle({
  photo,
  prenom,
  size = 80,
  borderColor = "#FFD600",
}: PhotoCircleProps) {
  const initial = prenom ? prenom[0].toUpperCase() : "?";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `3px solid ${borderColor}`,
        background: "oklch(0.22 0.04 240)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: `0 2px 8px ${borderColor}44`,
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt={prenom}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: size * 0.4,
            color: borderColor,
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

/**
 * Logo ToBi — minimaliste, inspiré d'un écran/tableau interactif stylisé.
 * Un cadre arrondi (le tableau) avec un point lumineux (le "i" de ToBi /
 * le curseur tactile), dans les couleurs identitaires Desk-A (navy + or).
 */
export default function ToBiLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cadre du tableau interactif */}
      <rect x="4" y="6" width="40" height="28" rx="6" fill="#0D1B2A" stroke="#FFD600" strokeWidth="2.5" />
      {/* Reflet d'écran */}
      <path d="M9 11 L20 11 L9 22 Z" fill="#FFD600" opacity="0.18" />
      {/* Pied du support */}
      <path d="M20 34 L28 34 L30 42 L18 42 Z" fill="#FFD600" />
      {/* Point tactile / curseur */}
      <circle cx="24" cy="20" r="5" fill="#FFD600" />
    </svg>
  );
}

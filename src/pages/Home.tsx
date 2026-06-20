/**
 * Page d'accueil — Borne Kiosque Éducative
 * Design : Borne Tactile Industrielle Robuste & Chaleureuse
 * - Fond bleu nuit avec image de fond
 * - Date du jour en grand
 * - 6 gros boutons de navigation tactile
 * - Petit bouton Administration en bas
 * - Bandeau de communication en bas
 * - Widget météo rond en haut à droite
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useData } from "@/contexts/DataContext";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";

const NAV_BUTTONS = [
  {
    label: "Activités du jour",
    icon: "🎨",
    path: "/activites",
    color: "#1565C0",
    shadow: "#1565C055",
  },
  {
    label: "Menu du midi",
    icon: "🍽️",
    path: "/menu-midi",
    color: "#2E7D32",
    shadow: "#2E7D3255",
  },
  {
    label: "Menu du soir",
    icon: "🌙",
    path: "/menu-soir",
    color: "#4A148C",
    shadow: "#4A148C55",
  },
  {
    label: "Éducateurs du jour",
    icon: "👥",
    path: "/educateurs",
    color: "#E65100",
    shadow: "#E6510055",
  },
  {
    label: "Informations",
    icon: "ℹ️",
    path: "/informations",
    color: "#9C27B0",
    shadow: "#9C27B055",
  },
  {
    label: "Communication",
    icon: "💬",
    path: "/communication",
    color: "#7B68EE",
    shadow: "#7B68EE55",
  },
];

// ─── Pastille de widget réutilisable, alignée en colonne verticale ────────────
function WidgetPastille({
  onClick, background, shadow, children,
}: { onClick: () => void; background: string; shadow: string; children: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "'Baloo 2', sans-serif",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: `0 4px 14px ${shadow}`,
        transition: "transform 120ms ease-out",
      }}
      onPointerDown={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(0.93)";
      }}
      onPointerUp={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [weather, setWeather] = useState<{ temp: string; condition: string } | null>(null);
  const { data } = useData();
  const [birthdays, setBirthdays] = useState<{ today: any[]; next: any | null }>({ today: [], next: null });
  const [heureActuelle, setHeureActuelle] = useState(() =>
    new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );

  // Horloge — rafraîchie chaque minute
  useEffect(() => {
    const interval = setInterval(() => {
      setHeureActuelle(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Météo réelle (Open-Meteo), basée sur les coordonnées configurées du foyer
  useEffect(() => {
    if (!data.widgetMeteoActif) return;
    let cancelled = false;
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${data.meteoLat}&longitude=${data.meteoLon}&current=temperature_2m,weather_code&timezone=Europe/Brussels`
        );
        const json = await res.json();
        if (cancelled) return;
        const code = json.current?.weather_code ?? 0;
        const condition =
          code === 0 ? "Ciel dégagé" :
          code <= 2 ? "Partiellement nuageux" :
          code === 3 ? "Nuageux" :
          code <= 48 ? "Brumeux" :
          code <= 65 ? "Pluie" :
          code <= 75 ? "Neige" :
          code <= 82 ? "Averses" : "Orage";
        setWeather({ temp: `${Math.round(json.current?.temperature_2m ?? 0)}°C`, condition });
      } catch {
        setWeather(null);
      }
    }
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [data.widgetMeteoActif, data.meteoLat, data.meteoLon]);

  // Calculer les anniversaires (résidents + éducateurs)
  useEffect(() => {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const todayBirthdays = [
      ...data.residents.filter(r => {
        if (!r.dateNaissance) return false;
        const [, month, day] = r.dateNaissance.split('-');
        return `${month}-${day}` === todayStr;
      }),
      ...data.educateurs.filter(e => {
        if (!e.dateNaissance) return false;
        const [, month, day] = e.dateNaissance.split('-');
        return `${month}-${day}` === todayStr;
      }),
    ];

    let nextBirthday = null;
    let minDays = Infinity;
    
    const allPeople = [...data.residents, ...data.educateurs];
    allPeople.forEach(p => {
      if (!p.dateNaissance) return;
      const [, month, day] = p.dateNaissance.split('-');
      const birthDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
      
      if (birthDate < today) {
        birthDate.setFullYear(today.getFullYear() + 1);
      }
      
      const daysUntil = Math.floor((birthDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil > 0 && daysUntil < minDays) {
        minDays = daysUntil;
        nextBirthday = { resident: p, daysUntil };
      }
    });

    setBirthdays({ today: todayBirthdays, next: nextBirthday });
  }, [data.residents, data.educateurs]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663749144939/DaztMFEBdtvVSvafRXJGrs/kiosque-hero-bg-VQsy2W9buXt5GT5qPJj524.webp') center/cover no-repeat`,
        position: "relative",
      }}
    >
      {/* Overlay sombre pour lisibilité */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "oklch(0.10 0.04 240 / 0.10)",
          zIndex: 0,
        }}
      />

      {/* Colonne de widgets — alignés verticalement à droite */}
      <div
        style={{
          position: "absolute",
          top: "5.5rem",
          right: "1.2rem",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        {data.widgetTimelineActif && (
          <WidgetPastille
            onClick={() => navigate("/timeline")}
            background="linear-gradient(135deg, #FFB300 0%, #FF8F00 100%)"
            shadow="rgba(255, 143, 0, 0.5)"
          >
            <div style={{ fontSize: "1.7rem" }}>🕐</div>
            <div style={{ fontSize: "0.95rem", marginTop: "0.25rem" }}>{heureActuelle}</div>
          </WidgetPastille>
        )}

        {data.widgetMeteoActif && weather && (
          <WidgetPastille
            onClick={() => navigate("/meteo")}
            background="linear-gradient(135deg, #0277BD 0%, #01579B 100%)"
            shadow="rgba(2, 119, 189, 0.5)"
          >
            <div style={{ fontSize: "1.7rem" }}>🌤️</div>
            <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>{weather.temp}</div>
            <div style={{ fontSize: "0.6rem", marginTop: "0.1rem", textAlign: "center", lineHeight: 1.1 }}>{weather.condition}</div>
          </WidgetPastille>
        )}

        {data.widgetAnniversaireActif && (
          <WidgetPastille
            onClick={() => navigate("/anniversaires")}
            background={
              birthdays.today.length > 0
                ? "linear-gradient(135deg, #FF6B9D 0%, #FF1493 100%)"
                : "linear-gradient(135deg, #FFB347 0%, #FF8C00 100%)"
            }
            shadow={birthdays.today.length > 0 ? "rgba(255, 107, 157, 0.5)" : "rgba(255, 140, 0, 0.5)"}
          >
            <div style={{ fontSize: "1.7rem" }}>🎂</div>
            {birthdays.today.length > 0 ? (
              <div style={{ fontSize: "0.85rem", marginTop: "0.2rem", fontWeight: 900 }}>{birthdays.today.length}</div>
            ) : birthdays.next ? (
              <div style={{ fontSize: "0.65rem", marginTop: "0.2rem", textAlign: "center" }}>{birthdays.next.daysUntil}j</div>
            ) : null}
          </WidgetPastille>
        )}
      </div>

      {/* Contenu au-dessus de l'overlay */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <KiosqueHeader />

        {/* Zone principale */}
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
          {/* Titre de bienvenue */}
          <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                color: "#FF4444",
                marginBottom: "0.5rem",
                textTransform: "capitalize",
                textShadow: "0 2px 12px oklch(0 0 0 / 0.5)",
              }}
            >
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h1
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                color: "#FFD600",
                margin: 0,
                textShadow: "0 2px 12px oklch(0 0 0 / 0.5)",
              }}
            >
              Bonjour ! 👋
            </h1>

          </div>

          {/* Grille de boutons — 3 colonnes x 2 lignes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "repeat(2, 1fr)",
              gap: "1rem",
              width: "100%",
              maxWidth: "1200px",
            }}
          >
            {NAV_BUTTONS.map((btn, i) => (
              <button
                key={btn.path}
                onClick={() => navigate(btn.path)}
                className="kiosque-btn"
                style={{
                  padding: "1.5rem",
                  borderRadius: "1rem",
                  border: "none",
                  background: btn.color,
                  color: "#fff",
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(1rem, 2vw, 1.5rem)",
                  cursor: "pointer",
                  boxShadow: `0 8px 24px ${btn.shadow}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  transition: "transform 120ms ease-out",
                  inset: "0 0 8px 0 inset rgba(255,255,255,0.2), 0 8px 24px rgba(0,0,0,0.3)",
                }}
                onPointerDown={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
                }}
                onPointerUp={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
              >
                <span style={{ fontSize: "2.5rem" }}>{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>
        </main>

        {/* Bouton Administration */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: "1rem",
            zIndex: 2,
          }}
        >
          <button
            onClick={() => navigate("/admin")}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "2rem",
              border: "none",
              background: "oklch(0.22 0.04 240)",
              color: "#FFD600",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px oklch(0 0 0 / 0.3)",
              transition: "transform 120ms ease-out",
            }}
            onPointerDown={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
            }}
            onPointerUp={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            🔧 Administration
          </button>
        </div>

        <CommunicationBar />
      </div>
    </div>
  );
}

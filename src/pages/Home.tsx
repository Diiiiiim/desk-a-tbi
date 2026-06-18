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
import { useAuth } from "@/_core/hooks/useAuth";
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

export default function Home() {
  const [, navigate] = useLocation();
  const [weather, setWeather] = useState<{ temp: string; condition: string } | null>(null);
  const { data } = useData();
  const [birthdays, setBirthdays] = useState<{ today: any[]; next: any | null }>({ today: [], next: null });

  // Simuler la météo (en production, utiliser une API réelle)
  useEffect(() => {
    setWeather({ temp: "18°C", condition: "Nuageux" });
  }, []);

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

      {/* Widget Météo en haut à droite */}
      {weather && (
        <div
          onClick={() => navigate("/meteo")}
          style={{
            position: "absolute",
            top: "25%",
            right: "1rem",
            zIndex: 10,
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0277BD 0%, #01579B 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(2, 119, 189, 0.5)",
            transition: "transform 120ms ease-out",
          }}
          onPointerDown={e => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(0.95)";
          }}
          onPointerUp={e => {
            (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
          }}
        >
          <div style={{ fontSize: "2rem" }}>🌤️</div>
          <div style={{ fontSize: "1rem", marginTop: "0.5rem" }}>{weather.temp}</div>
          <div style={{ fontSize: "0.7rem", marginTop: "0.2rem", textAlign: "center", lineHeight: 1.1 }}>{weather.condition}</div>
        </div>
      )}

      {/* Widget Anniversaires en haut à gauche */}
      <div
        onClick={() => navigate("/anniversaires")}
        style={{
          position: "absolute",
          top: "25%",
          left: "1rem",
          zIndex: 10,
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          background: birthdays.today.length > 0
            ? "linear-gradient(135deg, #FF6B9D 0%, #FF1493 100%)"
            : "linear-gradient(135deg, #FFB347 0%, #FF8C00 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: birthdays.today.length > 0
            ? "0 6px 20px rgba(255, 107, 157, 0.5)"
            : "0 6px 20px rgba(255, 140, 0, 0.5)",
          transition: "transform 120ms ease-out",
        }}
        onPointerDown={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(0.95)";
        }}
        onPointerUp={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
        }}
      >
        <div style={{ fontSize: "2rem" }}>🎂</div>
        {birthdays.today.length > 0 ? (
          <div style={{ fontSize: "0.9rem", marginTop: "0.3rem", fontWeight: 900 }}>{birthdays.today.length}</div>
        ) : birthdays.next ? (
          <div style={{ fontSize: "0.7rem", marginTop: "0.3rem", textAlign: "center" }}>{birthdays.next.daysUntil}j</div>
        ) : null}
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

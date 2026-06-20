/**
 * Page Météo — Borne Kiosque Éducative
 * Affiche les prévisions météo du jour avec créneaux horaires
 * Ville/coordonnées configurables depuis l'Admin (Supabase: foyers.ville/meteo_lat/meteo_lon)
 * Utilise l'API Open-Meteo (gratuite, sans clé API)
 */
import { useEffect, useState } from "react";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import { supabase } from "@/lib/supabase";
import { useFoyer } from "@/contexts/FoyerContext";

interface HourlyForecast {
  time: string;
  temperature: number;
  description: string;
  icon: string;
}

interface MeteoData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  tempMin: number;
  tempMax: number;
  precipitation: number;
  hourly: HourlyForecast[];
}

function getWeatherDescription(code: number): { description: string; icon: string } {
  if (code === 0) return { description: "Ciel dégagé", icon: "☀️" };
  if (code === 1 || code === 2) return { description: "Partiellement nuageux", icon: "⛅" };
  if (code === 3) return { description: "Nuageux", icon: "☁️" };
  if (code === 45 || code === 48) return { description: "Brumeux", icon: "🌫️" };
  if (code === 51 || code === 53 || code === 55) return { description: "Légère pluie", icon: "🌧️" };
  if (code === 61 || code === 63 || code === 65) return { description: "Pluie", icon: "🌧️" };
  if (code === 71 || code === 73 || code === 75) return { description: "Neige", icon: "❄️" };
  if (code === 80 || code === 81 || code === 82) return { description: "Averses", icon: "⛈️" };
  if (code === 95 || code === 96 || code === 99) return { description: "Orage", icon: "⛈️" };
  return { description: "Inconnu", icon: "🌤️" };
}

export default function Meteo() {
  const { foyerId } = useFoyer();
  const [meteo, setMeteo] = useState<MeteoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ville, setVille] = useState("Peruwelz");

  useEffect(() => {
    if (!foyerId) return;
    async function fetchMeteo() {
      try {
        setLoading(true);

        // Récupérer la ville/coordonnées configurées pour ce foyer
        const { data: foyerData } = await supabase
          .from("foyers")
          .select("ville, meteo_lat, meteo_lon")
          .eq("id", foyerId as string)
          .single();

        const lat = foyerData?.meteo_lat ?? 50.51;
        const lon = foyerData?.meteo_lon ?? 3.59;
        setVille(foyerData?.ville || "Peruwelz");

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Europe/Brussels`
        );

        if (!response.ok) throw new Error("Erreur de connexion météo");

        const data = await response.json();
        const current = data.current;
        const daily = data.daily;
        const hourly = data.hourly;

        const { description, icon } = getWeatherDescription(current.weather_code);

        const timeSlots = [
          { start: 8, end: 10, label: "8h - 10h" },
          { start: 10, end: 12, label: "10h - 12h" },
          { start: 12, end: 14, label: "12h - 14h" },
          { start: 14, end: 16, label: "14h - 16h" },
          { start: 16, end: 18, label: "16h - 18h" },
          { start: 18, end: 20, label: "18h - 20h" },
        ];

        const hourlyForecasts = timeSlots.map(slot => {
          const temps = hourly.temperature_2m.slice(slot.start, slot.end) as number[];
          const codes = hourly.weather_code.slice(slot.start, slot.end) as number[];

          const avgTemp = Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length);
          const mostCommonCode = codes[Math.floor(codes.length / 2)];
          const { description: slotDesc, icon: slotIcon } = getWeatherDescription(mostCommonCode);

          return { time: slot.label, temperature: avgTemp, description: slotDesc, icon: slotIcon };
        });

        setMeteo({
          temperature: Math.round(current.temperature_2m),
          description, icon,
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          tempMin: Math.round(daily.temperature_2m_min[0]),
          tempMax: Math.round(daily.temperature_2m_max[0]),
          precipitation: daily.precipitation_sum[0] || 0,
          hourly: hourlyForecasts,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur météo");
        setMeteo(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMeteo();
    const interval = setInterval(fetchMeteo, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [foyerId]);

  return (
    <div
      style={{
        width: "100vw", height: "100vh",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        background: "oklch(0.13 0.04 240)",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "oklch(0.10 0.04 240 / 0.10)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <KiosqueHeader title={`🌤️ Météo — ${ville}`} showBack />

        <main
          className="page-enter"
          style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "1.5rem", gap: "1.5rem", overflow: "hidden",
          }}
        >
          {loading && (
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "1.4rem", color: "oklch(0.65 0.02 240)" }}>
              ⏳ Chargement de la météo...
            </div>
          )}

          {error && (
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "1.2rem", color: "#FF6B6B", textAlign: "center" }}>
              ⚠️ {error}
            </div>
          )}

          {meteo && (
            <>
              <div style={{ width: "100%", maxWidth: "1200px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.8rem", color: "#FFD600", margin: 0 }}>
                  📅 Prévisions horaires
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", width: "100%" }}>
                  {meteo.hourly.map((slot, idx) => (
                    <div key={idx} className="kiosque-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem", padding: "1.2rem" }}>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#FFD600" }}>{slot.time}</div>
                      <div style={{ fontSize: "2.8rem" }}>{slot.icon}</div>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#FFD600" }}>{slot.temperature}°C</div>
                      <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "oklch(0.75 0.02 240)", textAlign: "center" }}>{slot.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ width: "100%", maxWidth: "1200px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", padding: "1rem", background: "oklch(0.15 0.04 240)", borderRadius: "1rem", borderTop: "2px solid oklch(0.35 0.04 240)" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ fontSize: "2.5rem" }}>{meteo.icon}</div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "oklch(0.65 0.02 240)", textTransform: "uppercase" }}>Actuel</div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#FFD600" }}>{meteo.temperature}°C</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ fontSize: "2rem" }}>🌡️</div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "oklch(0.65 0.02 240)", textTransform: "uppercase" }}>Températures</div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#FFD600" }}>{meteo.tempMin}° → {meteo.tempMax}°</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ fontSize: "2rem" }}>💧</div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "oklch(0.65 0.02 240)", textTransform: "uppercase" }}>Humidité</div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#FFD600" }}>{meteo.humidity}%</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ fontSize: "2rem" }}>💨</div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "oklch(0.65 0.02 240)", textTransform: "uppercase" }}>Vent</div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#FFD600" }}>{meteo.windSpeed} km/h</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ fontSize: "2rem" }}>🌧️</div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "oklch(0.65 0.02 240)", textTransform: "uppercase" }}>Pluie</div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#FFD600" }}>{meteo.precipitation.toFixed(1)} mm</div>
                </div>
              </div>
            </>
          )}
        </main>

        <CommunicationBar />
      </div>
    </div>
  );
}

/**
 * Page Anniversaires — Borne Kiosque Éducative
 * Affiche les anniversaires du jour et les prochains anniversaires
 */
import { useEffect, useState } from "react";
import CommunicationBar from "@/components/CommunicationBar";
import KiosqueHeader from "@/components/KiosqueHeader";
import { useData } from "@/contexts/DataContext";
import type { Resident } from "@/contexts/DataContext";

interface BirthdayInfo {
  resident: Resident;
  age?: number;
  daysUntil?: number;
}

export default function Anniversaires() {
  const { data } = useData();
  const [todayBirthdays, setTodayBirthdays] = useState<BirthdayInfo[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayInfo[]>([]);

  useEffect(() => {
    const today = new Date();
    const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const today_bdays: BirthdayInfo[] = [];
    const upcoming_bdays: BirthdayInfo[] = [];

    // Ajouter les résidents
    data.residents.forEach(r => {
      if (!r.dateNaissance) return;

      const [year, month, day] = r.dateNaissance.split('-');
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const age = today.getFullYear() - birthDate.getFullYear();

      const birthdayThisYear = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
      
      if (`${month}-${day}` === todayStr) {
        today_bdays.push({ resident: r, age });
      } else {
        if (birthdayThisYear < today) {
          birthdayThisYear.setFullYear(today.getFullYear() + 1);
        }
        
        const daysUntil = Math.floor((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        upcoming_bdays.push({ resident: r, age: age + 1, daysUntil });
      }
    });

    // Ajouter les éducateurs
    data.educateurs.forEach(e => {
      if (!e.dateNaissance) return;

      const [year, month, day] = e.dateNaissance.split('-');
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const age = today.getFullYear() - birthDate.getFullYear();

      const birthdayThisYear = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
      
      if (`${month}-${day}` === todayStr) {
        today_bdays.push({ resident: e, age });
      } else {
        if (birthdayThisYear < today) {
          birthdayThisYear.setFullYear(today.getFullYear() + 1);
        }
        
        const daysUntil = Math.floor((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        upcoming_bdays.push({ resident: e, age: age + 1, daysUntil });
      }
    });

    // Trier les prochains anniversaires par nombre de jours
    upcoming_bdays.sort((a, b) => (a.daysUntil || 0) - (b.daysUntil || 0));

    setTodayBirthdays(today_bdays);
    setUpcomingBirthdays(upcoming_bdays.slice(0, 10)); // Afficher les 10 prochains
  }, [data.residents, data.educateurs]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "oklch(0.13 0.04 240)",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "oklch(0.10 0.04 240 / 0.10)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <KiosqueHeader title="🎂 Anniversaires" showBack />

        <main
          className="page-enter"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "2rem",
            gap: "2rem",
            overflow: "auto",
          }}
        >
          {/* Anniversaires du jour */}
          {todayBirthdays.length > 0 && (
            <div style={{ width: "100%", maxWidth: "1000px" }}>
              <h2
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: "2rem",
                  color: "#FF6B9D",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                🎉 Anniversaires Aujourd'hui!
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {todayBirthdays.map(b => (
                  <div
                    key={b.resident.id}
                    className="kiosque-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1.5rem",
                      background: "linear-gradient(135deg, #FF6B9D 0%, #FF1493 100%)",
                      border: "3px solid #FFD600",
                    }}
                  >
                    {b.resident.photo && (
                      <img
                        src={b.resident.photo}
                        alt={b.resident.prenom}
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "3px solid #fff",
                        }}
                      />
                    )}
                    <div
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 800,
                        fontSize: "1.8rem",
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      {b.resident.prenom}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.3rem",
                        color: "#FFD600",
                      }}
                    >
                      {b.age} ans! 🎂
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {todayBirthdays.length === 0 && (
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                fontSize: "1.2rem",
                color: "oklch(0.65 0.02 240)",
                textAlign: "center",
                marginTop: "2rem",
              }}
            >
              Pas d'anniversaire aujourd'hui
            </div>
          )}

          {/* Prochains anniversaires */}
          {upcomingBirthdays.length > 0 && (
            <div style={{ width: "100%", maxWidth: "1000px" }}>
              <h2
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: "#FFB347",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                📅 Prochains Anniversaires
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "1rem",
                }}
              >
                {upcomingBirthdays.map(b => (
                  <div
                    key={b.resident.id}
                    className="kiosque-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.8rem",
                      padding: "1rem",
                      background: "oklch(0.22 0.04 240)",
                    }}
                  >
                    {b.resident.photo && (
                      <img
                        src={b.resident.photo}
                        alt={b.resident.prenom}
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #FFB347",
                        }}
                      />
                    )}
                    <div
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        color: "#fff",
                        textAlign: "center",
                      }}
                    >
                      {b.resident.prenom}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#FFB347",
                      }}
                    >
                      {b.age} ans
                    </div>
                    <div
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "oklch(0.65 0.02 240)",
                      }}
                    >
                      dans {b.daysUntil} jour{b.daysUntil !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <CommunicationBar />
      </div>
    </div>
  );
}

/**
 * SuperAdmin — Tableau de bord propriétaire (Dimitri uniquement)
 * Route indépendante /super-admin, hors du système /f/:slug.
 * Protection par mot de passe (variable d'env VITE_SUPER_ADMIN_PASSWORD).
 *
 * Permet de :
 *  - lister tous les foyers avec quelques stats (résidents, éducateurs, créé le)
 *  - créer un nouveau foyer (nom + slug → génère l'URL à donner au client)
 *  - supprimer un foyer (cascade sur toutes ses données)
 */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const SUPER_ADMIN_PASSWORD = import.meta.env.VITE_SUPER_ADMIN_PASSWORD || "";

interface FoyerRow {
  id: string;
  nom: string;
  slug: string;
  created_at: string;
  actif: boolean;
  nbResidents?: number;
  nbEducateurs?: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SuperAdmin() {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  const [foyers, setFoyers] = useState<FoyerRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Formulaire création
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauSlug, setNouveauSlug] = useState("");
  const [slugManuel, setSlugManuel] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Confirmation suppression
  const [confirmDelete, setConfirmDelete] = useState<FoyerRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleLogin() {
    if (!SUPER_ADMIN_PASSWORD) {
      setAuthError(true);
      setMsg({ type: "err", text: "⚠️ VITE_SUPER_ADMIN_PASSWORD non configurée sur Vercel" });
      return;
    }
    if (passwordInput === SUPER_ADMIN_PASSWORD) {
      setAuthed(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  async function loadFoyers() {
    setLoading(true);
    const { data: foyersData } = await supabase
      .from("foyers")
      .select("id, nom, slug, created_at, actif")
      .order("created_at", { ascending: false });

    if (!foyersData) {
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      foyersData.map(async (f) => {
        const [{ count: nbResidents }, { count: nbEducateurs }] = await Promise.all([
          supabase.from("residents").select("*", { count: "exact", head: true }).eq("foyer_id", f.id),
          supabase.from("educateurs").select("*", { count: "exact", head: true }).eq("foyer_id", f.id),
        ]);
        return { ...f, nbResidents: nbResidents ?? 0, nbEducateurs: nbEducateurs ?? 0 };
      })
    );

    setFoyers(enriched);
    setLoading(false);
  }

  useEffect(() => {
    if (authed) loadFoyers();
  }, [authed]);

  function handleNomChange(value: string) {
    setNouveauNom(value);
    if (!slugManuel) setNouveauSlug(slugify(value));
  }

  async function handleCreate() {
    const nom = nouveauNom.trim();
    const slug = nouveauSlug.trim();
    if (!nom || !slug) {
      setMsg({ type: "err", text: "❌ Nom et identifiant URL obligatoires" });
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setMsg({ type: "err", text: "❌ L'identifiant URL ne peut contenir que des lettres minuscules, chiffres et tirets" });
      return;
    }

    setCreating(true);
    const { error } = await supabase.from("foyers").insert({
      nom,
      slug,
      code_pin: "1234",
    });
    setCreating(false);

    if (error) {
      if (error.code === "23505") {
        setMsg({ type: "err", text: `❌ L'identifiant "${slug}" est déjà utilisé par un autre foyer` });
      } else {
        setMsg({ type: "err", text: `❌ Erreur : ${error.message}` });
      }
      return;
    }

    setMsg({ type: "ok", text: `✅ Foyer "${nom}" créé ! URL : /f/${slug}` });
    setNouveauNom("");
    setNouveauSlug("");
    setSlugManuel(false);
    loadFoyers();
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    const { error } = await supabase.from("foyers").delete().eq("id", confirmDelete.id);
    setDeleting(false);
    setConfirmDelete(null);

    if (error) {
      setMsg({ type: "err", text: `❌ Erreur lors de la suppression : ${error.message}` });
    } else {
      setMsg({ type: "ok", text: `🗑️ Foyer "${confirmDelete.nom}" supprimé` });
      loadFoyers();
    }
  }

  async function togglePause(f: FoyerRow) {
    const nouvelEtat = !f.actif;
    const { error } = await supabase.from("foyers").update({ actif: nouvelEtat }).eq("id", f.id);
    if (error) {
      setMsg({ type: "err", text: `❌ Erreur : ${error.message}` });
      return;
    }
    setMsg({
      type: "ok",
      text: nouvelEtat ? `▶️ "${f.nom}" réactivé` : `⏸️ "${f.nom}" mis en pause`,
    });
    setFoyers(prev => prev.map(x => (x.id === f.id ? { ...x, actif: nouvelEtat } : x)));
  }

  // ── Écran de connexion ──────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={styles.page}>
        <div style={styles.loginCard}>
          <div style={{ fontSize: "3rem" }}>🔑</div>
          <h1 style={styles.h1}>Super Admin</h1>
          <p style={styles.subtitle}>Accès réservé — Desk-A</p>
          <input
            type="password"
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setAuthError(false); }}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Mot de passe"
            style={{ ...styles.input, borderColor: authError ? "#C62828" : "oklch(0.32 0.04 240)" }}
            autoFocus
          />
          {authError && (
            <div style={{ color: "#EF9A9A", fontFamily: "'Baloo 2', sans-serif", fontWeight: 600 }}>
              Mot de passe incorrect
            </div>
          )}
          <button onClick={handleLogin} style={styles.btnPrimary}>
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // ── Tableau de bord ──────────────────────────────────────────────────────────
  return (
    <div style={{ ...styles.page, alignItems: "stretch", justifyContent: "flex-start", padding: "2rem" }}>
      <div style={{ maxWidth: 1000, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ ...styles.h1, textAlign: "left" }}>🔑 Super Admin — Desk-A</h1>
            <p style={styles.subtitle}>{foyers.length} foyer{foyers.length !== 1 ? "s" : ""} actif{foyers.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={loadFoyers} style={styles.btnSecondary}>🔄 Rafraîchir</button>
        </header>

        {msg && (
          <div
            style={{
              padding: "0.9rem 1.2rem",
              borderRadius: "0.75rem",
              background: msg.type === "ok" ? "oklch(0.25 0.08 145)" : "oklch(0.25 0.08 25)",
              color: msg.type === "ok" ? "#A5D6A7" : "#EF9A9A",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
            }}
          >
            {msg.text}
          </div>
        )}

        {/* Formulaire de création */}
        <div style={styles.card}>
          <h2 style={styles.h2}>➕ Créer un nouveau foyer</h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: "2 1 240px", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={styles.label}>Nom du foyer</label>
              <input
                value={nouveauNom}
                onChange={e => handleNomChange(e.target.value)}
                placeholder="Ex : Foyer Les Tilleuls"
                style={styles.input}
              />
            </div>
            <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={styles.label}>Identifiant URL (slug)</label>
              <input
                value={nouveauSlug}
                onChange={e => { setNouveauSlug(slugify(e.target.value)); setSlugManuel(true); }}
                placeholder="les-tilleuls"
                style={styles.input}
              />
            </div>
          </div>
          {nouveauSlug && (
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, color: "oklch(0.65 0.02 240)", fontSize: "0.9rem" }}>
              URL générée : <strong style={{ color: "#FFD600" }}>/f/{nouveauSlug}</strong>
            </div>
          )}
          <button onClick={handleCreate} disabled={creating} style={styles.btnPrimary}>
            {creating ? "⏳ Création..." : "✅ Créer le foyer"}
          </button>
        </div>

        {/* Liste des foyers */}
        <div style={styles.card}>
          <h2 style={styles.h2}>🏠 Foyers existants</h2>
          {loading && <div style={{ color: "oklch(0.65 0.02 240)", fontFamily: "'Baloo 2', sans-serif" }}>⏳ Chargement...</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {foyers.map(f => (
              <div key={f.id} style={{ ...styles.foyerRow, opacity: f.actif ? 1 : 0.6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#fff" }}>
                      {f.nom}
                    </div>
                    {!f.actif && (
                      <span
                        style={{
                          fontFamily: "'Baloo 2', sans-serif",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          color: "#FFB74D",
                          background: "oklch(0.25 0.08 60)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "0.4rem",
                        }}
                      >
                        ⏸️ EN PAUSE
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "oklch(0.60 0.02 240)" }}>
                    /f/{f.slug} • {f.nbResidents} résident{f.nbResidents !== 1 ? "s" : ""} • {f.nbEducateurs} éducateur{f.nbEducateurs !== 1 ? "s" : ""}
                  </div>
                </div>
                <a
                  href={`/f/${f.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...styles.btnSecondary, textDecoration: "none", flexShrink: 0 }}
                >
                  👁️ Voir
                </a>
                <button onClick={() => togglePause(f)} style={{ ...styles.btnSecondary, flexShrink: 0 }}>
                  {f.actif ? "⏸️ Pause" : "▶️ Reprendre"}
                </button>
                <button onClick={() => setConfirmDelete(f)} style={{ ...styles.btnDanger, flexShrink: 0 }}>
                  🗑️
                </button>
              </div>
            ))}

            {!loading && foyers.length === 0 && (
              <div style={{ textAlign: "center", color: "oklch(0.55 0.02 240)", fontFamily: "'Baloo 2', sans-serif", padding: "1.5rem" }}>
                Aucun foyer pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation suppression */}
      {confirmDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ fontSize: "2.5rem" }}>⚠️</div>
            <h2 style={{ ...styles.h2, textAlign: "center" }}>Supprimer ce foyer ?</h2>
            <p style={{ fontFamily: "'Baloo 2', sans-serif", color: "oklch(0.70 0.02 240)", textAlign: "center" }}>
              Toutes les données de <strong style={{ color: "#fff" }}>{confirmDelete.nom}</strong> (résidents, éducateurs, activités, menus...) seront définitivement supprimées. Cette action est irréversible.
            </p>
            <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ ...styles.btnSecondary, flex: 1 }}>
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ ...styles.btnDanger, flex: 1 }}>
                {deleting ? "⏳..." : "🗑️ Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100vw",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "oklch(0.13 0.04 240)",
  },
  loginCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    background: "oklch(0.18 0.04 240)",
    border: "2px solid oklch(0.30 0.04 240)",
    borderRadius: "1.5rem",
    padding: "3rem",
    minWidth: 340,
  },
  h1: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 800,
    fontSize: "1.6rem",
    color: "#FFD600",
    margin: 0,
    textAlign: "center",
  },
  h2: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 800,
    fontSize: "1.2rem",
    color: "#FFD600",
    margin: 0,
  },
  subtitle: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 600,
    color: "oklch(0.60 0.02 240)",
    margin: 0,
  },
  label: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: "0.85rem",
    color: "oklch(0.65 0.02 240)",
  },
  input: {
    fontFamily: "'Baloo 2', sans-serif",
    fontSize: "1rem",
    padding: "0.8rem 1rem",
    borderRadius: "0.6rem",
    border: "2px solid oklch(0.32 0.04 240)",
    background: "oklch(0.15 0.04 240)",
    color: "#fff",
    width: "100%",
  },
  btnPrimary: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 800,
    fontSize: "1rem",
    background: "#FFD600",
    color: "#0D1B2A",
    border: "none",
    borderRadius: "0.6rem",
    padding: "0.8rem 1.5rem",
    cursor: "pointer",
  },
  btnSecondary: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: "0.9rem",
    background: "oklch(0.22 0.04 240)",
    color: "#fff",
    border: "2px solid oklch(0.32 0.04 240)",
    borderRadius: "0.6rem",
    padding: "0.6rem 1.1rem",
    cursor: "pointer",
  },
  btnDanger: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: "0.9rem",
    background: "#C62828",
    color: "#fff",
    border: "none",
    borderRadius: "0.6rem",
    padding: "0.6rem 1.1rem",
    cursor: "pointer",
  },
  card: {
    background: "oklch(0.16 0.04 240)",
    border: "2px solid oklch(0.28 0.04 240)",
    borderRadius: "1rem",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  foyerRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    background: "oklch(0.20 0.04 240)",
    border: "1px solid oklch(0.30 0.04 240)",
    borderRadius: "0.75rem",
    padding: "0.9rem 1.1rem",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "oklch(0 0 0 / 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    background: "oklch(0.18 0.04 240)",
    border: "2px solid oklch(0.30 0.04 240)",
    borderRadius: "1.5rem",
    padding: "2.5rem",
    maxWidth: 420,
  },
};

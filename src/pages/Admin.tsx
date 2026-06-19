/**
 * Page Administration — Borne Kiosque Éducative
 * Accès protégé par code PIN.
 * Fonctions : gestion résidents, éducateurs, activités, menus.
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import PinDialog from "@/components/PinDialog";
import PhotoCircle from "@/components/PhotoCircle";
import { useData } from "@/contexts/DataContext";
import type { Activite, Evenement, ModeleActivite } from "@/contexts/DataContext";
import { supabase } from "@/lib/supabase";

type AdminTab = "residents" | "educateurs" | "activites" | "evenements" | "modeles" | "menus" | "parametres";

// ─── Utilitaire : upload fichier → Supabase Storage (bucket "media") ──────────
// Retourne l'URL publique de l'image. Fallback en base64 si l'upload échoue.
async function readFileAsDataURL(file: File): Promise<string> {
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error("Upload Supabase Storage échoué, fallback base64 :", err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// ─── Sous-composant : onglet Résidents ────────────────────────────────────────
function TabResidents() {
  const { data, addResident, updateResident, removeResident } = useData();
  const [prenom, setPrenom] = useState("");
  const [photo, setPhoto] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhoto(await readFileAsDataURL(file));
  }

  function handleSave() {
    if (!prenom.trim()) return;
    if (editId) {
      updateResident(editId, { prenom: prenom.trim(), photo, dateNaissance });
      setEditId(null);
    } else {
      addResident(prenom.trim(), photo, dateNaissance);
    }
    setPrenom("");
    setPhoto("");
    setDateNaissance("");
  }

  function startEdit(id: string) {
    const r = data.residents.find(r => r.id === id);
    if (!r) return;
    setEditId(id);
    setPrenom(r.prenom);
    setPhoto(r.photo);
    setDateNaissance(r.dateNaissance || "");
  }

  return (
    <div style={{ display: "flex", gap: "1.5rem", height: "100%", overflow: "hidden" }}>
      {/* Formulaire */}
      <div className="kiosque-card" style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={styles.formTitle}>{editId ? "Modifier résident" : "Ajouter résident"}</h3>
        <input
          style={styles.input}
          placeholder="Prénom"
          value={prenom}
          onChange={e => setPrenom(e.target.value)}
        />
        <input
          style={styles.input}
          type="date"
          placeholder="Date de naissance"
          value={dateNaissance}
          onChange={e => setDateNaissance(e.target.value)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button style={styles.btnSecondary} onClick={() => fileRef.current?.click()}>
            📷 Choisir une photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
          {photo && <img src={photo} alt="preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", alignSelf: "center" }} />}
        </div>
        <button style={styles.btnPrimary} onClick={handleSave}>
          {editId ? "✅ Enregistrer" : "➕ Ajouter"}
        </button>
        {editId && (
          <button style={styles.btnDanger} onClick={() => { setEditId(null); setPrenom(""); setPhoto(""); }}>
            Annuler
          </button>
        )}
      </div>

      {/* Liste */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {data.residents.map(r => (
          <div key={r.id} className="kiosque-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <PhotoCircle photo={r.photo} prenom={r.prenom} size={64} />
            <span style={styles.listName}>{r.prenom}</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
              <button style={styles.btnEdit} onClick={() => startEdit(r.id)}>✏️ Modifier</button>
              <button style={styles.btnDanger} onClick={() => removeResident(r.id)}>🗑️ Supprimer</button>
            </div>
          </div>
        ))}
        {data.residents.length === 0 && <EmptyState text="Aucun résident enregistré" />}
      </div>
    </div>
  );
}

// ─── Sous-composant : onglet Éducateurs ───────────────────────────────────────
function TabEducateurs() {
  const { data, addEducateur, updateEducateur, removeEducateur, toggleEducateurPresence } = useData();
  const [prenom, setPrenom] = useState("");
  const [photo, setPhoto] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhoto(await readFileAsDataURL(file));
  }

  function handleSave() {
    if (!prenom.trim()) return;
    if (editId) {
      updateEducateur(editId, { prenom: prenom.trim(), photo, dateNaissance });
      setEditId(null);
    } else {
      addEducateur(prenom.trim(), photo, dateNaissance);
    }
    setPrenom("");
    setPhoto("");
    setDateNaissance("");
  }

  function startEdit(id: string) {
    const e = data.educateurs.find(e => e.id === id);
    if (!e) return;
    setEditId(id);
    setPrenom(e.prenom);
    setPhoto(e.photo);
    setDateNaissance(e.dateNaissance || "");
  }

  return (
    <div style={{ display: "flex", gap: "1.5rem", height: "100%", overflow: "hidden" }}>
      <div className="kiosque-card" style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={styles.formTitle}>{editId ? "Modifier éducateur" : "Ajouter éducateur"}</h3>
        <input style={styles.input} placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} />
        <input style={styles.input} type="date" placeholder="Date de naissance" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button style={styles.btnSecondary} onClick={() => fileRef.current?.click()}>📷 Choisir une photo</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
          {photo && <img src={photo} alt="preview" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", alignSelf: "center" }} />}
        </div>
        <button style={styles.btnPrimary} onClick={handleSave}>{editId ? "✅ Enregistrer" : "➕ Ajouter"}</button>
        {editId && <button style={styles.btnDanger} onClick={() => { setEditId(null); setPrenom(""); setPhoto(""); }}>Annuler</button>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {data.educateurs.map(e => (
          <div key={e.id} className="kiosque-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <PhotoCircle photo={e.photo} prenom={e.prenom} size={64} borderColor="#E65100" />
            <span style={styles.listName}>{e.prenom}</span>
            <button
              onClick={() => toggleEducateurPresence(e.id)}
              style={{
                ...styles.btnSecondary,
                background: e.presentAujourdhui ? "#2E7D32" : "oklch(0.22 0.04 240)",
                border: `2px solid ${e.presentAujourdhui ? "#2E7D32" : "oklch(0.35 0.04 240)"}`,
                marginLeft: "auto",
              }}
            >
              {e.presentAujourdhui ? "✅ Présent" : "⬜ Absent"}
            </button>
            <button style={styles.btnEdit} onClick={() => startEdit(e.id)}>✏️</button>
            <button style={styles.btnDanger} onClick={() => removeEducateur(e.id)}>🗑️</button>
          </div>
        ))}
        {data.educateurs.length === 0 && <EmptyState text="Aucun éducateur enregistré" />}
      </div>
    </div>
  );
}

// ─── Sous-composant : onglet Activités ────────────────────────────────────────
function TabActivites() {
  const { data, addActivite, updateActivite, removeActivite } = useData();
  const [nom, setNom] = useState("");
  const [horaire, setHoraire] = useState<"matin" | "apres-midi">("matin");
  const [pictogramme, setPictogramme] = useState("");
  const [residentIds, setResidentIds] = useState<string[]>([]);
  const [educateurIds, setEducateurIds] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePicto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPictogramme(await readFileAsDataURL(file));
  }

  function toggleId(arr: string[], id: string): string[] {
    return arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];
  }

  function handleSave() {
    if (!nom.trim()) return;
    const activite: Omit<Activite, "id"> = { nom: nom.trim(), horaire, pictogramme, residentIds, educateurIds };
    if (editId) {
      updateActivite(editId, activite);
      setEditId(null);
    } else {
      addActivite(activite);
    }
    resetForm();
  }

  function resetForm() {
    setNom(""); setHoraire("matin"); setPictogramme(""); setResidentIds([]); setEducateurIds([]);
  }

  function startEdit(id: string) {
    const a = data.activites.find(a => a.id === id);
    if (!a) return;
    setEditId(id); setNom(a.nom); setHoraire(a.horaire);
    setPictogramme(a.pictogramme); setResidentIds(a.residentIds); setEducateurIds(a.educateurIds);
  }

  return (
    <div style={{ display: "flex", gap: "1.5rem", height: "100%", overflow: "hidden" }}>
      {/* Formulaire */}
      <div className="kiosque-card" style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.8rem", overflowY: "auto" }}>
        <h3 style={styles.formTitle}>{editId ? "Modifier activité" : "Ajouter activité"}</h3>
        <input style={styles.input} placeholder="Nom de l'activité" value={nom} onChange={e => setNom(e.target.value)} />

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["matin", "apres-midi"] as const).map(h => (
            <button
              key={h}
              style={{ ...styles.btnSecondary, flex: 1, background: horaire === h ? "#1565C0" : "oklch(0.22 0.04 240)", border: `2px solid ${horaire === h ? "#1565C0" : "oklch(0.35 0.04 240)"}` }}
              onClick={() => setHoraire(h)}
            >
              {h === "matin" ? "🕙 10h–12h" : "🕑 14h–16h"}
            </button>
          ))}
        </div>

        <button style={styles.btnSecondary} onClick={() => fileRef.current?.click()}>🖼️ Pictogramme</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePicto} />
        {pictogramme && <img src={pictogramme} alt="picto" style={{ width: 70, height: 70, objectFit: "contain", alignSelf: "center", borderRadius: "0.5rem" }} />}

        <div>
          <div style={styles.subLabel}>Résidents participants</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {data.residents.map(r => (
              <button
                key={r.id}
                style={{ ...styles.chip, background: residentIds.includes(r.id) ? "#FFD600" : "oklch(0.22 0.04 240)", color: residentIds.includes(r.id) ? "#0D1B2A" : "#fff" }}
                onClick={() => setResidentIds(toggleId(residentIds, r.id))}
              >
                {r.prenom}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={styles.subLabel}>Éducateurs encadrants</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {data.educateurs.map(e => (
              <button
                key={e.id}
                style={{ ...styles.chip, background: educateurIds.includes(e.id) ? "#E65100" : "oklch(0.22 0.04 240)", color: "#fff" }}
                onClick={() => setEducateurIds(toggleId(educateurIds, e.id))}
              >
                {e.prenom}
              </button>
            ))}
          </div>
        </div>

        <button style={styles.btnPrimary} onClick={handleSave}>{editId ? "✅ Enregistrer" : "➕ Ajouter"}</button>
        {editId && <button style={styles.btnDanger} onClick={() => { setEditId(null); resetForm(); }}>Annuler</button>}
      </div>

      {/* Liste */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {data.activites.map(a => (
          <div key={a.id} className="kiosque-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {a.pictogramme && <img src={a.pictogramme} alt={a.nom} style={{ width: 56, height: 56, objectFit: "contain", borderRadius: "0.5rem", flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={styles.listName}>{a.nom}</div>
              <div style={{ fontSize: "0.9rem", color: "oklch(0.65 0.02 240)" }}>
                {a.horaire === "matin" ? "🕙 10h–12h" : "🕑 14h–16h"} · {a.residentIds.length} résident(s) · {a.educateurIds.length} éducateur(s)
              </div>
            </div>
            <button style={styles.btnEdit} onClick={() => startEdit(a.id)}>✏️ Modifier</button>
            <button style={styles.btnDanger} onClick={() => removeActivite(a.id)}>🗑️</button>
          </div>
        ))}
        {data.activites.length === 0 && <EmptyState text="Aucune activité programmée" />}
      </div>
    </div>
  );
}

// ─── Sous-composant : onglet Événements ───────────────────────────────────────
function TabEvenements() {
  const { data, addEvenement, updateEvenement, removeEvenement } = useData();
  const [titre, setTitre] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [residentIds, setResidentIds] = useState<string[]>([]);
  const [educateurIds, setEducateurIds] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhoto(await readFileAsDataURL(file));
  }

  function toggleId(arr: string[], id: string): string[] {
    return arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];
  }

  function handleSave() {
    if (!titre.trim() || !date) return;
    const evenement: Omit<Evenement, "id"> = { titre: titre.trim(), date, description, photo, residentIds, educateurIds };
    if (editId) {
      updateEvenement(editId, evenement);
      setEditId(null);
    } else {
      addEvenement(evenement);
    }
    resetForm();
  }

  function resetForm() {
    setTitre(""); setDate(""); setDescription(""); setPhoto(""); setResidentIds([]); setEducateurIds([]);
  }

  function startEdit(id: string) {
    const e = data.evenements.find(e => e.id === id);
    if (!e) return;
    setEditId(id); setTitre(e.titre); setDate(e.date);
    setDescription(e.description); setPhoto(e.photo); setResidentIds(e.residentIds); setEducateurIds(e.educateurIds);
  }

  return (
    <div style={{ display: "flex", gap: "1.5rem", height: "100%", overflow: "hidden" }}>
      {/* Formulaire */}
      <div className="kiosque-card" style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.8rem", overflowY: "auto" }}>
        <h3 style={styles.formTitle}>{editId ? "Modifier événement" : "Ajouter événement"}</h3>
        <input style={styles.input} placeholder="Titre de l'événement" value={titre} onChange={e => setTitre(e.target.value)} />
        <input style={styles.input} type="date" value={date} onChange={e => setDate(e.target.value)} />
        <textarea style={{ ...styles.input, minHeight: 80, fontFamily: "'Baloo 2', sans-serif" }} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />

        <button style={styles.btnSecondary} onClick={() => fileRef.current?.click()}>📷 Photo de l'événement</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
        {photo && <img src={photo} alt="preview" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: "0.5rem" }} />}

        <div>
          <div style={styles.subLabel}>Résidents participants</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {data.residents.map(r => (
              <button
                key={r.id}
                style={{ ...styles.chip, background: residentIds.includes(r.id) ? "#FFD600" : "oklch(0.22 0.04 240)", color: residentIds.includes(r.id) ? "#0D1B2A" : "#fff" }}
                onClick={() => setResidentIds(toggleId(residentIds, r.id))}
              >
                {r.prenom}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={styles.subLabel}>Éducateurs encadrants</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {data.educateurs.map(e => (
              <button
                key={e.id}
                style={{ ...styles.chip, background: educateurIds.includes(e.id) ? "#E65100" : "oklch(0.22 0.04 240)", color: "#fff" }}
                onClick={() => setEducateurIds(toggleId(educateurIds, e.id))}
              >
                {e.prenom}
              </button>
            ))}
          </div>
        </div>

        <button style={styles.btnPrimary} onClick={handleSave}>{editId ? "✅ Enregistrer" : "➕ Ajouter"}</button>
        {editId && <button style={styles.btnDanger} onClick={() => { setEditId(null); resetForm(); }}>Annuler</button>}
      </div>

      {/* Liste */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {data.evenements.map(e => (
          <div key={e.id} className="kiosque-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {e.photo && <img src={e.photo} alt={e.titre} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "0.5rem", flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={styles.listName}>{e.titre}</div>
              <div style={{ fontSize: "0.9rem", color: "oklch(0.65 0.02 240)" }}>
                📅 {e.date} · {e.residentIds.length} résident(s) · {e.educateurIds.length} éducateur(s)
              </div>
            </div>
            <button style={styles.btnEdit} onClick={() => startEdit(e.id)}>✏️ Modifier</button>
            <button style={styles.btnDanger} onClick={() => removeEvenement(e.id)}>🗑️</button>
          </div>
        ))}
        {data.evenements.length === 0 && <EmptyState text="Aucun événement programmé" />}
      </div>
    </div>
  );
}

function TabModeles() {
  const { data, addModele, updateModele, removeModele } = useData();
  const [nom, setNom] = useState("");
  const [jour, setJour] = useState<"lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche">("lundi");
  const [horaire, setHoraire] = useState<"matin" | "apres-midi">("matin");
  const [pictogramme, setPictogramme] = useState("");
  const [residentIds, setResidentIds] = useState<string[]>([]);
  const [educateurIds, setEducateurIds] = useState<string[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePictogramme(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPictogramme(await readFileAsDataURL(file));
  }

  function handleSave() {
    if (!nom.trim()) {
      alert("⚠️ Veuillez entrer un nom pour l'activité");
      return;
    }
    if (editId) {
      updateModele(editId, { nom: nom.trim(), jour, horaire, pictogramme, residentIds, educateurIds });
      setEditId(null);
    } else {
      addModele({ nom: nom.trim(), jour, horaire, pictogramme, residentIds, educateurIds, actif: true });
    }
    setNom("");
    setPictogramme("");
    setResidentIds([]);
    setEducateurIds([]);
  }

  function handleClone(id: string) {
    const m = data.modeles.find(x => x.id === id);
    if (m) {
      addModele({ nom: m.nom + " (copie)", jour: m.jour, horaire: m.horaire, pictogramme: m.pictogramme, residentIds: m.residentIds, educateurIds: m.educateurIds, actif: true });
    }
  }

  function startEdit(id: string) {
    const m = data.modeles.find(x => x.id === id);
    if (m) {
      setNom(m.nom);
      setJour(m.jour);
      setHoraire(m.horaire);
      setPictogramme(m.pictogramme);
      setResidentIds(m.residentIds);
      setEducateurIds(m.educateurIds);
      setEditId(id);
    }
  }

  const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;

  return (
    <div style={styles.tabContainer}>
      <h2 style={styles.formTitle}>📅 Modèles d'activités récurrentes</h2>
      <div style={styles.formGroup}>
        <input type="text" placeholder="Nom de l'activité" value={nom} onChange={e => setNom(e.target.value)} style={styles.input} />
        <select value={jour} onChange={e => setJour(e.target.value as typeof jour)} style={styles.input}>
          {jours.map(j => <option key={j} value={j}>{j.charAt(0).toUpperCase() + j.slice(1)}</option>)}
        </select>
        <select value={horaire} onChange={e => setHoraire(e.target.value as typeof horaire)} style={styles.input}>
          <option value="matin">10h - 12h (Matin)</option>
          <option value="apres-midi">14h - 16h (Après-midi)</option>
        </select>
        {pictogramme && <img src={pictogramme} alt="pictogramme" style={{ width: 80, height: 80, objectFit: "contain", borderRadius: "0.5rem" }} />}
        <button style={styles.btnSecondary} onClick={() => fileRef.current?.click()}>📷 Pictogramme</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePictogramme} />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {(data.residents || []).map(r => (
            <button
              key={r.id}
              onClick={() => setResidentIds(residentIds.includes(r.id) ? residentIds.filter(id => id !== r.id) : [...residentIds, r.id])}
              style={{ ...styles.chip, background: residentIds.includes(r.id) ? "#FFD600" : "#e0e0e0", color: residentIds.includes(r.id) ? "#000" : "#666" }}
            >
              {r.prenom}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {(data.educateurs || []).map(e => (
            <button
              key={e.id}
              onClick={() => setEducateurIds(educateurIds.includes(e.id) ? educateurIds.filter(id => id !== e.id) : [...educateurIds, e.id])}
              style={{ ...styles.chip, background: educateurIds.includes(e.id) ? "#4FC3F7" : "#e0e0e0", color: educateurIds.includes(e.id) ? "#000" : "#666" }}
            >
              {e.prenom}
            </button>
          ))}
        </div>
        {nom && (
          <div style={{ background: "oklch(0.18 0.04 240)", border: "2px solid #FFD600", borderRadius: "0.6rem", padding: "0.8rem", marginTop: "0.5rem" }}>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#FFD600", marginBottom: "0.4rem" }}>📋 Aperçu</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
              {pictogramme && <img src={pictogramme} alt="aperçu" style={{ width: 32, height: 32, objectFit: "contain" }} />}
              <strong style={{ color: "#fff" }}>{nom}</strong>
            </div>
            <div style={{ fontSize: "0.8rem", color: "oklch(0.65 0.02 240)" }}>{jour.charAt(0).toUpperCase() + jour.slice(1)} • {horaire === "matin" ? "10h-12h" : "14h-16h"}</div>
            <div style={{ fontSize: "0.8rem", color: "oklch(0.65 0.02 240)", marginTop: "0.2rem" }}>👤 {residentIds.length} résident(s) • 👥 {educateurIds.length} éducateur(s)</div>
          </div>
        )}
        <button style={styles.btnPrimary} onClick={handleSave}>{editId ? "✏️ Modifier" : "➕ Ajouter"}</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "400px", overflowY: "auto" }}>
        {(data.modeles || []).map(m => (
          <div key={m.id} style={styles.chip}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
              {m.pictogramme && <img src={m.pictogramme} alt={m.nom} style={{ width: 40, height: 40, objectFit: "contain" }} />}
              <div>
                <strong>{m.nom}</strong>
                <div style={{ fontSize: "0.75rem", color: "#666" }}>{m.jour} - {m.horaire === "matin" ? "10h-12h" : "14h-16h"}</div>
              </div>
            </div>
            <button
              style={{ ...styles.btnSmall, background: m.actif ? "#4CAF50" : "#ccc" }}
              onClick={() => updateModele(m.id, { actif: !m.actif })}
              title={m.actif ? "Désactiver" : "Activer"}
            >
              {m.actif ? "✓" : "✕"}
            </button>
            <button style={styles.btnSmall} onClick={() => startEdit(m.id)}>✏️</button>
            <button style={styles.btnSmall} onClick={() => handleClone(m.id)}>📋</button>
            <button style={styles.btnDanger} onClick={() => removeModele(m.id)}>🗑️</button>
          </div>
        ))}
        {(data.modeles || []).length === 0 && <EmptyState text="Aucun modèle créé" />}
      </div>
    </div>
  );
}

type MenuField = "imageRepas" | "imageFeculent" | "imageLegume" | "imageAccompagnement" | "imageDessert";

const MENU_CATEGORIES: { field: MenuField; label: string; emoji: string; optional: boolean }[] = [
  { field: "imageRepas", label: "Plat principal", emoji: "🍖", optional: false },
  { field: "imageFeculent", label: "Féculent", emoji: "🍚", optional: true },
  { field: "imageLegume", label: "Légume", emoji: "🥦", optional: true },
  { field: "imageAccompagnement", label: "Accompagnement", emoji: "🥗", optional: true },
  { field: "imageDessert", label: "Dessert", emoji: "🍮", optional: true },
];

function TabMenus() {
  const { data, updateMenu } = useData();

  async function handleImg(type: "midi" | "soir", field: MenuField, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) updateMenu(type, { [field]: await readFileAsDataURL(file) });
    e.target.value = "";
  }

  function CategorySlot({ type, field, label, emoji, optional }: { type: "midi" | "soir"; field: MenuField; label: string; emoji: string; optional: boolean }) {
    const menu = data.menus[type];
    const imageUrl = menu[field];
    const inputId = `menu-${type}-${field}`;

    return (
      <div style={{ flex: "1 1 180px", minWidth: 160, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={styles.subLabel}>{emoji} {label}{optional ? " (optionnel)" : ""}</div>
        {imageUrl ? (
          <img src={imageUrl} alt={label} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: "0.75rem" }} />
        ) : (
          <div style={{ width: "100%", height: 110, borderRadius: "0.75rem", background: "oklch(0.20 0.04 240)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "oklch(0.40 0.04 240)" }}>
            {emoji}
          </div>
        )}
        <label htmlFor={inputId} style={{ ...styles.btnSecondary, textAlign: "center", display: "block", cursor: "pointer" }}>
          📷 {imageUrl ? "Changer" : "Ajouter"}
        </label>
        <input id={inputId} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImg(type, field, e)} />
        {optional && imageUrl && (
          <button style={styles.btnDanger} onClick={() => updateMenu(type, { [field]: "" })}>🗑️ Retirer</button>
        )}
      </div>
    );
  }

  function MenuSection({ type, label }: { type: "midi" | "soir"; label: string }) {
    const menu = data.menus[type];
    return (
      <div className="kiosque-card" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", minWidth: 0 }}>
        <h3 style={{ ...styles.formTitle, color: type === "midi" ? "#81C784" : "#CE93D8" }}>{label}</h3>

        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          {MENU_CATEGORIES.map(cat => (
            <CategorySlot key={cat.field} type={type} field={cat.field} label={cat.label} emoji={cat.emoji} optional={cat.optional} />
          ))}
        </div>

        {/* Description */}
        <div>
          <div style={styles.subLabel}>Description du repas (lue à voix haute)</div>
          <textarea
            style={{...styles.input, minHeight: "80px", resize: "vertical"}}
            placeholder="Ex : Poulet rôti, riz, haricots verts, compote..."
            value={menu.description}
            onChange={e => updateMenu(type, { description: e.target.value })}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "1.5rem", height: "100%", overflowY: "auto", flexWrap: "wrap" }}>
      <MenuSection type="midi" label="🍽️ Menu du midi" />
      <MenuSection type="soir" label="🌙 Menu du soir" />
    </div>
  );
}

// ─── Composant vide ───────────────────────────────────────────────────────────
function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center", color: "oklch(0.55 0.02 240)", fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "1.1rem" }}>
      {text}
    </div>
  );
}

// ─── Styles partagés ──────────────────────────────────────────────────────────
const styles = {
  formTitle: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 800,
    fontSize: "1.2rem",
    color: "#FFD600",
    margin: 0,
  } as React.CSSProperties,
  input: {
    background: "oklch(0.22 0.04 240)",
    border: "2px solid oklch(0.35 0.04 240)",
    borderRadius: "0.6rem",
    color: "#fff",
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 600,
    fontSize: "1rem",
    padding: "0.6rem 0.9rem",
    width: "100%",
    outline: "none",
  } as React.CSSProperties,
  btnPrimary: {
    background: "#FFD600",
    color: "#0D1B2A",
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 800,
    fontSize: "1rem",
    border: "none",
    borderRadius: "0.6rem",
    padding: "0.7rem 1rem",
    cursor: "pointer",
    width: "100%",
  } as React.CSSProperties,
  btnSecondary: {
    background: "oklch(0.22 0.04 240)",
    color: "#fff",
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: "0.95rem",
    border: "2px solid oklch(0.35 0.04 240)",
    borderRadius: "0.6rem",
    padding: "0.6rem 1rem",
    cursor: "pointer",
    width: "100%",
  } as React.CSSProperties,
  btnDanger: {
    background: "#C62828",
    color: "#fff",
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: "0.9rem",
    border: "none",
    borderRadius: "0.6rem",
    padding: "0.5rem 0.8rem",
    cursor: "pointer",
  } as React.CSSProperties,
  btnEdit: {
    background: "#1565C0",
    color: "#fff",
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: "0.9rem",
    border: "none",
    borderRadius: "0.6rem",
    padding: "0.5rem 0.8rem",
    cursor: "pointer",
  } as React.CSSProperties,
  listName: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#fff",
  } as React.CSSProperties,
  subLabel: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: "0.85rem",
    color: "oklch(0.65 0.02 240)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: "0.3rem",
  } as React.CSSProperties,
  chip: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: "0.85rem",
    border: "none",
    borderRadius: "2rem",
    padding: "0.3rem 0.8rem",
    cursor: "pointer",
  } as React.CSSProperties,
  tabContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  } as React.CSSProperties,
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  } as React.CSSProperties,
  btnSmall: {
    background: "#1565C0",
    color: "#fff",
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 700,
    fontSize: "0.8rem",
    border: "none",
    borderRadius: "0.4rem",
    padding: "0.4rem 0.6rem",
    cursor: "pointer",
  } as React.CSSProperties,
};

// ─── Sous-composant : onglet Paramètres ──────────────────────────────────────
interface VilleResult {
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
}

function TabParametres() {
  const { data, updateNomFoyer, updateCodePin, updateVille } = useData();
  const [nomFoyer, setNomFoyer] = useState(data.nomFoyer);
  const [pinActuel, setPinActuel] = useState("");
  const [pinNouveau, setPinNouveau] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [msgNom, setMsgNom] = useState<string | null>(null);
  const [msgPin, setMsgPin] = useState<string | null>(null);
  const [msgVille, setMsgVille] = useState<string | null>(null);
  const [villeQuery, setVilleQuery] = useState(data.ville);
  const [villeResults, setVilleResults] = useState<VilleResult[]>([]);
  const [searchingVille, setSearchingVille] = useState(false);

  async function handleSaveNom() {
    if (!nomFoyer.trim()) return;
    await updateNomFoyer(nomFoyer.trim());
    setMsgNom("✅ Nom enregistré !");
    setTimeout(() => setMsgNom(null), 3000);
  }

  async function handleSearchVille() {
    const q = villeQuery.trim();
    if (!q) return;
    setSearchingVille(true);
    setVilleResults([]);
    try {
      // 1ère tentative en français
      let res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=fr&format=json`
      );
      let json = await res.json();

      // Fallback : si rien trouvé en français, on retente sans paramètre de langue
      if (!json.results || json.results.length === 0) {
        res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&format=json`
        );
        json = await res.json();
      }

      setVilleResults(json.results || []);
      if (!json.results || json.results.length === 0) {
        setMsgVille("❌ Aucune ville trouvée — essayez avec moins de lettres ou sans accent");
        setTimeout(() => setMsgVille(null), 4000);
      }
    } catch {
      setMsgVille("❌ Erreur de connexion au service météo");
      setTimeout(() => setMsgVille(null), 3000);
    } finally {
      setSearchingVille(false);
    }
  }

  async function handleSelectVille(v: VilleResult) {
    await updateVille(v.name, v.latitude, v.longitude);
    setVilleQuery(v.name);
    setVilleResults([]);
    setMsgVille(`✅ Ville météo réglée sur ${v.name}`);
    setTimeout(() => setMsgVille(null), 3000);
  }

  async function handleSavePin() {
    if (pinActuel !== data.codePin) {
      setMsgPin("❌ Code PIN actuel incorrect");
      setTimeout(() => setMsgPin(null), 3000);
      return;
    }
    if (pinNouveau.length < 4) {
      setMsgPin("❌ Le nouveau PIN doit contenir au moins 4 chiffres");
      setTimeout(() => setMsgPin(null), 3000);
      return;
    }
    if (pinNouveau !== pinConfirm) {
      setMsgPin("❌ Les deux nouveaux PIN ne correspondent pas");
      setTimeout(() => setMsgPin(null), 3000);
      return;
    }
    await updateCodePin(pinNouveau);
    setPinActuel(""); setPinNouveau(""); setPinConfirm("");
    setMsgPin("✅ Code PIN modifié avec succès !");
    setTimeout(() => setMsgPin(null), 3000);
  }

  const cardStyle: React.CSSProperties = {
    background: "oklch(0.16 0.04 240)",
    border: "2px solid oklch(0.30 0.04 240)",
    borderRadius: "1rem",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxWidth: 500,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", overflowY: "auto", paddingBottom: "2rem" }}>
      <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#FFD600", margin: 0 }}>
        ⚙️ Paramètres du Foyer
      </h3>

      {/* Nom du foyer */}
      <div style={cardStyle}>
        <h4 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff", margin: 0 }}>
          🏠 Nom de la borne
        </h4>
        <input
          type="text"
          value={nomFoyer}
          onChange={e => setNomFoyer(e.target.value)}
          style={styles.input}
          placeholder="Nom du foyer"
        />
        <button onClick={handleSaveNom} style={styles.btnPrimary}>
          💾 Enregistrer le nom
        </button>
        {msgNom && (
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, color: msgNom.startsWith("✅") ? "#81C784" : "#EF9A9A" }}>
            {msgNom}
          </div>
        )}
      </div>

      {/* Ville météo */}
      <div style={cardStyle}>
        <h4 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff", margin: 0 }}>
          🌤️ Ville pour la météo
        </h4>
        <div style={{ display: "flex", gap: "0.6rem", width: "100%" }}>
          <input
            type="text"
            value={villeQuery}
            onChange={e => setVilleQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearchVille()}
            style={{ ...styles.input, flex: "1 1 auto", minWidth: 0, width: "auto", fontSize: "1.1rem" }}
            placeholder="Ex: Bruxelles, Tournai, Mons..."
            autoComplete="off"
          />
          <button
            onClick={handleSearchVille}
            disabled={searchingVille}
            style={{ ...styles.btnPrimary, flex: "0 0 auto", width: "auto", paddingLeft: "1.4rem", paddingRight: "1.4rem" }}
          >
            {searchingVille ? "⏳" : "🔍 Chercher"}
          </button>
        </div>

        {villeResults.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {villeResults.map((v, i) => (
              <button
                key={i}
                onClick={() => handleSelectVille(v)}
                style={{
                  textAlign: "left",
                  background: "oklch(0.20 0.04 240)",
                  border: "1px solid oklch(0.32 0.04 240)",
                  borderRadius: "0.5rem",
                  padding: "0.6rem 0.9rem",
                  color: "#fff",
                  fontFamily: "'Baloo 2', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                📍 {v.name}{v.admin1 ? `, ${v.admin1}` : ""} ({v.country})
              </button>
            ))}
          </div>
        )}

        <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "oklch(0.65 0.02 240)" }}>
          Ville actuelle : <strong style={{ color: "#FFD600" }}>{data.ville}</strong>
        </div>

        {msgVille && (
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, color: msgVille.startsWith("✅") ? "#81C784" : "#EF9A9A" }}>
            {msgVille}
          </div>
        )}
      </div>

      {/* Changement de PIN */}
      <div style={cardStyle}>
        <h4 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#fff", margin: 0 }}>
          🔐 Changer le code PIN
        </h4>
        <label style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "oklch(0.65 0.02 240)", marginBottom: "-0.5rem" }}>
          Code PIN actuel
        </label>
        <input
          type="password"
          value={pinActuel}
          onChange={e => setPinActuel(e.target.value.replace(/\D/g, ""))}
          maxLength={8}
          placeholder="••••"
          style={styles.input}
        />
        <label style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "oklch(0.65 0.02 240)", marginBottom: "-0.5rem" }}>
          Nouveau code PIN
        </label>
        <input
          type="password"
          value={pinNouveau}
          onChange={e => setPinNouveau(e.target.value.replace(/\D/g, ""))}
          maxLength={8}
          placeholder="Min. 4 chiffres"
          style={styles.input}
        />
        <label style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "oklch(0.65 0.02 240)", marginBottom: "-0.5rem" }}>
          Confirmer le nouveau PIN
        </label>
        <input
          type="password"
          value={pinConfirm}
          onChange={e => setPinConfirm(e.target.value.replace(/\D/g, ""))}
          maxLength={8}
          placeholder="Répétez le nouveau PIN"
          style={styles.input}
        />
        <button onClick={handleSavePin} style={styles.btnPrimary}>
          🔐 Changer le PIN
        </button>
        {msgPin && (
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, color: msgPin.startsWith("✅") ? "#81C784" : "#EF9A9A" }}>
            {msgPin}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page principale Admin ────────────────────────────────────────────────────
export default function Admin() {
  const [, navigate] = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [showPin, setShowPin] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("residents");

  if (!authenticated) {
    if (showPin) {
      return (
        <PinDialog
          onSuccess={() => { setAuthenticated(true); setShowPin(false); }}
          onCancel={() => navigate("/")}
        />
      );
    }
    return null;
  }

  const TABS: { id: AdminTab; label: string; icon: string }[] = [
    { id: "residents", label: "Résidents", icon: "👤" },
    { id: "educateurs", label: "Éducateurs", icon: "👥" },
    { id: "activites", label: "Activités", icon: "🎨" },
    { id: "evenements", label: "Événements", icon: "📅" },
    { id: "modeles", label: "Modèles", icon: "📋" },
    { id: "menus", label: "Menus", icon: "🍽️" },
    { id: "parametres", label: "Paramètres", icon: "⚙️" },
  ];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "oklch(0.13 0.04 240)",
      }}
    >
      {/* En-tête admin */}
      <div
        style={{
          background: "oklch(0.16 0.04 240)",
          borderBottom: "2px solid oklch(0.30 0.04 240)",
          height: 70,
          display: "flex",
          alignItems: "center",
          padding: "0 1.5rem",
          gap: "1rem",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            background: "oklch(0.22 0.04 240)",
            border: "2px solid oklch(0.35 0.04 240)",
            borderRadius: "0.75rem",
            color: "#fff",
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          ← Accueil
        </button>

        <span
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: "1.5rem",
            color: "#FFD600",
          }}
        >
          🔐 Administration
        </span>

        {/* Onglets */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "#FFD600" : "oklch(0.22 0.04 240)",
                color: activeTab === tab.id ? "#0D1B2A" : "#fff",
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.5rem 1.2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu de l'onglet */}
      <div
        className="page-enter"
        style={{
          flex: 1,
          padding: "1.25rem",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeTab === "residents" && <TabResidents />}
        {activeTab === "educateurs" && <TabEducateurs />}
        {activeTab === "activites" && <TabActivites />}
        {activeTab === "evenements" && <TabEvenements />}
        {activeTab === "modeles" && <TabModeles />}
        {activeTab === "menus" && <TabMenus />}
        {activeTab === "parametres" && <TabParametres />}
      </div>
    </div>
  );
}

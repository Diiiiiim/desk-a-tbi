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

type AdminTab = "residents" | "educateurs" | "activites" | "evenements" | "modeles" | "menus" | "parametres";

// ─── Utilitaire : lecture fichier → base64 ────────────────────────────────────
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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

function TabMenus() {
  const { data, updateMenu } = useData();
  const fileRefs = {
    midiRepas: useRef<HTMLInputElement>(null),
    midiDessert: useRef<HTMLInputElement>(null),
    soirRepas: useRef<HTMLInputElement>(null),
    soirDessert: useRef<HTMLInputElement>(null),
  };

  async function handleImg(type: "midi" | "soir", field: "imageRepas" | "imageDessert", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) updateMenu(type, { [field]: await readFileAsDataURL(file) });
  }

  function MenuSection({ type, label }: { type: "midi" | "soir"; label: string }) {
    const menu = data.menus[type];
    return (
      <div className="kiosque-card" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ ...styles.formTitle, color: type === "midi" ? "#81C784" : "#CE93D8" }}>{label}</h3>

        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          {/* Repas principal */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={styles.subLabel}>Plat principal</div>
            {menu.imageRepas && <img src={menu.imageRepas} alt="repas" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: "0.75rem" }} />}
            <button style={styles.btnSecondary} onClick={() => fileRefs[`${type}Repas` as keyof typeof fileRefs].current?.click()}>
              📷 Changer l'image
            </button>
            <input ref={fileRefs[`${type}Repas` as keyof typeof fileRefs]} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImg(type, "imageRepas", e)} />
          </div>

          {/* Dessert */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={styles.subLabel}>Dessert (optionnel)</div>
            {menu.imageDessert && <img src={menu.imageDessert} alt="dessert" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: "0.75rem" }} />}
            <button style={styles.btnSecondary} onClick={() => fileRefs[`${type}Dessert` as keyof typeof fileRefs].current?.click()}>
              📷 {menu.imageDessert ? "Changer" : "Ajouter"} dessert
            </button>
            <input ref={fileRefs[`${type}Dessert` as keyof typeof fileRefs]} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImg(type, "imageDessert", e)} />
            {menu.imageDessert && (
              <button style={styles.btnDanger} onClick={() => updateMenu(type, { imageDessert: "" })}>🗑️ Retirer dessert</button>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <div style={styles.subLabel}>Description du repas</div>
          <textarea
            style={{...styles.input, minHeight: "80px", resize: "vertical"}}
            placeholder="Ex : Poulet rôti, haricots verts..."
            value={menu.description}
            onChange={e => updateMenu(type, { description: e.target.value })}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "1.5rem", height: "100%", overflow: "hidden" }}>
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

  // -- Onglet Parametres
  function TabParametres() {
    const { data, updateNomFoyer } = useData();
    const [nomFoyer, setNomFoyer] = useState(data.nomFoyer);

    function handleSave() {
      updateNomFoyer(nomFoyer.trim());
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#FFD600", margin: 0 }}>
          Parametres du Foyer
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", maxWidth: "500px" }}>
          <label style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
            Nom du foyer :
          </label>
          <input
            type="text"
            value={nomFoyer}
            onChange={e => setNomFoyer(e.target.value)}
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: "1rem",
              padding: "0.8rem",
              borderRadius: "0.5rem",
              border: "2px solid oklch(0.35 0.04 240)",
              background: "oklch(0.15 0.04 240)",
              color: "#fff",
            }}
          />
          <button
            onClick={handleSave}
            style={{
              background: "#FFD600",
              color: "#0D1B2A",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 800,
              fontSize: "1rem",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.8rem 1.5rem",
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    );
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

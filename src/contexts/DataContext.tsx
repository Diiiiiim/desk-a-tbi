/**
 * DataContext — Desk-A TBI
 * Supabase + Realtime, avec couche de compatibilité camelCase
 * pour les pages existantes (même API que l'ancienne version localStorage).
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, FOYER_ID } from '../lib/supabase';

// ─── Types compatibles avec les pages existantes ──────────────────────────────

export interface Resident {
  id: string;
  prenom: string;
  photo: string;
  dateNaissance?: string;
}

export interface Educateur {
  id: string;
  prenom: string;
  photo: string;
  presentAujourdhui: boolean;
  dateNaissance?: string;
}

export interface Activite {
  id: string;
  nom: string;
  horaire: 'matin' | 'apres-midi';
  pictogramme: string;
  residentIds: string[];
  educateurIds: string[];
}

export interface Evenement {
  id: string;
  titre: string;
  date: string;
  description: string;
  photo: string;
  residentIds: string[];
  educateurIds: string[];
}

export interface Menu {
  imageRepas: string;
  imageDessert: string;
  description: string;
}

export interface ModeleActivite {
  id: string;
  nom: string;
  jour: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche';
  horaire: 'matin' | 'apres-midi';
  pictogramme: string;
  residentIds: string[];
  educateurIds: string[];
  actif: boolean;
}

export interface AppData {
  residents: Resident[];
  educateurs: Educateur[];
  activites: Activite[];
  evenements: Evenement[];
  modeles: ModeleActivite[];
  menus: { midi: Menu; soir: Menu };
  nomFoyer: string;
}

// ─── Convertisseurs DB → App (snake_case → camelCase) ─────────────────────────

function dbToResident(r: any): Resident {
  return { id: r.id, prenom: r.prenom, photo: r.photo_url || '', dateNaissance: r.date_naissance };
}

function dbToEducateur(e: any): Educateur {
  return { id: e.id, prenom: e.prenom, photo: e.photo_url || '', presentAujourdhui: e.present_aujourd_hui, dateNaissance: e.date_naissance };
}

function dbToActivite(a: any): Activite {
  return { id: a.id, nom: a.nom, horaire: a.horaire, pictogramme: a.pictogramme_url || '', residentIds: a.resident_ids || [], educateurIds: a.educateur_ids || [] };
}

function dbToEvenement(e: any): Evenement {
  return { id: e.id, titre: e.titre, date: e.date_evenement, description: e.description, photo: e.photo_url || '', residentIds: e.resident_ids || [], educateurIds: e.educateur_ids || [] };
}

function dbToModele(m: any): ModeleActivite {
  return { id: m.id, nom: m.nom, jour: m.jour, horaire: m.horaire, pictogramme: m.pictogramme_url || '', residentIds: m.resident_ids || [], educateurIds: m.educateur_ids || [], actif: m.actif };
}

function dbToMenu(m: any): Menu {
  return { imageRepas: m.image_repas_url || '', imageDessert: m.image_dessert_url || '', description: m.description || '' };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface DataContextType {
  data: AppData;
  loading: boolean;
  addResident: (prenom: string, photo: string, dateNaissance?: string) => Promise<void>;
  updateResident: (id: string, updates: Partial<Resident>) => Promise<void>;
  removeResident: (id: string) => Promise<void>;
  addEducateur: (prenom: string, photo: string, dateNaissance?: string) => Promise<void>;
  updateEducateur: (id: string, updates: Partial<Educateur>) => Promise<void>;
  removeEducateur: (id: string) => Promise<void>;
  toggleEducateurPresence: (id: string) => Promise<void>;
  addActivite: (activite: Omit<Activite, 'id'>) => Promise<void>;
  updateActivite: (id: string, updates: Partial<Activite>) => Promise<void>;
  removeActivite: (id: string) => Promise<void>;
  addEvenement: (evenement: Omit<Evenement, 'id'>) => Promise<void>;
  updateEvenement: (id: string, updates: Partial<Evenement>) => Promise<void>;
  removeEvenement: (id: string) => Promise<void>;
  addModele: (modele: Omit<ModeleActivite, 'id'>) => Promise<void>;
  updateModele: (id: string, updates: Partial<ModeleActivite>) => Promise<void>;
  removeModele: (id: string) => Promise<void>;
  updateMenu: (type: 'midi' | 'soir', updates: Partial<Menu>) => Promise<void>;
  updateNomFoyer: (nom: string) => Promise<void>;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const today = new Date().toISOString().split('T')[0];

const DEFAULT_MENU: Menu = { imageRepas: '', imageDessert: '', description: '' };
const DEFAULT_APP_DATA: AppData = {
  residents: [], educateurs: [], activites: [], evenements: [], modeles: [],
  menus: { midi: DEFAULT_MENU, soir: DEFAULT_MENU },
  nomFoyer: 'Foyer — Borne Interactive',
};

// IDs menus du jour (pour upsert)
let menuMidiId: string | null = null;
let menuSoirId: string | null = null;

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppData>(DEFAULT_APP_DATA);
  const [loading, setLoading] = useState(true);

  // ── Helpers de rechargement ────────────────────────────────────────────────
  const reloadResidents = async () => {
    const { data } = await supabase.from('residents').select('*').eq('foyer_id', FOYER_ID).order('prenom');
    if (data) setAppData(prev => ({ ...prev, residents: data.map(dbToResident) }));
  };
  const reloadEducateurs = async () => {
    const { data } = await supabase.from('educateurs').select('*').eq('foyer_id', FOYER_ID).order('prenom');
    if (data) setAppData(prev => ({ ...prev, educateurs: data.map(dbToEducateur) }));
  };
  const reloadActivites = async () => {
    const { data } = await supabase.from('activites').select('*').eq('foyer_id', FOYER_ID).eq('date_activite', today);
    if (data) setAppData(prev => ({ ...prev, activites: data.map(dbToActivite) }));
  };
  const reloadEvenements = async () => {
    const { data } = await supabase.from('evenements').select('*').eq('foyer_id', FOYER_ID).order('date_evenement');
    if (data) setAppData(prev => ({ ...prev, evenements: data.map(dbToEvenement) }));
  };
  const reloadModeles = async () => {
    const { data } = await supabase.from('modeles_activites').select('*').eq('foyer_id', FOYER_ID).order('nom');
    if (data) setAppData(prev => ({ ...prev, modeles: data.map(dbToModele) }));
  };
  const reloadMenus = async () => {
    const { data } = await supabase.from('menus').select('*').eq('foyer_id', FOYER_ID).eq('date_menu', today);
    if (data) {
      const midi = data.find((m: any) => m.type === 'midi');
      const soir = data.find((m: any) => m.type === 'soir');
      if (midi) menuMidiId = midi.id;
      if (soir) menuSoirId = soir.id;
      setAppData(prev => ({
        ...prev,
        menus: {
          midi: midi ? dbToMenu(midi) : DEFAULT_MENU,
          soir: soir ? dbToMenu(soir) : DEFAULT_MENU,
        }
      }));
    }
  };

  // ── Chargement initial ────────────────────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [
        { data: foyerData },
        { data: residentsData },
        { data: educateursData },
        { data: activitesData },
        { data: evenementsData },
        { data: modelesData },
        { data: menusData },
      ] = await Promise.all([
        supabase.from('foyers').select('*').eq('id', FOYER_ID).single(),
        supabase.from('residents').select('*').eq('foyer_id', FOYER_ID).order('prenom'),
        supabase.from('educateurs').select('*').eq('foyer_id', FOYER_ID).order('prenom'),
        supabase.from('activites').select('*').eq('foyer_id', FOYER_ID).eq('date_activite', today),
        supabase.from('evenements').select('*').eq('foyer_id', FOYER_ID).order('date_evenement'),
        supabase.from('modeles_activites').select('*').eq('foyer_id', FOYER_ID).order('nom'),
        supabase.from('menus').select('*').eq('foyer_id', FOYER_ID).eq('date_menu', today),
      ]);

      const midi = menusData?.find((m: any) => m.type === 'midi');
      const soir = menusData?.find((m: any) => m.type === 'soir');
      if (midi) menuMidiId = midi.id;
      if (soir) menuSoirId = soir.id;

      setAppData({
        residents: (residentsData || []).map(dbToResident),
        educateurs: (educateursData || []).map(dbToEducateur),
        activites: (activitesData || []).map(dbToActivite),
        evenements: (evenementsData || []).map(dbToEvenement),
        modeles: (modelesData || []).map(dbToModele),
        menus: {
          midi: midi ? dbToMenu(midi) : DEFAULT_MENU,
          soir: soir ? dbToMenu(soir) : DEFAULT_MENU,
        },
        nomFoyer: foyerData?.nom || 'Foyer — Borne Interactive',
      });
      setLoading(false);
    }
    loadAll();
  }, []);

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`foyer-${FOYER_ID}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'residents', filter: `foyer_id=eq.${FOYER_ID}` }, reloadResidents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'educateurs', filter: `foyer_id=eq.${FOYER_ID}` }, reloadEducateurs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activites', filter: `foyer_id=eq.${FOYER_ID}` }, reloadActivites)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evenements', filter: `foyer_id=eq.${FOYER_ID}` }, reloadEvenements)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'modeles_activites', filter: `foyer_id=eq.${FOYER_ID}` }, reloadModeles)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menus', filter: `foyer_id=eq.${FOYER_ID}` }, reloadMenus)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Résidents ──────────────────────────────────────────────────────────────
  const addResident = useCallback(async (prenom: string, photo: string, dateNaissance?: string) => {
    await supabase.from('residents').insert({ foyer_id: FOYER_ID, prenom, photo_url: photo, date_naissance: dateNaissance || null });
  }, []);

  const updateResident = useCallback(async (id: string, updates: Partial<Resident>) => {
    const dbUpdates: any = {};
    if (updates.prenom !== undefined) dbUpdates.prenom = updates.prenom;
    if (updates.photo !== undefined) dbUpdates.photo_url = updates.photo;
    if (updates.dateNaissance !== undefined) dbUpdates.date_naissance = updates.dateNaissance;
    await supabase.from('residents').update(dbUpdates).eq('id', id);
  }, []);

  const removeResident = useCallback(async (id: string) => {
    await supabase.from('residents').delete().eq('id', id);
  }, []);

  // ── Éducateurs ─────────────────────────────────────────────────────────────
  const addEducateur = useCallback(async (prenom: string, photo: string, dateNaissance?: string) => {
    await supabase.from('educateurs').insert({ foyer_id: FOYER_ID, prenom, photo_url: photo, date_naissance: dateNaissance || null, present_aujourd_hui: true });
  }, []);

  const updateEducateur = useCallback(async (id: string, updates: Partial<Educateur>) => {
    const dbUpdates: any = {};
    if (updates.prenom !== undefined) dbUpdates.prenom = updates.prenom;
    if (updates.photo !== undefined) dbUpdates.photo_url = updates.photo;
    if (updates.dateNaissance !== undefined) dbUpdates.date_naissance = updates.dateNaissance;
    if (updates.presentAujourdhui !== undefined) dbUpdates.present_aujourd_hui = updates.presentAujourdhui;
    await supabase.from('educateurs').update(dbUpdates).eq('id', id);
  }, []);

  const removeEducateur = useCallback(async (id: string) => {
    await supabase.from('educateurs').delete().eq('id', id);
  }, []);

  const toggleEducateurPresence = useCallback(async (id: string) => {
    const educ = appData.educateurs.find(e => e.id === id);
    if (educ) await supabase.from('educateurs').update({ present_aujourd_hui: !educ.presentAujourdhui }).eq('id', id);
  }, [appData.educateurs]);

  // ── Activités ──────────────────────────────────────────────────────────────
  const addActivite = useCallback(async (activite: Omit<Activite, 'id'>) => {
    await supabase.from('activites').insert({
      foyer_id: FOYER_ID, nom: activite.nom, horaire: activite.horaire,
      pictogramme_url: activite.pictogramme, resident_ids: activite.residentIds,
      educateur_ids: activite.educateurIds, date_activite: today,
    });
  }, []);

  const updateActivite = useCallback(async (id: string, updates: Partial<Activite>) => {
    const dbUpdates: any = {};
    if (updates.nom !== undefined) dbUpdates.nom = updates.nom;
    if (updates.horaire !== undefined) dbUpdates.horaire = updates.horaire;
    if (updates.pictogramme !== undefined) dbUpdates.pictogramme_url = updates.pictogramme;
    if (updates.residentIds !== undefined) dbUpdates.resident_ids = updates.residentIds;
    if (updates.educateurIds !== undefined) dbUpdates.educateur_ids = updates.educateurIds;
    await supabase.from('activites').update(dbUpdates).eq('id', id);
  }, []);

  const removeActivite = useCallback(async (id: string) => {
    await supabase.from('activites').delete().eq('id', id);
  }, []);

  // ── Événements ────────────────────────────────────────────────────────────
  const addEvenement = useCallback(async (evenement: Omit<Evenement, 'id'>) => {
    await supabase.from('evenements').insert({
      foyer_id: FOYER_ID, titre: evenement.titre, date_evenement: evenement.date,
      description: evenement.description, photo_url: evenement.photo,
      resident_ids: evenement.residentIds, educateur_ids: evenement.educateurIds,
    });
  }, []);

  const updateEvenement = useCallback(async (id: string, updates: Partial<Evenement>) => {
    const dbUpdates: any = {};
    if (updates.titre !== undefined) dbUpdates.titre = updates.titre;
    if (updates.date !== undefined) dbUpdates.date_evenement = updates.date;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.photo !== undefined) dbUpdates.photo_url = updates.photo;
    if (updates.residentIds !== undefined) dbUpdates.resident_ids = updates.residentIds;
    if (updates.educateurIds !== undefined) dbUpdates.educateur_ids = updates.educateurIds;
    await supabase.from('evenements').update(dbUpdates).eq('id', id);
  }, []);

  const removeEvenement = useCallback(async (id: string) => {
    await supabase.from('evenements').delete().eq('id', id);
  }, []);

  // ── Modèles ───────────────────────────────────────────────────────────────
  const addModele = useCallback(async (modele: Omit<ModeleActivite, 'id'>) => {
    await supabase.from('modeles_activites').insert({
      foyer_id: FOYER_ID, nom: modele.nom, jour: modele.jour, horaire: modele.horaire,
      pictogramme_url: modele.pictogramme, resident_ids: modele.residentIds,
      educateur_ids: modele.educateurIds, actif: modele.actif,
    });
  }, []);

  const updateModele = useCallback(async (id: string, updates: Partial<ModeleActivite>) => {
    const dbUpdates: any = {};
    if (updates.nom !== undefined) dbUpdates.nom = updates.nom;
    if (updates.jour !== undefined) dbUpdates.jour = updates.jour;
    if (updates.horaire !== undefined) dbUpdates.horaire = updates.horaire;
    if (updates.pictogramme !== undefined) dbUpdates.pictogramme_url = updates.pictogramme;
    if (updates.residentIds !== undefined) dbUpdates.resident_ids = updates.residentIds;
    if (updates.educateurIds !== undefined) dbUpdates.educateur_ids = updates.educateurIds;
    if (updates.actif !== undefined) dbUpdates.actif = updates.actif;
    await supabase.from('modeles_activites').update(dbUpdates).eq('id', id);
  }, []);

  const removeModele = useCallback(async (id: string) => {
    await supabase.from('modeles_activites').delete().eq('id', id);
  }, []);

  // ── Menus ─────────────────────────────────────────────────────────────────
  const updateMenu = useCallback(async (type: 'midi' | 'soir', updates: Partial<Menu>) => {
    const dbUpdates: any = {};
    if (updates.imageRepas !== undefined) dbUpdates.image_repas_url = updates.imageRepas;
    if (updates.imageDessert !== undefined) dbUpdates.image_dessert_url = updates.imageDessert;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const existingId = type === 'midi' ? menuMidiId : menuSoirId;
    if (existingId) {
      await supabase.from('menus').update(dbUpdates).eq('id', existingId);
    } else {
      const { data } = await supabase.from('menus').upsert({
        foyer_id: FOYER_ID, type, date_menu: today,
        image_repas_url: '', image_dessert_url: '', description: '',
        ...dbUpdates,
      }, { onConflict: 'foyer_id,type,date_menu' }).select().single();
      if (data) {
        if (type === 'midi') menuMidiId = data.id;
        else menuSoirId = data.id;
      }
    }
  }, []);

  // ── Foyer ─────────────────────────────────────────────────────────────────
  const updateNomFoyer = useCallback(async (nom: string) => {
    await supabase.from('foyers').update({ nom }).eq('id', FOYER_ID);
    setAppData(prev => ({ ...prev, nomFoyer: nom }));
  }, []);

  const resetData = useCallback(() => {
    console.warn('resetData non implémenté en mode Supabase');
  }, []);

  return (
    <DataContext.Provider value={{
      data: appData, loading,
      addResident, updateResident, removeResident,
      addEducateur, updateEducateur, removeEducateur, toggleEducateurPresence,
      addActivite, updateActivite, removeActivite,
      addEvenement, updateEvenement, removeEvenement,
      addModele, updateModele, removeModele,
      updateMenu,
      updateNomFoyer,
      resetData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

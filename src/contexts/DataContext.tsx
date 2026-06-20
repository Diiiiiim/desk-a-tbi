/**
 * DataContext — Desk-A TBI
 * Supabase + Realtime, avec couche de compatibilité camelCase
 * pour les pages existantes (même API que l'ancienne version localStorage).
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
  imageFeculent: string;
  imageLegume: string;
  imageAccompagnement: string;
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

export interface TimelineMoment {
  id: string;
  heure: string; // format "HH:MM"
  label: string;
  emoji: string;
  ordre: number;
}

export interface AppData {
  residents: Resident[];
  educateurs: Educateur[];
  activites: Activite[];
  evenements: Evenement[];
  modeles: ModeleActivite[];
  menus: { midi: Menu; soir: Menu };
  timeline: TimelineMoment[];
  nomFoyer: string;
  codePin: string;
  ville: string;
  meteoLat: number;
  meteoLon: number;
  widgetMeteoActif: boolean;
  widgetAnniversaireActif: boolean;
  widgetTimelineActif: boolean;
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

function dbToTimelineMoment(t: any): TimelineMoment {
  return { id: t.id, heure: t.heure, label: t.label, emoji: t.emoji || '⏰', ordre: t.ordre ?? 0 };
}

function dbToMenu(m: any): Menu {
  return {
    imageRepas: m.image_repas_url || '',
    imageFeculent: m.image_feculent_url || '',
    imageLegume: m.image_legume_url || '',
    imageAccompagnement: m.image_accompagnement_url || '',
    imageDessert: m.image_dessert_url || '',
    description: m.description || '',
  };
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
  addTimelineMoment: (moment: Omit<TimelineMoment, 'id'>) => Promise<void>;
  updateTimelineMoment: (id: string, updates: Partial<TimelineMoment>) => Promise<void>;
  removeTimelineMoment: (id: string) => Promise<void>;
  updateMenu: (type: 'midi' | 'soir', updates: Partial<Menu>) => Promise<void>;
  updateNomFoyer: (nom: string) => Promise<void>;
  updateCodePin: (pin: string) => Promise<void>;
  updateVille: (ville: string, lat: number, lon: number) => Promise<void>;
  updateWidgets: (updates: { widgetMeteoActif?: boolean; widgetAnniversaireActif?: boolean; widgetTimelineActif?: boolean }) => Promise<void>;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const today = new Date().toISOString().split('T')[0];

const DEFAULT_MENU: Menu = { imageRepas: '', imageFeculent: '', imageLegume: '', imageAccompagnement: '', imageDessert: '', description: '' };
const DEFAULT_APP_DATA: AppData = {
  residents: [], educateurs: [], activites: [], evenements: [], modeles: [],
  menus: { midi: DEFAULT_MENU, soir: DEFAULT_MENU },
  timeline: [],
  nomFoyer: 'Foyer — Borne Interactive',
  codePin: '1234',
  ville: 'Peruwelz',
  meteoLat: 50.51,
  meteoLon: 3.59,
  widgetMeteoActif: true,
  widgetAnniversaireActif: true,
  widgetTimelineActif: true,
};

// IDs menus du jour (pour upsert)
let menuMidiId: string | null = null;
let menuSoirId: string | null = null;

export function DataProvider({ foyerId, children }: { foyerId: string; children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppData>(DEFAULT_APP_DATA);
  const [loading, setLoading] = useState(true);

  // ── Helpers de rechargement ────────────────────────────────────────────────
  const reloadResidents = async () => {
    const { data } = await supabase.from('residents').select('*').eq('foyer_id', foyerId).order('prenom');
    if (data) setAppData(prev => ({ ...prev, residents: data.map(dbToResident) }));
  };
  const reloadEducateurs = async () => {
    const { data } = await supabase.from('educateurs').select('*').eq('foyer_id', foyerId).order('prenom');
    if (data) setAppData(prev => ({ ...prev, educateurs: data.map(dbToEducateur) }));
  };
  const reloadActivites = async () => {
    const { data } = await supabase.from('activites').select('*').eq('foyer_id', foyerId).eq('date_activite', today);
    if (data) setAppData(prev => ({ ...prev, activites: data.map(dbToActivite) }));
  };
  const reloadEvenements = async () => {
    const { data } = await supabase.from('evenements').select('*').eq('foyer_id', foyerId).order('date_evenement');
    if (data) setAppData(prev => ({ ...prev, evenements: data.map(dbToEvenement) }));
  };
  const reloadModeles = async () => {
    const { data } = await supabase.from('modeles_activites').select('*').eq('foyer_id', foyerId).order('nom');
    if (data) setAppData(prev => ({ ...prev, modeles: data.map(dbToModele) }));
  };
  const reloadTimeline = async () => {
    const { data } = await supabase.from('timeline_moments').select('*').eq('foyer_id', foyerId).order('ordre');
    if (data) setAppData(prev => ({ ...prev, timeline: data.map(dbToTimelineMoment) }));
  };
  const reloadMenus = async () => {
    const { data } = await supabase.from('menus').select('*').eq('foyer_id', foyerId).eq('date_menu', today);
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
      try {
      const [
        { data: foyerData },
        { data: residentsData },
        { data: educateursData },
        { data: activitesData },
        { data: evenementsData },
        { data: modelesData },
        { data: menusData },
        { data: timelineData },
      ] = await Promise.all([
        supabase.from('foyers').select('*').eq('id', foyerId).single(),
        supabase.from('residents').select('*').eq('foyer_id', foyerId).order('prenom'),
        supabase.from('educateurs').select('*').eq('foyer_id', foyerId).order('prenom'),
        supabase.from('activites').select('*').eq('foyer_id', foyerId).eq('date_activite', today),
        supabase.from('evenements').select('*').eq('foyer_id', foyerId).order('date_evenement'),
        supabase.from('modeles_activites').select('*').eq('foyer_id', foyerId).order('nom'),
        supabase.from('menus').select('*').eq('foyer_id', foyerId).eq('date_menu', today),
        supabase.from('timeline_moments').select('*').eq('foyer_id', foyerId).order('ordre'),
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
        timeline: (timelineData || []).map(dbToTimelineMoment),
        nomFoyer: foyerData?.nom || 'Foyer — Borne Interactive',
        codePin: foyerData?.code_pin || '1234',
        ville: foyerData?.ville || 'Peruwelz',
        meteoLat: foyerData?.meteo_lat ?? 50.51,
        meteoLon: foyerData?.meteo_lon ?? 3.59,
        widgetMeteoActif: foyerData?.widget_meteo_actif ?? true,
        widgetAnniversaireActif: foyerData?.widget_anniversaire_actif ?? true,
        widgetTimelineActif: foyerData?.widget_timeline_actif ?? true,
      });
      setLoading(false);
      } catch (err) {
        console.error('Erreur chargement Supabase:', err);
        setLoading(false);
      }
    }
    loadAll();
  }, [foyerId]);

  // ── Realtime ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`foyer-${foyerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'residents', filter: `foyer_id=eq.${foyerId}` }, reloadResidents)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'educateurs', filter: `foyer_id=eq.${foyerId}` }, reloadEducateurs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activites', filter: `foyer_id=eq.${foyerId}` }, reloadActivites)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evenements', filter: `foyer_id=eq.${foyerId}` }, reloadEvenements)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'modeles_activites', filter: `foyer_id=eq.${foyerId}` }, reloadModeles)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_moments', filter: `foyer_id=eq.${foyerId}` }, reloadTimeline)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menus', filter: `foyer_id=eq.${foyerId}` }, reloadMenus)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [foyerId]);

  // ── Résidents ──────────────────────────────────────────────────────────────
  const addResident = useCallback(async (prenom: string, photo: string, dateNaissance?: string) => {
    await supabase.from('residents').insert({ foyer_id: foyerId, prenom, photo_url: photo, date_naissance: dateNaissance || null });
  }, [foyerId]);

  const updateResident = useCallback(async (id: string, updates: Partial<Resident>) => {
    const dbUpdates: any = {};
    if (updates.prenom !== undefined) dbUpdates.prenom = updates.prenom;
    if (updates.photo !== undefined) dbUpdates.photo_url = updates.photo;
    if (updates.dateNaissance !== undefined) dbUpdates.date_naissance = updates.dateNaissance;
    await supabase.from('residents').update(dbUpdates).eq('id', id);
  }, [foyerId]);

  const removeResident = useCallback(async (id: string) => {
    await supabase.from('residents').delete().eq('id', id);
  }, [foyerId]);

  // ── Éducateurs ─────────────────────────────────────────────────────────────
  const addEducateur = useCallback(async (prenom: string, photo: string, dateNaissance?: string) => {
    await supabase.from('educateurs').insert({ foyer_id: foyerId, prenom, photo_url: photo, date_naissance: dateNaissance || null, present_aujourd_hui: true });
  }, [foyerId]);

  const updateEducateur = useCallback(async (id: string, updates: Partial<Educateur>) => {
    const dbUpdates: any = {};
    if (updates.prenom !== undefined) dbUpdates.prenom = updates.prenom;
    if (updates.photo !== undefined) dbUpdates.photo_url = updates.photo;
    if (updates.dateNaissance !== undefined) dbUpdates.date_naissance = updates.dateNaissance;
    if (updates.presentAujourdhui !== undefined) dbUpdates.present_aujourd_hui = updates.presentAujourdhui;
    await supabase.from('educateurs').update(dbUpdates).eq('id', id);
  }, [foyerId]);

  const removeEducateur = useCallback(async (id: string) => {
    await supabase.from('educateurs').delete().eq('id', id);
  }, [foyerId]);

  const toggleEducateurPresence = useCallback(async (id: string) => {
    const educ = appData.educateurs.find(e => e.id === id);
    if (educ) await supabase.from('educateurs').update({ present_aujourd_hui: !educ.presentAujourdhui }).eq('id', id);
  }, [appData.educateurs, foyerId]);

  // ── Activités ──────────────────────────────────────────────────────────────
  const addActivite = useCallback(async (activite: Omit<Activite, 'id'>) => {
    await supabase.from('activites').insert({
      foyer_id: foyerId, nom: activite.nom, horaire: activite.horaire,
      pictogramme_url: activite.pictogramme, resident_ids: activite.residentIds,
      educateur_ids: activite.educateurIds, date_activite: today,
    });
  }, [foyerId]);

  const updateActivite = useCallback(async (id: string, updates: Partial<Activite>) => {
    const dbUpdates: any = {};
    if (updates.nom !== undefined) dbUpdates.nom = updates.nom;
    if (updates.horaire !== undefined) dbUpdates.horaire = updates.horaire;
    if (updates.pictogramme !== undefined) dbUpdates.pictogramme_url = updates.pictogramme;
    if (updates.residentIds !== undefined) dbUpdates.resident_ids = updates.residentIds;
    if (updates.educateurIds !== undefined) dbUpdates.educateur_ids = updates.educateurIds;
    await supabase.from('activites').update(dbUpdates).eq('id', id);
  }, [foyerId]);

  const removeActivite = useCallback(async (id: string) => {
    await supabase.from('activites').delete().eq('id', id);
  }, [foyerId]);

  // ── Événements ────────────────────────────────────────────────────────────
  const addEvenement = useCallback(async (evenement: Omit<Evenement, 'id'>) => {
    await supabase.from('evenements').insert({
      foyer_id: foyerId, titre: evenement.titre, date_evenement: evenement.date,
      description: evenement.description, photo_url: evenement.photo,
      resident_ids: evenement.residentIds, educateur_ids: evenement.educateurIds,
    });
  }, [foyerId]);

  const updateEvenement = useCallback(async (id: string, updates: Partial<Evenement>) => {
    const dbUpdates: any = {};
    if (updates.titre !== undefined) dbUpdates.titre = updates.titre;
    if (updates.date !== undefined) dbUpdates.date_evenement = updates.date;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.photo !== undefined) dbUpdates.photo_url = updates.photo;
    if (updates.residentIds !== undefined) dbUpdates.resident_ids = updates.residentIds;
    if (updates.educateurIds !== undefined) dbUpdates.educateur_ids = updates.educateurIds;
    await supabase.from('evenements').update(dbUpdates).eq('id', id);
  }, [foyerId]);

  const removeEvenement = useCallback(async (id: string) => {
    await supabase.from('evenements').delete().eq('id', id);
  }, [foyerId]);

  // ── Modèles ───────────────────────────────────────────────────────────────
  const addModele = useCallback(async (modele: Omit<ModeleActivite, 'id'>) => {
    await supabase.from('modeles_activites').insert({
      foyer_id: foyerId, nom: modele.nom, jour: modele.jour, horaire: modele.horaire,
      pictogramme_url: modele.pictogramme, resident_ids: modele.residentIds,
      educateur_ids: modele.educateurIds, actif: modele.actif,
    });
  }, [foyerId]);

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
  }, [foyerId]);

  const removeModele = useCallback(async (id: string) => {
    await supabase.from('modeles_activites').delete().eq('id', id);
  }, [foyerId]);

  // ── Timeline (ligne du temps) ────────────────────────────────────────────────
  const addTimelineMoment = useCallback(async (moment: Omit<TimelineMoment, 'id'>) => {
    await supabase.from('timeline_moments').insert({
      foyer_id: foyerId, heure: moment.heure, label: moment.label, emoji: moment.emoji, ordre: moment.ordre,
    });
  }, [foyerId]);

  const updateTimelineMoment = useCallback(async (id: string, updates: Partial<TimelineMoment>) => {
    const dbUpdates: any = {};
    if (updates.heure !== undefined) dbUpdates.heure = updates.heure;
    if (updates.label !== undefined) dbUpdates.label = updates.label;
    if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
    if (updates.ordre !== undefined) dbUpdates.ordre = updates.ordre;
    await supabase.from('timeline_moments').update(dbUpdates).eq('id', id);
  }, [foyerId]);

  const removeTimelineMoment = useCallback(async (id: string) => {
    await supabase.from('timeline_moments').delete().eq('id', id);
  }, [foyerId]);

  // ── Menus ─────────────────────────────────────────────────────────────────
  const updateMenu = useCallback(async (type: 'midi' | 'soir', updates: Partial<Menu>) => {
    const dbUpdates: any = {};
    if (updates.imageRepas !== undefined) dbUpdates.image_repas_url = updates.imageRepas;
    if (updates.imageFeculent !== undefined) dbUpdates.image_feculent_url = updates.imageFeculent;
    if (updates.imageLegume !== undefined) dbUpdates.image_legume_url = updates.imageLegume;
    if (updates.imageAccompagnement !== undefined) dbUpdates.image_accompagnement_url = updates.imageAccompagnement;
    if (updates.imageDessert !== undefined) dbUpdates.image_dessert_url = updates.imageDessert;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const existingId = type === 'midi' ? menuMidiId : menuSoirId;
    if (existingId) {
      await supabase.from('menus').update(dbUpdates).eq('id', existingId);
    } else {
      const { data } = await supabase.from('menus').upsert({
        foyer_id: foyerId, type, date_menu: today,
        image_repas_url: '', image_feculent_url: '', image_legume_url: '',
        image_accompagnement_url: '', image_dessert_url: '', description: '',
        ...dbUpdates,
      }, { onConflict: 'foyer_id,type,date_menu' }).select().single();
      if (data) {
        if (type === 'midi') menuMidiId = data.id;
        else menuSoirId = data.id;
      }
    }
  }, [foyerId]);

  // ── Foyer ─────────────────────────────────────────────────────────────────
  const updateCodePin = useCallback(async (pin: string) => {
    await supabase.from('foyers').update({ code_pin: pin }).eq('id', foyerId);
    setAppData(prev => ({ ...prev, codePin: pin }));
  }, [foyerId]);

  const updateVille = useCallback(async (ville: string, lat: number, lon: number) => {
    await supabase.from('foyers').update({ ville, meteo_lat: lat, meteo_lon: lon }).eq('id', foyerId);
    setAppData(prev => ({ ...prev, ville, meteoLat: lat, meteoLon: lon }));
  }, [foyerId]);

  const updateWidgets = useCallback(async (updates: { widgetMeteoActif?: boolean; widgetAnniversaireActif?: boolean; widgetTimelineActif?: boolean }) => {
    const dbUpdates: any = {};
    if (updates.widgetMeteoActif !== undefined) dbUpdates.widget_meteo_actif = updates.widgetMeteoActif;
    if (updates.widgetAnniversaireActif !== undefined) dbUpdates.widget_anniversaire_actif = updates.widgetAnniversaireActif;
    if (updates.widgetTimelineActif !== undefined) dbUpdates.widget_timeline_actif = updates.widgetTimelineActif;
    await supabase.from('foyers').update(dbUpdates).eq('id', foyerId);
    setAppData(prev => ({ ...prev, ...updates }));
  }, [foyerId]);

  const updateNomFoyer = useCallback(async (nom: string) => {
    await supabase.from('foyers').update({ nom }).eq('id', foyerId);
    setAppData(prev => ({ ...prev, nomFoyer: nom }));
  }, [foyerId]);

  const resetData = useCallback(() => {
    console.warn('resetData non implémenté en mode Supabase');
  }, [foyerId]);

  return (
    <DataContext.Provider value={{
      data: appData, loading,
      addResident, updateResident, removeResident,
      addEducateur, updateEducateur, removeEducateur, toggleEducateurPresence,
      addActivite, updateActivite, removeActivite,
      addEvenement, updateEvenement, removeEvenement,
      addModele, updateModele, removeModele,
      addTimelineMoment, updateTimelineMoment, removeTimelineMoment,
      updateMenu,
      updateNomFoyer,
      updateCodePin,
      updateVille,
      updateWidgets,
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

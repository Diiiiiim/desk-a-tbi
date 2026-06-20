/**
 * FoyerContext — Résolution multi-foyers
 * Lit le slug dans l'URL (/f/:slug) et résout le foyer_id correspondant
 * depuis Supabase. Toute l'app (DataContext, PinDialog, Meteo) lit
 * ensuite le foyer_id depuis ce contexte plutôt qu'une constante fixe.
 *
 * Vérifie aussi le statut "actif" du foyer : un foyer mis en pause
 * par le Super Admin remonte `suspended: true` plutôt que ses données.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface FoyerContextType {
  foyerId: string | null;
  slug: string | null;
  nom: string | null;
  loading: boolean;
  notFound: boolean;
  suspended: boolean;
}

const FoyerContext = createContext<FoyerContextType>({
  foyerId: null,
  slug: null,
  nom: null,
  loading: true,
  notFound: false,
  suspended: false,
});

export function FoyerProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [foyerId, setFoyerId] = useState<string | null>(null);
  const [nom, setNom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      setLoading(true);
      setNotFound(false);
      setSuspended(false);
      const { data, error } = await supabase
        .from('foyers')
        .select('id, nom, actif')
        .eq('slug', slug)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
        setFoyerId(null);
      } else if (data.actif === false) {
        setSuspended(true);
        setFoyerId(null);
        setNom(data.nom);
      } else {
        setFoyerId(data.id);
        setNom(data.nom);
      }
      setLoading(false);
    }
    resolve();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <FoyerContext.Provider value={{ foyerId, slug, nom, loading, notFound, suspended }}>
      {children}
    </FoyerContext.Provider>
  );
}

export function useFoyer() {
  return useContext(FoyerContext);
}

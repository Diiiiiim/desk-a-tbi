/**
 * FoyerContext — Résolution multi-foyers
 * Lit le slug dans l'URL (/f/:slug) et résout le foyer_id correspondant
 * depuis Supabase. Toute l'app (DataContext, PinDialog, Meteo) lit
 * ensuite le foyer_id depuis ce contexte plutôt qu'une constante fixe.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface FoyerContextType {
  foyerId: string | null;
  slug: string | null;
  loading: boolean;
  notFound: boolean;
}

const FoyerContext = createContext<FoyerContextType>({
  foyerId: null,
  slug: null,
  loading: true,
  notFound: false,
});

export function FoyerProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const [foyerId, setFoyerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await supabase
        .from('foyers')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
        setFoyerId(null);
      } else {
        setFoyerId(data.id);
      }
      setLoading(false);
    }
    resolve();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <FoyerContext.Provider value={{ foyerId, slug, loading, notFound }}>
      {children}
    </FoyerContext.Provider>
  );
}

export function useFoyer() {
  return useContext(FoyerContext);
}

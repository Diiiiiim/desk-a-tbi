/**
 * App.tsx — Desk-A TBI (multi-foyers)
 *
 * Architecture d'URL :
 *   /                  → liste des foyers disponibles
 *   /f/:slug           → accueil du foyer
 *   /f/:slug/activites → etc. (toutes les routes existantes, inchangées)
 *
 * Le slug est extrait de l'URL réelle puis utilisé comme `base` Wouter,
 * ce qui permet à toutes les pages existantes de continuer à naviguer
 * avec des chemins absolus ("/activites", "/admin", ...) sans aucune
 * modification : Wouter ajoute/retire le préfixe /f/:slug automatiquement.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Router as WouterRouter, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import { FoyerProvider, useFoyer } from "./contexts/FoyerContext";
import FoyerSelector from "./pages/FoyerSelector";
import FoyerNotFound from "./pages/FoyerNotFound";
import SuperAdmin from "./pages/SuperAdmin";
import Home from "./pages/Home";
import Activites from "./pages/Activites";
import MenuPage from "./pages/MenuPage";
import Educateurs from "./pages/Educateurs";
import Informations from "./pages/Informations";
import Meteo from "./pages/Meteo";
import Communication from "./pages/Communication";
import Anniversaires from "./pages/Anniversaires";
import Admin from "./pages/Admin";

function FoyerRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/activites" component={Activites} />
      <Route path="/menu-midi">
        {() => <MenuPage type="midi" />}
      </Route>
      <Route path="/menu-soir">
        {() => <MenuPage type="soir" />}
      </Route>
      <Route path="/educateurs" component={Educateurs} />
      <Route path="/informations" component={Informations} />
      <Route path="/meteo" component={Meteo} />
      <Route path="/communication" component={Communication} />
      <Route path="/anniversaires" component={Anniversaires} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

/** Résout le slug → foyer_id, puis monte les données + les routes du foyer */
function FoyerApp({ slug }: { slug: string }) {
  return (
    <FoyerProvider slug={slug}>
      <FoyerGate slug={slug} />
    </FoyerProvider>
  );
}

function FoyerGate({ slug }: { slug: string }) {
  const { foyerId, loading, notFound } = useFoyer();

  if (notFound) {
    return <FoyerNotFound slug={slug} />;
  }

  if (loading || !foyerId) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "oklch(0.13 0.04 240)",
          color: "#FFD600",
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 700,
          fontSize: "1.4rem",
        }}
      >
        ⏳ Chargement du foyer...
      </div>
    );
  }

  return (
    <DataProvider foyerId={foyerId}>
      <WouterRouter base={`/f/${slug}`}>
        <FoyerRoutes />
      </WouterRouter>
    </DataProvider>
  );
}

/** Détermine quoi afficher selon l'URL réelle du navigateur */
function RootRouter() {
  const path = window.location.pathname;

  if (path === "/super-admin" || path.startsWith("/super-admin/")) {
    return <SuperAdmin />;
  }

  const match = path.match(/^\/f\/([^/]+)/);

  if (match) {
    const slug = match[1];
    return <FoyerApp slug={slug} />;
  }

  return <FoyerSelector />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <RootRouter />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

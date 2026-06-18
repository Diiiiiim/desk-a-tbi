/**
 * App.tsx — Desk-A TBI
 * Frontend-only : React + Supabase (sans Express / tRPC / Drizzle)
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import Home from "./pages/Home";
import Activites from "./pages/Activites";
import MenuPage from "./pages/MenuPage";
import Educateurs from "./pages/Educateurs";
import Informations from "./pages/Informations";
import Meteo from "./pages/Meteo";
import Communication from "./pages/Communication";
import Anniversaires from "./pages/Anniversaires";
import Admin from "./pages/Admin";

function Router() {
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

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

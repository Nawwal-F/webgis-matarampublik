import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LocationFeature } from "@/data/types";

export type BasemapId = "standard" | "satellite" | "topo" | "light" | "dark";
export type Theme = "light" | "dark";

export interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  basemap: BasemapId;
  setBasemap: (id: BasemapId) => void;
  routeFrom: RoutePoint | null;
  setRouteFrom: (p: RoutePoint | null) => void;
  routeTo: RoutePoint | null;
  setRouteTo: (p: RoutePoint | null) => void;
  routePickMode: "from" | "to" | null;
  setRoutePickMode: (m: "from" | "to" | null) => void;
  routePanelOpen: boolean;
  setRoutePanelOpen: (o: boolean) => void;
  setRouteToFeature: (f: LocationFeature) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [basemap, setBasemap] = useState<BasemapId>("standard");
  const [routeFrom, setRouteFrom] = useState<RoutePoint | null>(null);
  const [routeTo, setRouteTo] = useState<RoutePoint | null>(null);
  const [routePickMode, setRoutePickMode] = useState<"from" | "to" | null>(null);
  const [routePanelOpen, setRoutePanelOpen] = useState(false);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const setRouteToFeature = (f: LocationFeature) => {
    const [lng, lat] = f.geometry.coordinates;
    const label = f.properties.name || "Lokasi Tujuan";
    setRouteTo({ lat, lng, label });
    setRoutePanelOpen(true);
  };

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      basemap, setBasemap,
      routeFrom, setRouteFrom,
      routeTo, setRouteTo,
      routePickMode, setRoutePickMode,
      routePanelOpen, setRoutePanelOpen,
      setRouteToFeature,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

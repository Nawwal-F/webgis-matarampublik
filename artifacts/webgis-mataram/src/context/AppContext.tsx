import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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
  bookmarks: number[];
  toggleBookmark: (osmId: number) => void;
  isBookmarked: (osmId: number) => boolean;
  bookmarksPanelOpen: boolean;
  setBookmarksPanelOpen: (o: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadBookmarks(): number[] {
  try {
    return JSON.parse(localStorage.getItem("webgis-bookmarks") ?? "[]");
  } catch {
    return [];
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [basemap, setBasemap] = useState<BasemapId>("standard");
  const [routeFrom, setRouteFrom] = useState<RoutePoint | null>(null);
  const [routeTo, setRouteTo] = useState<RoutePoint | null>(null);
  const [routePickMode, setRoutePickMode] = useState<"from" | "to" | null>(null);
  const [routePanelOpen, setRoutePanelOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>(loadBookmarks);
  const [bookmarksPanelOpen, setBookmarksPanelOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("webgis-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const setRouteToFeature = (f: LocationFeature) => {
    const [lng, lat] = f.geometry.coordinates;
    const label = f.properties.name || "Lokasi Tujuan";
    setRouteTo({ lat, lng, label });
    setRoutePanelOpen(true);
  };

  const toggleBookmark = useCallback((osmId: number) => {
    setBookmarks((prev) =>
      prev.includes(osmId) ? prev.filter((id) => id !== osmId) : [...prev, osmId]
    );
  }, []);

  const isBookmarked = useCallback((osmId: number) => bookmarks.includes(osmId), [bookmarks]);

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      basemap, setBasemap,
      routeFrom, setRouteFrom,
      routeTo, setRouteTo,
      routePickMode, setRoutePickMode,
      routePanelOpen, setRoutePanelOpen,
      setRouteToFeature,
      bookmarks, toggleBookmark, isBookmarked,
      bookmarksPanelOpen, setBookmarksPanelOpen,
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

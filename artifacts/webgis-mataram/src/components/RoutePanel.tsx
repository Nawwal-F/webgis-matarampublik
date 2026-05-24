import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useApp } from "@/context/AppContext";
import { LocationFeature, getCategoryKey, getDisplayName, CATEGORIES } from "@/data/types";

interface RoutePanelProps {
  features: LocationFeature[];
  onGPSRequest: (cb: (lat: number, lng: number) => void) => void;
}

interface RouteResult {
  distance: number;
  duration: number;
  geometry: { type: string; coordinates: [number, number][] };
  steps: { maneuver: { instruction?: string; type: string }; name: string; distance: number; duration: number }[];
}

function getStepIcon(type?: string): string {
  switch (type) {
    case "turn": return "↩️";
    case "merge": return "↗️";
    case "arrive": return "🎯";
    case "depart": return "🚶";
    case "roundabout": return "🔄";
    default: return "➡️";
  }
}

export function RoutePanelInner({ features, onGPSRequest }: RoutePanelProps) {
  const map = useMap();
  const {
    routeFrom, setRouteFrom,
    routeTo, setRouteTo,
    routePickMode, setRoutePickMode,
    routePanelOpen, setRoutePanelOpen,
    theme,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [fromResults, setFromResults] = useState<LocationFeature[]>([]);
  const [toResults, setToResults] = useState<LocationFeature[]>([]);
  const routeLayersRef = useRef<L.Layer[]>([]);
  const isDark = theme === "dark";

  const searchFeatures = useCallback((q: string) => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return features
      .filter((f) => {
        const name = getDisplayName(f.properties).toLowerCase();
        const cat = CATEGORIES[getCategoryKey(f.properties)].label.toLowerCase();
        return name.includes(lower) || cat.includes(lower);
      })
      .slice(0, 6);
  }, [features]);

  useEffect(() => { setFromResults(searchFeatures(fromQuery)); }, [fromQuery, searchFeatures]);
  useEffect(() => { setToResults(searchFeatures(toQuery)); }, [toQuery, searchFeatures]);

  useEffect(() => {
    if (routeFrom) setFromQuery(routeFrom.label);
  }, [routeFrom]);
  useEffect(() => {
    if (routeTo) setToQuery(routeTo.label);
  }, [routeTo]);

  const clearRoute = useCallback(() => {
    routeLayersRef.current.forEach((l) => l.remove());
    routeLayersRef.current = [];
    setResult(null);
    setError(null);
  }, []);

  const drawRoute = useCallback((
    geom: RouteResult["geometry"],
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ) => {
    routeLayersRef.current.forEach((l) => l.remove());
    routeLayersRef.current = [];

    const latlngs = geom.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);

    const shadow = L.polyline(latlngs, { color: "#000", weight: 8, opacity: 0.1, lineCap: "round" }).addTo(map);
    const poly = L.polyline(latlngs, { color: "#16a34a", weight: 5, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo(map);

    const fromIcon = L.divIcon({
      className: "",
      html: `<div style="width:30px;height:30px;background:#3b82f6;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-size:14px;line-height:1;">🚶</div>`,
      iconSize: [30, 30], iconAnchor: [15, 15],
    });
    const toIcon = L.divIcon({
      className: "",
      html: `<div style="width:30px;height:30px;background:#ef4444;border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-size:14px;line-height:1;">🎯</div>`,
      iconSize: [30, 30], iconAnchor: [15, 15],
    });

    const mFrom = L.marker([from.lat, from.lng], { icon: fromIcon, zIndexOffset: 3000 }).addTo(map);
    const mTo = L.marker([to.lat, to.lng], { icon: toIcon, zIndexOffset: 3000 }).addTo(map);

    routeLayersRef.current = [shadow, poly, mFrom, mTo];
    map.fitBounds(poly.getBounds(), { padding: [80, 80] });
  }, [map]);

  const calculateRoute = useCallback(async () => {
    if (!routeFrom || !routeTo) return;
    setLoading(true);
    setError(null);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${routeFrom.lng},${routeFrom.lat};${routeTo.lng},${routeTo.lat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code !== "Ok" || !data.routes?.length) {
        throw new Error("Rute tidak ditemukan. Coba lokasi lain.");
      }
      const route = data.routes[0];
      const routeResult: RouteResult = {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        steps: route.legs?.[0]?.steps ?? [],
      };
      setResult(routeResult);
      drawRoute(routeResult.geometry, routeFrom, routeTo);
    } catch (e: unknown) {
      setError((e as Error).message ?? "Gagal menghitung rute.");
    } finally {
      setLoading(false);
    }
  }, [routeFrom, routeTo, drawRoute]);

  const handleGPS = useCallback(() => {
    onGPSRequest((lat, lng) => {
      setRouteFrom({ lat, lng, label: "Lokasi Saya (GPS)" });
    });
  }, [onGPSRequest, setRouteFrom]);

  const handleClose = useCallback(() => {
    setRoutePanelOpen(false);
    setRoutePickMode(null);
    clearRoute();
  }, [setRoutePanelOpen, setRoutePickMode, clearRoute]);

  const formatDistance = (m: number) =>
    m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;

  const formatDuration = (s: number) => {
    const m = Math.round(s / 60);
    if (m >= 60) return `${Math.floor(m / 60)} j ${m % 60} mnt`;
    return `${m} menit`;
  };

  const panelBg = isDark ? "bg-gray-900/98 border-gray-700/50" : "bg-white/98 border-gray-100";
  const cardBg = isDark ? "bg-gray-800/70 border-gray-700/40" : "bg-gray-50 border-gray-100";
  const inputCls = isDark
    ? "bg-gray-800 border-gray-600/60 text-gray-100 placeholder-gray-500 focus:ring-green-500/30"
    : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-green-400/30";
  const itemBg = isDark ? "bg-gray-800/60" : "bg-gray-50";
  const textPrimary = isDark ? "text-gray-100" : "text-gray-800";
  const textMuted = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <AnimatePresence>
      {routePanelOpen && (
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 36 }}
          className={`fixed left-0 top-0 h-full w-full max-w-sm shadow-2xl z-[850] flex flex-col border-r ${panelBg}`}
          style={{ backdropFilter: "blur(20px)" }}
        >
          {/* Header */}
          <div className={`flex-shrink-0 px-5 pt-14 pb-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-100"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center text-xl">🧭</div>
                <div>
                  <h2 className={`text-base font-bold leading-tight ${textPrimary}`}>Perencanaan Rute</h2>
                  <p className={`text-xs ${textMuted}`}>Hitung rute terbaik antar lokasi</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors ${
                  isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                }`}
              >✕</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-4 space-y-4">

              {/* FROM */}
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">A</span>
                  Titik Awal
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fromQuery}
                    onChange={(e) => { setFromQuery(e.target.value); setRouteFrom(null); }}
                    placeholder="Ketik nama lokasi..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 ${inputCls}`}
                  />
                  <AnimatePresence>
                    {fromResults.length > 0 && !routeFrom && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={`absolute top-full mt-1 w-full rounded-xl border shadow-xl z-10 overflow-hidden ${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-100"}`}
                      >
                        {fromResults.map((f, i) => {
                          const info = CATEGORIES[getCategoryKey(f.properties)];
                          return (
                            <button key={i} onClick={() => {
                              const [lng, lat] = f.geometry.coordinates;
                              setRouteFrom({ lat, lng, label: getDisplayName(f.properties) });
                              setFromQuery(getDisplayName(f.properties));
                              setFromResults([]);
                            }} className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors text-sm ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-50 text-gray-700"}`}>
                              <span>{info.icon}</span>
                              <span className="truncate">{getDisplayName(f.properties)}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handleGPS} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 text-xs font-medium transition-colors border border-blue-200/40 dark:text-blue-400">
                    🎯 Gunakan GPS
                  </button>
                  <button
                    onClick={() => setRoutePickMode(routePickMode === "from" ? null : "from")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors border ${
                      routePickMode === "from"
                        ? "bg-blue-500 text-white border-blue-500"
                        : isDark ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    🖱️ {routePickMode === "from" ? "Klik peta..." : "Klik Peta"}
                  </button>
                </div>
              </div>

              {/* Swap */}
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-100"}`} />
                <button
                  onClick={() => {
                    const tmpFrom = routeFrom;
                    setRouteFrom(routeTo);
                    setRouteTo(tmpFrom);
                    setFromQuery(routeTo?.label ?? "");
                    setToQuery(routeFrom?.label ?? "");
                  }}
                  title="Tukar asal dan tujuan"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all hover:scale-110 ${
                    isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >⇅</button>
                <div className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-100"}`} />
              </div>

              {/* TO */}
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${textMuted}`}>
                  <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">B</span>
                  Titik Tujuan
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={toQuery}
                    onChange={(e) => { setToQuery(e.target.value); setRouteTo(null); }}
                    placeholder="Ketik nama lokasi tujuan..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 ${inputCls}`}
                  />
                  <AnimatePresence>
                    {toResults.length > 0 && !routeTo && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={`absolute top-full mt-1 w-full rounded-xl border shadow-xl z-10 overflow-hidden ${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-100"}`}
                      >
                        {toResults.map((f, i) => {
                          const info = CATEGORIES[getCategoryKey(f.properties)];
                          return (
                            <button key={i} onClick={() => {
                              const [lng, lat] = f.geometry.coordinates;
                              setRouteTo({ lat, lng, label: getDisplayName(f.properties) });
                              setToQuery(getDisplayName(f.properties));
                              setToResults([]);
                            }} className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors text-sm ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-50 text-gray-700"}`}>
                              <span>{info.icon}</span>
                              <span className="truncate">{getDisplayName(f.properties)}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => setRoutePickMode(routePickMode === "to" ? null : "to")}
                  className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-colors border ${
                    routePickMode === "to"
                      ? "bg-red-500 text-white border-red-500"
                      : isDark ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600" : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  🖱️ {routePickMode === "to" ? "Klik peta untuk memilih tujuan..." : "Klik Peta untuk Memilih Tujuan"}
                </button>
              </div>

              {/* Calculate */}
              <motion.button
                whileHover={{ scale: routeFrom && routeTo ? 1.02 : 1 }}
                whileTap={{ scale: routeFrom && routeTo ? 0.98 : 1 }}
                onClick={calculateRoute}
                disabled={!routeFrom || !routeTo || loading}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: routeFrom && routeTo ? "linear-gradient(135deg, #16a34a, #22c55e)" : "#9ca3af" }}
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >⟳</motion.span>
                    Menghitung rute...
                  </>
                ) : (
                  <>🧭 Hitung Rute</>
                )}
              </motion.button>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm flex items-start gap-2"
                  >
                    <span>⚠️</span><span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-3"
                  >
                    <div className={`rounded-2xl p-4 border ${cardBg}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>📊 Ringkasan Rute</span>
                        <button
                          onClick={() => { clearRoute(); }}
                          className="text-xs text-red-400 hover:text-red-500"
                        >Hapus rute</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`rounded-xl p-3 border ${isDark ? "bg-gray-700/50 border-gray-600/30" : "bg-white border-gray-100"}`}>
                          <div className={`text-[10px] mb-1 ${textMuted}`}>Jarak</div>
                          <div className={`text-xl font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>{formatDistance(result.distance)}</div>
                        </div>
                        <div className={`rounded-xl p-3 border ${isDark ? "bg-gray-700/50 border-gray-600/30" : "bg-white border-gray-100"}`}>
                          <div className={`text-[10px] mb-1 ${textMuted}`}>Estimasi Waktu</div>
                          <div className={`text-xl font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>{formatDuration(result.duration)}</div>
                        </div>
                      </div>
                    </div>

                    {result.steps.length > 1 && (
                      <div className="space-y-1.5">
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${textMuted}`}>🗺️ Panduan Arah</h3>
                        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                          {result.steps.slice(0, -1).map((step, i) => (
                            <div key={i} className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 ${itemBg}`}>
                              <span className="text-sm flex-shrink-0 mt-0.5">{getStepIcon(step.maneuver?.type)}</span>
                              <div className="min-w-0 flex-1">
                                <div className={`text-xs font-medium ${textPrimary} leading-tight`}>
                                  {step.name || "Lanjutkan"}
                                </div>
                                <div className={`text-[10px] ${textMuted} mt-0.5`}>{formatDistance(step.distance)}</div>
                              </div>
                            </div>
                          ))}
                          <div className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 ${itemBg}`}>
                            <span className="text-sm flex-shrink-0 mt-0.5">🎯</span>
                            <div className={`text-xs font-medium ${textPrimary}`}>Tiba di tujuan</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`text-xs ${textMuted} text-center pt-2`}>
                Routing menggunakan OSRM — perkiraan rute kendaraan
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

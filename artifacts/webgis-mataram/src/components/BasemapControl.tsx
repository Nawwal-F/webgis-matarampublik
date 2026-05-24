import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useApp, BasemapId } from "@/context/AppContext";

export const BASEMAPS: Record<BasemapId, { label: string; icon: string; url: string; attribution: string; maxZoom: number }> = {
  standard: {
    label: "Peta Jalan",
    icon: "🗺️",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    label: "Satelit",
    icon: "🛰️",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri, Maxar, GeoEye, Earthstar Geographics",
    maxZoom: 18,
  },
  topo: {
    label: "Topografi",
    icon: "⛰️",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
  },
  light: {
    label: "Mode Terang",
    icon: "☀️",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '© <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  dark: {
    label: "Mode Gelap",
    icon: "🌙",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '© <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
};

export default function BasemapControl() {
  const { basemap, setBasemap, theme } = useApp();
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        title="Ganti basemap"
        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl border shadow-md transition-all cursor-pointer ${
          isDark
            ? "bg-gray-800/95 border-gray-600/60 hover:border-gray-500"
            : "bg-white/95 border-white/60 hover:shadow-lg"
        }`}
        style={{ backdropFilter: "blur(12px)", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
      >
        {BASEMAPS[basemap].icon}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92, x: 10 }}
              transition={{ duration: 0.18 }}
              className={`absolute right-full mr-2 top-0 w-52 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                isDark ? "bg-gray-800/98 border-gray-700/60" : "bg-white/98 border-gray-100"
              }`}
              style={{ backdropFilter: "blur(16px)" }}
            >
              <div className={`px-3 py-2.5 border-b text-xs font-semibold uppercase tracking-wider ${
                isDark ? "border-gray-700 text-gray-400" : "border-gray-100 text-gray-400"
              }`}>
                Basemap
              </div>
              {(Object.entries(BASEMAPS) as [BasemapId, typeof BASEMAPS[BasemapId]][]).map(([id, info]) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setBasemap(id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                    basemap === id
                      ? isDark ? "bg-green-900/50" : "bg-green-50"
                      : isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                  }`}
                >
                  <span className="text-xl w-7 text-center flex-shrink-0">{info.icon}</span>
                  <span className={`text-sm font-medium flex-1 ${
                    basemap === id
                      ? "text-green-600"
                      : isDark ? "text-gray-300" : "text-gray-700"
                  }`}>{info.label}</span>
                  {basemap === id && (
                    <motion.div
                      layoutId="basemap-check"
                      className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

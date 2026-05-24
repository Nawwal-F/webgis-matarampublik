import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { LocationFeature, CategoryKey, getCategoryKey, getDisplayName, CATEGORIES } from "@/data/types";
import SearchBar from "./SearchBar";
import LayerControlPanel from "./LayerControlPanel";

interface SidebarProps {
  features: LocationFeature[];
  visibleLayers: Set<CategoryKey>;
  onToggleLayer: (key: CategoryKey) => void;
  counts: Record<CategoryKey, number>;
  onSelect: (f: LocationFeature) => void;
  visibleCount: number;
  gpsState: "idle" | "loading" | "active";
  onGPS: () => void;
}

export default function Sidebar({
  features, visibleLayers, onToggleLayer, counts, onSelect, visibleCount, gpsState, onGPS,
}: SidebarProps) {
  const { theme, toggleTheme, routePanelOpen, setRoutePanelOpen } = useApp();
  const isDark = theme === "dark";
  const [statsOpen, setStatsOpen] = useState(false);

  const topBg = isDark
    ? "bg-gray-900/95 border-gray-700/50"
    : "bg-white/95 border-white/50";
  const btnBase = isDark
    ? "bg-gray-800/80 border-gray-600/50 text-gray-300 hover:bg-gray-700/80 hover:border-gray-500"
    : "bg-white/90 border-white/60 text-gray-600 hover:bg-white hover:border-gray-200";

  return (
    <>
      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-[700] flex items-center gap-2 px-4 py-3 border-b backdrop-blur-xl pointer-events-auto ${topBg}`}
        style={{ backdropFilter: "blur(20px)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-base shadow-md">
            🗺️
          </div>
          <div className="hidden sm:block">
            <div className={`text-sm font-bold leading-none ${isDark ? "text-white" : "text-gray-900"}`}>WebGIS</div>
            <div className={`text-[10px] leading-none mt-0.5 ${isDark ? "text-gray-400" : "text-gray-400"}`}>Mataram Baru</div>
          </div>
        </div>

        {/* Divider */}
        <div className={`w-px h-7 flex-shrink-0 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />

        {/* Search - takes remaining space */}
        <div className="flex-1 min-w-0">
          <SearchBar features={features} onSelect={onSelect} />
        </div>

        {/* Divider */}
        <div className={`w-px h-7 flex-shrink-0 ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Route toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRoutePanelOpen(!routePanelOpen)}
            title="Perencanaan Rute"
            className={`h-9 px-3 rounded-xl flex items-center gap-1.5 border text-sm font-medium transition-all cursor-pointer ${
              routePanelOpen
                ? "bg-green-500 border-green-500 text-white"
                : `${btnBase}`
            }`}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            <span>🧭</span>
            <span className="hidden md:block text-xs">Rute</span>
          </motion.button>

          {/* GPS */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGPS}
            title="Lokasi GPS"
            className={`w-9 h-9 rounded-xl flex items-center justify-center border text-base transition-all cursor-pointer ${
              gpsState === "active"
                ? "bg-blue-500 border-blue-500 text-white"
                : `${btnBase}`
            }`}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            {gpsState === "loading" ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="inline-block">⟳</motion.span>
            ) : (
              <span>{gpsState === "active" ? "📍" : "🎯"}</span>
            )}
          </motion.button>

          {/* Layer control */}
          <LayerControlPanel visibleLayers={visibleLayers} onToggle={onToggleLayer} counts={counts} />

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            title={isDark ? "Mode Terang" : "Mode Gelap"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border text-base transition-all cursor-pointer ${btnBase}`}
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
          >
            {isDark ? "☀️" : "🌙"}
          </motion.button>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[700] pointer-events-none">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => setStatsOpen((o) => !o)}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-sm shadow-lg border pointer-events-auto cursor-pointer transition-all ${
            isDark
              ? "bg-gray-900/90 border-gray-700/60 hover:bg-gray-800/90"
              : "bg-white/95 border-gray-200/60 hover:bg-white"
          }`}
          style={{ backdropFilter: "blur(12px)" }}
        >
          <span className={`font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>{visibleCount}</span>
          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>lokasi</span>
          <span className={`text-xs hidden sm:inline ${isDark ? "text-gray-600" : "text-gray-300"}`}>|</span>
          <span className={`text-xs hidden sm:inline ${isDark ? "text-gray-400" : "text-gray-500"}`}>Mataram Baru 🌴</span>
        </motion.button>
      </div>
    </>
  );
}

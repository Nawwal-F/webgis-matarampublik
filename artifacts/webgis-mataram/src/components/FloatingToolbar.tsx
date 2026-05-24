import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useApp, BasemapId } from "@/context/AppContext";
import { CategoryKey, CATEGORIES } from "@/data/types";
import { BASEMAPS } from "./BasemapControl";

interface FloatingToolbarProps {
  gpsState: "idle" | "loading" | "active";
  onGPS: () => void;
  visibleLayers: Set<CategoryKey>;
  onToggleLayer: (k: CategoryKey) => void;
  counts: Record<CategoryKey, number>;
  zoom: number;
}

function ToolBtn({
  onClick, title, active = false, children, className = ""
}: {
  onClick?: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const { theme } = useApp();
  const isDark = theme === "dark";
  return (
    <motion.button
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      title={title}
      className={`w-10 h-10 rounded-xl flex items-center justify-center text-base border transition-all cursor-pointer shadow-sm ${
        active
          ? "bg-green-500 border-green-500 text-white shadow-green-400/30"
          : isDark
            ? `bg-gray-800/90 border-gray-700/50 text-gray-300 hover:bg-gray-700/90 hover:border-gray-600 ${className}`
            : `bg-white/90 border-gray-200/70 text-gray-600 hover:bg-white hover:border-gray-300 ${className}`
      }`}
      style={{ backdropFilter: "blur(16px)" }}
    >
      {children}
    </motion.button>
  );
}

function LayerMenu({ visibleLayers, onToggle, counts, onClose }: {
  visibleLayers: Set<CategoryKey>;
  onToggle: (k: CategoryKey) => void;
  counts: Record<CategoryKey, number>;
  onClose: () => void;
}) {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const keys = (Object.keys(CATEGORIES) as CategoryKey[]).filter(k => counts[k] > 0);
  const allOn = keys.every(k => visibleLayers.has(k));

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 10, scale: 0.94 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 10, scale: 0.94 }}
        transition={{ duration: 0.15 }}
        className={`absolute right-full mr-2.5 top-0 w-56 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
          isDark ? "bg-gray-800/98 border-gray-700/60" : "bg-white/98 border-gray-100"
        }`}
        style={{ backdropFilter: "blur(20px)" }}
      >
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-gray-700/50" : "border-gray-100"}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>Tampilkan Layer</span>
          <button onClick={() => { keys.forEach(k => { const on = visibleLayers.has(k); if (allOn ? on : !on) onToggle(k); }); }}
            className={`text-xs font-medium ${isDark ? "text-green-400" : "text-green-600"}`}>
            {allOn ? "Semua off" : "Semua on"}
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {keys.map(key => {
            const info = CATEGORIES[key];
            const on = visibleLayers.has(key);
            return (
              <button key={key} onClick={() => onToggle(key)}
                className={`w-full flex items-center gap-3 px-4 py-2 transition-colors text-left ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: info.bgColor, opacity: on ? 1 : 0.3 }}>
                  {info.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium truncate ${on ? (isDark ? "text-gray-200" : "text-gray-700") : (isDark ? "text-gray-600" : "text-gray-400")}`}>{info.label}</div>
                  <div className={`text-[10px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>{counts[key]} lokasi</div>
                </div>
                <div className={`w-8 h-4 rounded-full relative flex-shrink-0 transition-colors`} style={{ background: on ? info.color : (isDark ? "#374151" : "#d1d5db") }}>
                  <motion.div className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                    animate={{ left: on ? "calc(100% - 14px)" : "2px" }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }} />
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

function BasemapMenu({ onClose }: { onClose: () => void }) {
  const { basemap, setBasemap, theme } = useApp();
  const isDark = theme === "dark";
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, x: 10, scale: 0.94 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 10, scale: 0.94 }}
        transition={{ duration: 0.15 }}
        className={`absolute right-full mr-2.5 top-0 w-48 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
          isDark ? "bg-gray-800/98 border-gray-700/60" : "bg-white/98 border-gray-100"
        }`}
        style={{ backdropFilter: "blur(20px)" }}
      >
        <div className={`px-4 py-2.5 border-b text-xs font-bold uppercase tracking-wider ${isDark ? "border-gray-700/50 text-gray-400" : "border-gray-100 text-gray-500"}`}>
          Peta Dasar
        </div>
        {(Object.entries(BASEMAPS) as [BasemapId, typeof BASEMAPS[BasemapId]][]).map(([id, info]) => (
          <button key={id} onClick={() => { setBasemap(id); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
              basemap === id ? (isDark ? "bg-green-900/40" : "bg-green-50") : (isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50")
            }`}>
            <span className="text-lg w-6 text-center">{info.icon}</span>
            <span className={`text-sm font-medium flex-1 ${basemap === id ? "text-green-600" : (isDark ? "text-gray-300" : "text-gray-700")}`}>{info.label}</span>
            {basemap === id && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
          </button>
        ))}
      </motion.div>
    </>
  );
}

export default function FloatingToolbar({ gpsState, onGPS, visibleLayers, onToggleLayer, counts, zoom }: FloatingToolbarProps) {
  const { theme, toggleTheme, bookmarksPanelOpen, setBookmarksPanelOpen, routePanelOpen, setRoutePanelOpen, bookmarks } = useApp();
  const isDark = theme === "dark";
  const [showLayers, setShowLayers] = useState(false);
  const [showBasemap, setShowBasemap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const divider = <div className={`w-full h-px my-0.5 ${isDark ? "bg-gray-700/50" : "bg-gray-200/70"}`} />;

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-[700] flex flex-col items-center gap-1 pointer-events-auto"
    >
      {/* GPS */}
      <ToolBtn onClick={onGPS} title="Lokasi Saya (GPS)" active={gpsState === "active"}
        className={gpsState === "active" ? "!bg-blue-500 !border-blue-500 !text-white" : ""}>
        {gpsState === "loading" ? (
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} className="inline-block text-blue-500">⟳</motion.span>
        ) : (
          <span className={gpsState === "active" ? "text-white" : ""}>{gpsState === "active" ? "📍" : "🎯"}</span>
        )}
      </ToolBtn>

      {divider}

      {/* Layers */}
      <div className="relative">
        <ToolBtn onClick={() => { setShowLayers(v => !v); setShowBasemap(false); }} title="Kontrol Layer" active={showLayers}>
          🗂️
        </ToolBtn>
        <AnimatePresence>
          {showLayers && <LayerMenu visibleLayers={visibleLayers} onToggle={onToggleLayer} counts={counts} onClose={() => setShowLayers(false)} />}
        </AnimatePresence>
      </div>

      {/* Basemap */}
      <div className="relative">
        <ToolBtn onClick={() => { setShowBasemap(v => !v); setShowLayers(false); }} title="Pilih Basemap" active={showBasemap}>
          🛰️
        </ToolBtn>
        <AnimatePresence>
          {showBasemap && <BasemapMenu onClose={() => setShowBasemap(false)} />}
        </AnimatePresence>
      </div>

      {divider}

      {/* Route */}
      <ToolBtn onClick={() => setRoutePanelOpen(!routePanelOpen)} title="Perencanaan Rute" active={routePanelOpen}>
        🧭
      </ToolBtn>

      {/* Bookmarks */}
      <ToolBtn onClick={() => setBookmarksPanelOpen(!bookmarksPanelOpen)} title="Lokasi Tersimpan" active={bookmarksPanelOpen}>
        <span className="relative">
          🔖
          {bookmarks.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-green-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
              {bookmarks.length > 9 ? "9+" : bookmarks.length}
            </span>
          )}
        </span>
      </ToolBtn>

      {divider}

      {/* Theme */}
      <ToolBtn onClick={toggleTheme} title={isDark ? "Mode Terang" : "Mode Gelap"}>
        {isDark ? "☀️" : "🌙"}
      </ToolBtn>

      {/* Fullscreen */}
      <ToolBtn onClick={toggleFullscreen} title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}>
        {isFullscreen ? "⊠" : "⛶"}
      </ToolBtn>

      {/* Zoom level */}
      <div className={`mt-1 px-2 py-1 rounded-lg text-[10px] font-mono border ${
        isDark ? "bg-gray-800/80 border-gray-700/40 text-gray-500" : "bg-white/80 border-gray-200/50 text-gray-400"
      }`}>
        Z{zoom}
      </div>
    </motion.div>
  );
}

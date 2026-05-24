import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { LocationFeature, CategoryKey } from "@/data/types";
import SearchBar from "./SearchBar";

interface TopBarProps {
  features: LocationFeature[];
  onSelect: (f: LocationFeature) => void;
  visibleLayers: Set<CategoryKey>;
  counts: Record<CategoryKey, number>;
  visibleCount: number;
}

export default function TopBar({ features, onSelect, visibleCount }: TopBarProps) {
  const { theme, routePanelOpen, setRoutePanelOpen } = useApp();
  const isDark = theme === "dark";

  return (
    <div className="absolute top-0 left-0 right-0 z-[700] pointer-events-none">
      <div className="flex items-center justify-center px-4 pt-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
          className={`pointer-events-auto flex items-center gap-3 w-full max-w-2xl rounded-2xl px-3 py-2.5 border shadow-xl ${
            isDark
              ? "bg-gray-900/92 border-gray-700/50"
              : "bg-white/92 border-gray-200/60"
          }`}
          style={{ backdropFilter: "blur(24px)" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md text-sm select-none">
              🗺️
            </div>
            <div className="hidden sm:block leading-none">
              <div className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>WebGIS</div>
              <div className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Mataram Baru</div>
            </div>
          </div>

          {/* Divider */}
          <div className={`w-px self-stretch ${isDark ? "bg-gray-700/70" : "bg-gray-200"}`} />

          {/* Search */}
          <div className="flex-1 min-w-0">
            <SearchBar features={features} onSelect={onSelect} />
          </div>

          {/* Divider */}
          <div className={`w-px self-stretch hidden sm:block ${isDark ? "bg-gray-700/70" : "bg-gray-200"}`} />

          {/* Route button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setRoutePanelOpen(!routePanelOpen)}
            className={`hidden sm:flex flex-shrink-0 items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              routePanelOpen
                ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-500/30"
                : isDark
                  ? "bg-gray-800 border-gray-600/50 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>🧭</span>
            <span>Rute</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom status chip */}
      <div className="flex justify-center mt-2">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`pointer-events-none px-3 py-1 rounded-full text-xs border flex items-center gap-1.5 ${
            isDark
              ? "bg-gray-900/70 border-gray-700/40 text-gray-500"
              : "bg-white/70 border-gray-200/40 text-gray-400"
          }`}
          style={{ backdropFilter: "blur(8px)" }}
        >
          <span className={`font-semibold ${isDark ? "text-green-400" : "text-green-600"}`}>{visibleCount}</span>
          <span>lokasi · Mataram Baru, Lombok 🌴</span>
        </motion.div>
      </div>
    </div>
  );
}

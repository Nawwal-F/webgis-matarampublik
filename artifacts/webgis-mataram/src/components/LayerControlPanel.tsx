import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CATEGORIES, CategoryKey } from "@/data/types";
import { useApp } from "@/context/AppContext";

interface LayerControlPanelProps {
  visibleLayers: Set<CategoryKey>;
  onToggle: (key: CategoryKey) => void;
  counts: Record<CategoryKey, number>;
}

export default function LayerControlPanel({ visibleLayers, onToggle, counts }: LayerControlPanelProps) {
  const [open, setOpen] = useState(false);
  const { theme } = useApp();
  const isDark = theme === "dark";

  const allKeys = Object.keys(CATEGORIES) as CategoryKey[];
  const activeKeys = allKeys.filter((k) => counts[k] > 0);
  const allVisible = activeKeys.every((k) => visibleLayers.has(k));
  const anyVisible = activeKeys.some((k) => visibleLayers.has(k));

  const toggleAll = () => {
    if (allVisible) {
      activeKeys.forEach((k) => { if (visibleLayers.has(k)) onToggle(k); });
    } else {
      activeKeys.forEach((k) => { if (!visibleLayers.has(k)) onToggle(k); });
    }
  };

  const btnBg = isDark
    ? "bg-gray-800/80 border-gray-600/50 text-gray-300 hover:bg-gray-700/80"
    : "bg-white/90 border-white/60 text-gray-600 hover:bg-white hover:shadow-lg";

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((o) => !o)}
        className={`h-9 px-3 rounded-xl flex items-center gap-1.5 border text-sm transition-all cursor-pointer ${btnBg}`}
        style={{ backdropFilter: "blur(12px)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
      >
        <span>🗂️</span>
        <span className="hidden sm:block text-xs font-medium">Layer</span>
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: allVisible ? "#16a34a" : anyVisible ? "#f59e0b" : "#94a3b8" }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -6 }}
              transition={{ duration: 0.16 }}
              className={`absolute top-full mt-2 right-0 w-60 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                isDark ? "bg-gray-800/98 border-gray-700/60" : "bg-white/98 border-gray-100"
              }`}
              style={{ backdropFilter: "blur(20px)" }}
            >
              <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? "border-gray-700/60" : "border-gray-100"}`}>
                <h3 className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>Kontrol Layer</h3>
                <button onClick={toggleAll} className={`text-xs font-medium ${isDark ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-700"}`}>
                  {allVisible ? "Sembunyikan semua" : "Tampilkan semua"}
                </button>
              </div>
              <div className="py-1.5 max-h-80 overflow-y-auto">
                {activeKeys.map((key) => {
                  const info = CATEGORIES[key];
                  const visible = visibleLayers.has(key);
                  const count = counts[key] || 0;
                  return (
                    <motion.button
                      key={key}
                      onClick={() => onToggle(key)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                        isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm transition-opacity"
                        style={{ background: info.bgColor, opacity: visible ? 1 : 0.35 }}
                      >
                        {info.icon}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className={`text-sm font-medium truncate transition-colors ${visible ? (isDark ? "text-gray-200" : "text-gray-800") : (isDark ? "text-gray-500" : "text-gray-400")}`}>
                          {info.label}
                        </div>
                        <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{count} lokasi</div>
                      </div>
                      <div
                        className="w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0 relative"
                        style={{ background: visible ? info.color : isDark ? "#374151" : "#d1d5db" }}
                      >
                        <motion.div
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ left: visible ? "calc(100% - 18px)" : "2px" }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

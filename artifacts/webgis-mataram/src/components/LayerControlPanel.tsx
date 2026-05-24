import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CATEGORIES, CategoryKey } from "@/data/types";

interface LayerControlPanelProps {
  visibleLayers: Set<CategoryKey>;
  onToggle: (key: CategoryKey) => void;
  counts: Record<CategoryKey, number>;
}

export default function LayerControlPanel({ visibleLayers, onToggle, counts }: LayerControlPanelProps) {
  const [open, setOpen] = useState(false);

  const allVisible = Object.keys(CATEGORIES).every((k) => visibleLayers.has(k as CategoryKey));
  const noneVisible = Object.keys(CATEGORIES).every((k) => !visibleLayers.has(k as CategoryKey));

  const toggleAll = () => {
    if (allVisible) {
      Object.keys(CATEGORIES).forEach((k) => {
        if (visibleLayers.has(k as CategoryKey)) onToggle(k as CategoryKey);
      });
    } else {
      Object.keys(CATEGORIES).forEach((k) => {
        if (!visibleLayers.has(k as CategoryKey)) onToggle(k as CategoryKey);
      });
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/60 text-sm font-medium text-gray-700 shadow-md hover:shadow-lg transition-shadow"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
      >
        <span className="text-lg">🗂️</span>
        <span className="hidden sm:block">Layer</span>
        <div className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: allVisible ? "#16a34a" : noneVisible ? "#94a3b8" : "#f59e0b" }}
          />
          <span className="text-xs text-gray-500">
            {visibleLayers.size}/{Object.keys(CATEGORIES).length}
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full mt-2 right-0 w-64 bg-white/97 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">Kontrol Layer</h3>
                <button
                  onClick={toggleAll}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  {allVisible ? "Sembunyikan semua" : "Tampilkan semua"}
                </button>
              </div>
              <div className="py-1.5 max-h-80 overflow-y-auto">
                {(Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][]).map(
                  ([key, info]) => {
                    const visible = visibleLayers.has(key);
                    const count = counts[key] || 0;
                    if (count === 0) return null;
                    return (
                      <motion.button
                        key={key}
                        onClick={() => onToggle(key)}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm transition-opacity"
                          style={{ background: info.bgColor, opacity: visible ? 1 : 0.4 }}
                        >
                          {info.icon}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div
                            className="text-sm font-medium truncate transition-colors"
                            style={{ color: visible ? "#1f2937" : "#9ca3af" }}
                          >
                            {info.label}
                          </div>
                          <div className="text-xs text-gray-400">{count} lokasi</div>
                        </div>
                        <div
                          className="w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0 relative"
                          style={{ background: visible ? info.color : "#d1d5db" }}
                        >
                          <motion.div
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{ left: visible ? "calc(100% - 18px)" : "2px" }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          />
                        </div>
                      </motion.button>
                    );
                  }
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

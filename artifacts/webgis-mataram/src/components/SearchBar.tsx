import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LocationFeature, getCategoryKey, getDisplayName, CATEGORIES } from "@/data/types";
import { useApp } from "@/context/AppContext";

interface SearchBarProps {
  features: LocationFeature[];
  onSelect: (feature: LocationFeature) => void;
}

export default function SearchBar({ features, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationFeature[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useApp();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const filtered = features
      .filter((f) => {
        const name = getDisplayName(f.properties).toLowerCase();
        const cat = CATEGORIES[getCategoryKey(f.properties)].label.toLowerCase();
        const amenity = (f.properties.amenity || "").toLowerCase();
        const tourism = (f.properties.tourism || "").toLowerCase();
        return name.includes(q) || cat.includes(q) || amenity.includes(q) || tourism.includes(q);
      })
      .slice(0, 8);
    setResults(filtered);
  }, [query, features]);

  const handleSelect = (feature: LocationFeature) => {
    setQuery(getDisplayName(feature.properties));
    setResults([]);
    setFocused(false);
    onSelect(feature);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === "Escape") { setQuery(""); setResults([]); setFocused(false); inputRef.current?.blur(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const inputClass = isDark
    ? "bg-gray-700/50 border-gray-600/50 text-gray-100 placeholder-gray-400 focus:border-green-500/50"
    : "bg-white/80 border-gray-200/60 text-gray-800 placeholder-gray-400 focus:border-green-400/50";

  const dropdownClass = isDark
    ? "bg-gray-800/98 border-gray-700/60"
    : "bg-white/98 border-gray-100";

  return (
    <div className="relative w-full">
      <motion.div
        animate={{ boxShadow: focused ? "0 4px 20px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.08)" }}
        className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 border transition-colors ${inputClass}`}
        style={{ backdropFilter: "blur(12px)" }}
      >
        <span className="text-green-500 text-base flex-shrink-0">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Cari lokasi... (Ctrl+K)"
          className="flex-1 bg-transparent text-sm outline-none min-w-0"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className={`text-sm flex-shrink-0 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>✕</button>
        )}
      </motion.div>

      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-1.5 w-full rounded-2xl border shadow-2xl overflow-hidden z-50 ${dropdownClass}`}
            style={{ backdropFilter: "blur(20px)" }}
          >
            <div className="py-1.5 max-h-72 overflow-y-auto">
              <div className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold border-b ${isDark ? "text-gray-500 border-gray-700/60" : "text-gray-400 border-gray-100"}`}>
                {results.length} hasil
              </div>
              {results.map((feature, i) => {
                const cat = getCategoryKey(feature.properties);
                const info = CATEGORIES[cat];
                const name = getDisplayName(feature.properties);
                return (
                  <motion.button
                    key={feature.properties.osm_id ?? i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelect(feature)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left group ${
                      isDark ? "hover:bg-gray-700/60" : "hover:bg-green-50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: info.bgColor }}>
                      {info.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium truncate ${isDark ? "text-gray-200 group-hover:text-green-400" : "text-gray-800 group-hover:text-green-700"}`}>{name}</div>
                      <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{info.label}</div>
                    </div>
                    <span className={`text-xs flex-shrink-0 ${isDark ? "text-gray-600 group-hover:text-green-500" : "text-gray-300 group-hover:text-green-400"}`}>→</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

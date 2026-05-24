import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LocationFeature, getCategoryKey, getDisplayName, CATEGORIES } from "@/data/types";

interface SearchBarProps {
  features: LocationFeature[];
  onSelect: (feature: LocationFeature) => void;
}

export default function SearchBar({ features, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationFeature[]>([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
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
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setQuery("");
        setResults([]);
        setFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative w-full max-w-sm">
      <motion.div
        animate={{ boxShadow: focused ? "0 8px 32px rgba(0,0,0,0.18)" : "0 4px 16px rgba(0,0,0,0.12)" }}
        className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/60"
      >
        <span className="text-green-600 text-lg flex-shrink-0">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Cari lokasi, kategori..."
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="text-gray-400 hover:text-gray-600 text-base flex-shrink-0 w-5 h-5 flex items-center justify-center"
          >
            ✕
          </button>
        )}
        {!query && (
          <kbd className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 flex-shrink-0 hidden sm:block">
            Ctrl+K
          </kbd>
        )}
      </motion.div>

      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-md rounded-2xl border border-white/60 shadow-2xl overflow-hidden z-50"
          >
            <div className="py-1.5 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-100">
                {results.length} lokasi ditemukan
              </div>
              {results.map((feature, i) => {
                const cat = getCategoryKey(feature.properties);
                const info = CATEGORIES[cat];
                const name = getDisplayName(feature.properties);
                return (
                  <motion.button
                    key={feature.properties.osm_id ?? i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSelect(feature)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 transition-colors text-left group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: info.bgColor }}
                    >
                      {info.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-800 truncate group-hover:text-green-700">
                        {name}
                      </div>
                      <div className="text-xs text-gray-400">{info.label}</div>
                    </div>
                    <span className="text-gray-300 group-hover:text-green-400 text-xs flex-shrink-0">→</span>
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

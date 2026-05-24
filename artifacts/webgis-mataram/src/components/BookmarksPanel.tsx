import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { LocationFeature, getCategoryKey, getDisplayName, CATEGORIES } from "@/data/types";

interface BookmarksPanelProps {
  features: LocationFeature[];
  onSelectFeature: (f: LocationFeature) => void;
}

export default function BookmarksPanel({ features, onSelectFeature }: BookmarksPanelProps) {
  const { bookmarks, toggleBookmark, bookmarksPanelOpen, setBookmarksPanelOpen, theme } = useApp();
  const isDark = theme === "dark";

  const bookmarkedFeatures = features.filter(f =>
    bookmarks.includes(f.properties.osm_id)
  );

  const handleRemove = (osmId: number, name: string) => {
    toggleBookmark(osmId);
    toast.success(`Dihapus dari bookmark`, { description: name, duration: 2000 });
  };

  const panelBg = isDark ? "bg-gray-900/98 border-gray-700/50" : "bg-white/98 border-gray-100";
  const textPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const textMuted = isDark ? "text-gray-400" : "text-gray-500";
  const itemHover = isDark ? "hover:bg-gray-800/60" : "hover:bg-gray-50";

  return (
    <AnimatePresence>
      {bookmarksPanelOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 36 }}
          className={`fixed right-0 top-0 h-full w-full max-w-xs shadow-2xl z-[810] flex flex-col border-l ${panelBg}`}
          style={{ backdropFilter: "blur(20px)" }}
        >
          {/* Header */}
          <div className={`flex-shrink-0 px-5 pt-5 pb-4 border-b ${isDark ? "border-gray-700/50" : "border-gray-100"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl ${isDark ? "bg-yellow-900/30" : "bg-yellow-50"}`}>🔖</div>
                <div>
                  <h2 className={`text-base font-bold ${textPrimary}`}>Lokasi Tersimpan</h2>
                  <p className={`text-xs ${textMuted}`}>{bookmarkedFeatures.length} lokasi disimpan</p>
                </div>
              </div>
              <button
                onClick={() => setBookmarksPanelOpen(false)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors ${isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}
              >✕</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {bookmarkedFeatures.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                <div className="text-5xl opacity-30">🔖</div>
                <div className="space-y-1">
                  <div className={`text-sm font-medium ${textPrimary}`}>Belum ada lokasi tersimpan</div>
                  <div className={`text-xs ${textMuted}`}>
                    Klik ikon ⭐ di panel informasi lokasi untuk menyimpan lokasi favorit Anda
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2">
                {bookmarkedFeatures.map((f, i) => {
                  const cat = getCategoryKey(f.properties);
                  const info = CATEGORIES[cat];
                  const name = getDisplayName(f.properties);
                  return (
                    <motion.div
                      key={f.properties.osm_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.04 }}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors group ${itemHover}`}
                    >
                      <button
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        onClick={() => {
                          onSelectFeature(f);
                          setBookmarksPanelOpen(false);
                        }}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: info.bgColor }}>
                          {info.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-medium truncate ${textPrimary}`}>{name}</div>
                          <div className={`text-xs ${textMuted}`}>{info.label}</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleRemove(f.properties.osm_id, name)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ${
                          isDark ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-400"
                        }`}
                        title="Hapus dari bookmark"
                      >✕</button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {bookmarkedFeatures.length > 0 && (
            <div className={`flex-shrink-0 px-5 py-3 border-t ${isDark ? "border-gray-700/50" : "border-gray-100"}`}>
              <button
                onClick={() => {
                  bookmarkedFeatures.forEach(f => toggleBookmark(f.properties.osm_id));
                  toast.success("Semua bookmark dihapus");
                }}
                className={`w-full py-2 rounded-xl text-xs font-medium transition-colors ${
                  isDark ? "bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-800/30" : "bg-red-50 text-red-500 hover:bg-red-100 border border-red-100"
                }`}
              >
                Hapus Semua Bookmark
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

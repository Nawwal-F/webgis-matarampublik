import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LocationFeature, getCategoryKey, getDisplayName, CATEGORIES } from "@/data/types";
import { useApp } from "@/context/AppContext";

interface LocationPanelProps {
  feature: LocationFeature | null;
  onClose: () => void;
  allFeatures?: LocationFeature[];
}

function distKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LocationPanel({ feature, onClose, allFeatures = [] }: LocationPanelProps) {
  const { setRouteToFeature, theme, toggleBookmark, isBookmarked } = useApp();
  const isDark = theme === "dark";
  const cat = feature ? getCategoryKey(feature.properties) : null;
  const info = cat ? CATEGORIES[cat] : null;
  const name = feature ? getDisplayName(feature.properties) : "";
  const p = feature?.properties;
  const bookmarked = feature ? isBookmarked(feature.properties.osm_id) : false;

  const details: { label: string; value: string; icon: string }[] = [];
  if (p) {
    if (p.opening_hours) details.push({ label: "Jam Buka", value: p.opening_hours, icon: "🕐" });
    if (p.operator) details.push({ label: "Operator", value: p.operator, icon: "🏢" });
    if (p.network) details.push({ label: "Jaringan", value: p.network, icon: "📡" });
    if (p.access) details.push({ label: "Akses", value: p.access, icon: "🔑" });
    if (p.rooms) details.push({ label: "Jumlah Kamar", value: String(p.rooms), icon: "🛏️" });
    if (p.beds) details.push({ label: "Jumlah Tempat Tidur", value: String(p.beds), icon: "🏥" });
    if (p.staff_count_doctors) details.push({ label: "Dokter", value: String(p.staff_count_doctors), icon: "👨‍⚕️" });
    if (p.staff_count_nurses) details.push({ label: "Perawat", value: String(p.staff_count_nurses), icon: "👩‍⚕️" });
    if (p.health_facility_type) details.push({ label: "Tipe Fasilitas", value: p.health_facility_type, icon: "🏨" });
    if (p.health_facility_level) details.push({ label: "Level Fasilitas", value: p.health_facility_level, icon: "📊" });
    if (p.status) details.push({ label: "Status", value: p.status, icon: "✅" });
    if (p.operator_type) details.push({ label: "Tipe Operator", value: p.operator_type, icon: "🏛️" });
    if (p.toilets_disposal) details.push({ label: "Sanitasi", value: p.toilets_disposal, icon: "🚽" });
    if (p.toilets_handwashing) details.push({ label: "Cuci Tangan", value: p.toilets_handwashing, icon: "🙌" });
  }

  const coords = feature?.geometry?.coordinates;
  const lng = coords ? coords[0] : null;
  const lat = coords ? coords[1] : null;
  const lngStr = lng !== null ? lng.toFixed(6) : null;
  const latStr = lat !== null ? lat.toFixed(6) : null;

  const nearby = (lat !== null && lng !== null && feature)
    ? allFeatures
        .filter(f => f.properties.osm_id !== feature.properties.osm_id)
        .map(f => ({ f, d: distKm(lat, lng, f.geometry.coordinates[1], f.geometry.coordinates[0]) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
    : [];

  const copyCoords = () => {
    if (!lngStr || !latStr) return;
    navigator.clipboard.writeText(`${latStr}, ${lngStr}`).then(() => {
      toast.success("Koordinat disalin!", { description: `${latStr}, ${lngStr}`, duration: 2000 });
    });
  };

  const handleBookmark = () => {
    if (!feature) return;
    toggleBookmark(feature.properties.osm_id);
    if (bookmarked) {
      toast("Dihapus dari bookmark", { description: name, duration: 2000 });
    } else {
      toast.success("Ditambahkan ke bookmark! 🔖", { description: name, duration: 2000 });
    }
  };

  const panelBg = isDark ? "bg-gray-900/98 border-gray-700/60" : "bg-white/98 border-gray-100";
  const cardBg = isDark ? "bg-gray-800/60 border-gray-700/40" : "bg-gray-50/80 border-gray-100";
  const textPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-500";
  const itemBg = isDark ? "bg-gray-800/50" : "bg-gray-50";

  return (
    <AnimatePresence>
      {feature && info && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 35 }}
          className={`fixed right-0 top-0 h-full w-full max-w-sm shadow-2xl z-[800] flex flex-col border-l ${panelBg}`}
          style={{ backdropFilter: "blur(24px)" }}
        >
          {/* Header */}
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${info.color}${isDark ? "30" : "18"}, ${info.color}${isDark ? "15" : "08"})` }}
          >
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 80% 30%, ${info.color}${isDark ? "28" : "15"}, transparent 65%)` }} />
            <div className="relative px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md"
                  style={{ background: isDark ? `${info.color}22` : info.bgColor }}
                >
                  {info.icon}
                </motion.div>
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                  {/* Bookmark */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleBookmark}
                    title={bookmarked ? "Hapus dari bookmark" : "Simpan ke bookmark"}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all text-base ${
                      bookmarked
                        ? "bg-yellow-400/20 text-yellow-500"
                        : isDark ? "bg-gray-700/60 hover:bg-yellow-900/30 text-gray-400 hover:text-yellow-400" : "bg-black/5 hover:bg-yellow-50 text-gray-400 hover:text-yellow-500"
                    }`}
                  >
                    {bookmarked ? "⭐" : "☆"}
                  </motion.button>
                  {/* Close */}
                  <button
                    onClick={onClose}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-sm ${
                      isDark ? "bg-gray-700/60 hover:bg-gray-600/60 text-gray-400" : "bg-black/5 hover:bg-black/10 text-gray-500"
                    }`}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
                  style={{ background: isDark ? `${info.color}25` : info.bgColor, color: info.color }}
                >
                  {info.icon} {info.label}
                </div>
                <h2 className={`text-xl font-bold leading-tight ${textPrimary}`}>{name}</h2>
              </motion.div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-4 space-y-4">
              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="grid grid-cols-2 gap-2"
              >
                <a
                  href={`https://www.google.com/maps?q=${latStr},${lngStr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-white shadow-sm"
                  style={{ background: info.color }}
                >
                  🗺️ Google Maps
                </a>
                <button
                  onClick={() => feature && setRouteToFeature(feature)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    isDark
                      ? "bg-green-900/30 border-green-700/50 text-green-400 hover:bg-green-900/50"
                      : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  }`}
                >
                  🧭 Buat Rute
                </button>
              </motion.div>

              {/* Coordinates */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-2xl p-4 border ${cardBg}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-green-400" : "text-green-700"}`}>📍 Koordinat</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyCoords}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      isDark ? "bg-gray-700/60 border-gray-600/50 text-gray-300 hover:bg-gray-600/60" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                    title="Salin koordinat"
                  >
                    📋 Salin
                  </motion.button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`rounded-xl p-3 border ${isDark ? "bg-gray-700/50 border-gray-600/30" : "bg-white border-green-100"}`}>
                    <div className={`text-[10px] mb-0.5 ${textSecondary}`}>Bujur (Lng)</div>
                    <div className={`text-sm font-mono font-medium ${textPrimary}`}>{lngStr}°</div>
                  </div>
                  <div className={`rounded-xl p-3 border ${isDark ? "bg-gray-700/50 border-gray-600/30" : "bg-white border-green-100"}`}>
                    <div className={`text-[10px] mb-0.5 ${textSecondary}`}>Lintang (Lat)</div>
                    <div className={`text-sm font-mono font-medium ${textPrimary}`}>{latStr}°</div>
                  </div>
                </div>
              </motion.div>

              {/* Details */}
              {details.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2"
                >
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>ℹ️ Informasi Detail</h3>
                  {details.map((d, i) => (
                    <motion.div
                      key={d.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.28 + i * 0.04 }}
                      className={`flex items-start gap-3 rounded-xl px-3.5 py-3 ${itemBg}`}
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">{d.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className={`text-[10px] mb-0.5 ${textSecondary}`}>{d.label}</div>
                        <div className={`text-sm font-medium break-words ${textPrimary}`}>{d.value}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Nearby locations */}
              {nearby.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="space-y-2"
                >
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>📌 Lokasi Terdekat</h3>
                  {nearby.map(({ f, d }, i) => {
                    const nCat = getCategoryKey(f.properties);
                    const nInfo = CATEGORIES[nCat];
                    return (
                      <motion.div
                        key={f.properties.osm_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.38 + i * 0.05 }}
                        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 border cursor-pointer transition-all ${
                          isDark ? "bg-gray-800/40 border-gray-700/30 hover:bg-gray-700/50" : "bg-gray-50/70 border-gray-100 hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          /* flyTo is handled in MapView via setSelected propagation */
                        }}
                      >
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: nInfo.bgColor }}>
                          {nInfo.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-medium truncate ${textPrimary}`}>{getDisplayName(f.properties)}</div>
                          <div className={`text-[10px] ${textSecondary}`}>{nInfo.label}</div>
                        </div>
                        <div className={`text-[10px] font-mono flex-shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* OSM data */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-1.5"
              >
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>🔖 Data OSM</h3>
                <div className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${itemBg}`}>
                  <span className="text-base">🆔</span>
                  <div>
                    <div className={`text-[10px] mb-0.5 ${textSecondary}`}>OSM ID</div>
                    <div className={`text-sm font-mono ${textPrimary}`}>{p?.osm_id}</div>
                  </div>
                </div>
                {p?.osm_type && (
                  <div className={`flex items-center gap-3 rounded-xl px-3.5 py-3 ${itemBg}`}>
                    <span className="text-base">📄</span>
                    <div>
                      <div className={`text-[10px] mb-0.5 ${textSecondary}`}>Tipe OSM</div>
                      <div className={`text-sm ${textPrimary}`}>{p.osm_type}</div>
                    </div>
                  </div>
                )}
              </motion.div>

              {details.length === 0 && (
                <div className={`text-center py-4 ${textSecondary}`}>
                  <div className="text-3xl mb-2 opacity-40">📋</div>
                  <div className="text-sm">Data detail tidak tersedia</div>
                </div>
              )}

              <div className="h-4" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

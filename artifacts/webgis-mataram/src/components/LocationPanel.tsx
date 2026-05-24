import { motion, AnimatePresence } from "framer-motion";
import { LocationFeature, getCategoryKey, getDisplayName, CATEGORIES } from "@/data/types";

interface LocationPanelProps {
  feature: LocationFeature | null;
  onClose: () => void;
}

export default function LocationPanel({ feature, onClose }: LocationPanelProps) {
  const cat = feature ? getCategoryKey(feature.properties) : null;
  const info = cat ? CATEGORIES[cat] : null;
  const name = feature ? getDisplayName(feature.properties) : "";
  const p = feature?.properties;

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
  const lng = coords ? coords[0].toFixed(6) : null;
  const lat = coords ? coords[1].toFixed(6) : null;

  return (
    <AnimatePresence>
      {feature && info && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 35 }}
          className="fixed right-0 top-0 h-full w-full max-w-sm bg-white/97 backdrop-blur-xl shadow-2xl z-[800] flex flex-col"
          style={{ borderLeft: "1px solid rgba(0,0,0,0.08)" }}
        >
          <div className="relative overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(135deg, ${info.color}22, ${info.color}11)` }}>
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 80% 50%, ${info.color}18, transparent 70%)` }} />
            <div className="relative px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-md"
                  style={{ background: info.bgColor }}
                >
                  {info.icon}
                </motion.div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-black/5 hover:bg-black/10 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0 mt-0.5"
                >
                  ✕
                </button>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
                  style={{ background: info.bgColor, color: info.color }}
                >
                  {info.icon} {info.label}
                </div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{name}</h2>
              </motion.div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-4 space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-4 space-y-2"
                style={{ background: "#f8fffe", border: "1px solid #e8f5f0" }}
              >
                <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-3">📍 Koordinat</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-green-100">
                    <div className="text-[10px] text-gray-400 mb-1">Bujur (Longitude)</div>
                    <div className="text-sm font-mono font-medium text-gray-800">{lng}°</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-green-100">
                    <div className="text-[10px] text-gray-400 mb-1">Lintang (Latitude)</div>
                    <div className="text-sm font-mono font-medium text-gray-800">{lat}°</div>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full mt-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: info.color, color: "white" }}
                >
                  🗺️ Buka di Google Maps
                </a>
              </motion.div>

              {details.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2"
                >
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ℹ️ Informasi Detail</h3>
                  {details.map((d, i) => (
                    <motion.div
                      key={d.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.28 + i * 0.05 }}
                      className="flex items-start gap-3 bg-gray-50 rounded-xl px-3.5 py-3"
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">{d.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-gray-400 mb-0.5">{d.label}</div>
                        <div className="text-sm text-gray-800 font-medium break-words">{d.value}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">🔖 Data OSM</h3>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3.5 py-3">
                  <span className="text-base">🆔</span>
                  <div>
                    <div className="text-[10px] text-gray-400 mb-0.5">OSM ID</div>
                    <div className="text-sm font-mono text-gray-700">{p?.osm_id}</div>
                  </div>
                </div>
                {p?.osm_type && (
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3.5 py-3">
                    <span className="text-base">📄</span>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">Tipe OSM</div>
                      <div className="text-sm text-gray-700">{p.osm_type}</div>
                    </div>
                  </div>
                )}
              </motion.div>

              {details.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center py-6 text-gray-400"
                >
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-sm">Data detail tidak tersedia</div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

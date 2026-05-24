import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import { LocationFeature, CategoryKey, getCategoryKey, getDisplayName, CATEGORIES } from "@/data/types";
import type { GeoJSONData } from "@/data/types";
import SearchBar from "./SearchBar";
import LayerControlPanel from "./LayerControlPanel";
import LocationPanel from "./LocationPanel";
import geoData from "@/data/mataram.json";

const CENTER: [number, number] = [-8.593, 116.1005];
const ZOOM = 14;

function createMarkerIcon(emoji: string, color: string, selected: boolean) {
  const size = selected ? 40 : 34;
  const border = selected ? `3px solid #f59e0b` : `2px solid white`;
  const shadow = selected
    ? `0 0 0 4px ${color}44, 0 4px 14px rgba(0,0,0,0.35)`
    : "0 3px 10px rgba(0,0,0,0.25)";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:${border};border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:${shadow};cursor:pointer;"><span style="transform:rotate(45deg);font-size:${selected ? 17 : 15}px;line-height:1;">${emoji}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function MapLayerManager({
  features, visibleLayers, selected, onMarkerClick,
}: {
  features: LocationFeature[];
  visibleLayers: Set<CategoryKey>;
  selected: LocationFeature | null;
  onMarkerClick: (f: LocationFeature) => void;
}) {
  const map = useMap();
  const groupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!groupRef.current) groupRef.current = L.layerGroup().addTo(map);
    groupRef.current.clearLayers();
    features.forEach((f) => {
      const cat = getCategoryKey(f.properties);
      if (!visibleLayers.has(cat)) return;
      const info = CATEGORIES[cat];
      const [lng, lat] = f.geometry.coordinates;
      const isSel = selected?.properties.osm_id === f.properties.osm_id;
      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(info.icon, info.color, isSel),
        zIndexOffset: isSel ? 2000 : 0,
      });
      marker.bindTooltip(
        `<div style="font-size:12px;font-weight:600;padding:3px 8px;border-radius:8px;background:white;color:#1f2937;border:1px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,0.1)">${info.icon} ${getDisplayName(f.properties)}</div>`,
        { permanent: false, direction: "top", offset: [0, -32] }
      );
      marker.on("click", () => onMarkerClick(f));
      groupRef.current!.addLayer(marker);
    });
  }, [map, features, visibleLayers, selected, onMarkerClick]);

  useEffect(() => () => { groupRef.current?.remove(); }, []);
  return null;
}

function FlyToFeature({ feature }: { feature: LocationFeature | null }) {
  const map = useMap();
  const prev = useRef<LocationFeature | null>(null);
  useEffect(() => {
    if (!feature || feature === prev.current) return;
    prev.current = feature;
    const [lng, lat] = feature.geometry.coordinates;
    map.flyTo([lat, lng], 17, { duration: 1.0, easeLinearity: 0.25 });
  }, [feature, map]);
  return null;
}

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvents({ zoom: (e) => onZoom(e.target.getZoom()) });
  return null;
}

function MapInitializer({ onMap }: { onMap: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onMap(map); }, [map, onMap]);
  return null;
}

export default function MapView() {
  const [selected, setSelected] = useState<LocationFeature | null>(null);
  const [flyTarget, setFlyTarget] = useState<LocationFeature | null>(null);
  const [zoom, setZoom] = useState(ZOOM);
  const [gpsState, setGpsState] = useState<"idle" | "loading" | "active">("idle");
  const mapInstanceRef = useRef<L.Map | null>(null);
  const gpsMarkerRef = useRef<L.CircleMarker | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<CategoryKey>>(
    new Set(Object.keys(CATEGORIES) as CategoryKey[])
  );

  const data = geoData as GeoJSONData;
  const validFeatures = data.features.filter(
    (f) =>
      f.geometry?.coordinates?.length === 2 &&
      typeof f.geometry.coordinates[0] === "number" &&
      typeof f.geometry.coordinates[1] === "number"
  );

  const counts = {} as Record<CategoryKey, number>;
  validFeatures.forEach((f) => {
    const k = getCategoryKey(f.properties);
    counts[k] = (counts[k] || 0) + 1;
  });

  const toggleLayer = useCallback((key: CategoryKey) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const handleSelect = useCallback((feature: LocationFeature) => {
    setSelected(feature);
    setFlyTarget(feature);
  }, []);

  const handleMarkerClick = useCallback((feature: LocationFeature) => {
    setSelected((prev) =>
      prev?.properties.osm_id === feature.properties.osm_id ? null : feature
    );
    setFlyTarget(null);
  }, []);

  const handleGPS = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || gpsState === "loading") return;
    setGpsState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (gpsMarkerRef.current) { gpsMarkerRef.current.remove(); }
        const marker = L.circleMarker([lat, lng], {
          radius: 10, fillColor: "#3b82f6", fillOpacity: 0.9, color: "white", weight: 3,
        }).addTo(map);
        marker.bindPopup("📍 Lokasi Anda").openPopup();
        gpsMarkerRef.current = marker;
        map.flyTo([lat, lng], 16, { duration: 1.2 });
        setGpsState("active");
      },
      () => {
        setGpsState("idle");
        alert("Tidak dapat mengakses GPS. Pastikan izin lokasi diberikan.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [gpsState]);

  const visibleCount = Object.entries(counts)
    .filter(([k]) => visibleLayers.has(k as CategoryKey))
    .reduce((s, [, v]) => s + v, 0);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-green-50">
      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        <MapInitializer onMap={(m) => { mapInstanceRef.current = m; }} />
        <ZoomWatcher onZoom={setZoom} />
        <FlyToFeature feature={flyTarget} />
        <MapLayerManager
          features={validFeatures}
          visibleLayers={visibleLayers}
          selected={selected}
          onMarkerClick={handleMarkerClick}
        />
      </MapContainer>

      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 z-[700] flex items-center gap-3 flex-wrap pointer-events-auto">
        <div className="flex-1 min-w-0">
          <SearchBar features={validFeatures} onSelect={handleSelect} />
        </div>
        <div className="flex items-center gap-2">
          <LayerControlPanel visibleLayers={visibleLayers} onToggle={toggleLayer} counts={counts} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGPS}
            title="Lokasi GPS saya"
            className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/60 hover:shadow-lg transition-shadow cursor-pointer text-xl"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
          >
            {gpsState === "loading" ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block text-blue-500"
              >⟳</motion.span>
            ) : (
              <span className={gpsState === "active" ? "text-blue-500" : "text-gray-600"}>
                {gpsState === "active" ? "📍" : "🎯"}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Bottom left: zoom indicator */}
      <div className="absolute bottom-14 left-4 z-[700] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md rounded-xl px-3 py-1.5 text-xs font-mono text-gray-500 shadow border border-white/60">
          Zoom {zoom}
        </div>
      </div>

      {/* Bottom center: stats */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[700] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-md border border-white/60 text-sm whitespace-nowrap"
        >
          <span className="text-green-600 font-bold">{visibleCount}</span>
          <span className="text-gray-400 text-xs">dari {validFeatures.length} lokasi</span>
          <span className="text-gray-200">|</span>
          <span className="text-gray-500 text-xs hidden sm:inline">Mataram Baru, Lombok</span>
          <span>🌴</span>
        </motion.div>
      </div>

      <LocationPanel feature={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

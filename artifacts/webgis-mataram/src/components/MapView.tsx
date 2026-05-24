import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { AnimatePresence } from "framer-motion";
import { LocationFeature, CategoryKey, getCategoryKey, getDisplayName, CATEGORIES } from "@/data/types";
import type { GeoJSONData } from "@/data/types";
import { useApp } from "@/context/AppContext";
import { BASEMAPS } from "./BasemapControl";
import BasemapControl from "./BasemapControl";
import LocationPanel from "./LocationPanel";
import Sidebar from "./Sidebar";
import { RoutePanelInner } from "./RoutePanel";
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

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function DynamicTileLayer() {
  const { basemap } = useApp();
  const info = BASEMAPS[basemap];
  return (
    <TileLayer
      key={basemap}
      url={info.url}
      attribution={info.attribution}
      maxZoom={info.maxZoom}
    />
  );
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

  const { theme, routePickMode, setRouteFrom, setRouteTo, setRoutePickMode, routePanelOpen } = useApp();
  const isDark = theme === "dark";

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

  const handleGPSRequest = useCallback((cb?: (lat: number, lng: number) => void) => {
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
        if (cb) cb(lat, lng);
      },
      () => {
        setGpsState("idle");
        alert("Tidak dapat mengakses GPS. Pastikan izin lokasi diberikan.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [gpsState]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (routePickMode === "from") {
      setRouteFrom({ lat, lng, label: `Titik ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      setRoutePickMode(null);
    } else if (routePickMode === "to") {
      setRouteTo({ lat, lng, label: `Titik ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      setRoutePickMode(null);
    }
  }, [routePickMode, setRouteFrom, setRouteTo, setRoutePickMode]);

  const visibleCount = Object.entries(counts)
    .filter(([k]) => visibleLayers.has(k as CategoryKey))
    .reduce((s, [, v]) => s + v, 0);

  const cursorStyle = routePickMode ? "crosshair" : "grab";

  return (
    <div className={`relative w-full h-screen overflow-hidden ${isDark ? "bg-gray-950" : "bg-green-50"}`}>
      {/* Route pick mode overlay hint */}
      <AnimatePresence>
        {routePickMode && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[750] pointer-events-none">
            <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-xl flex items-center gap-2 border ${
              routePickMode === "from"
                ? "bg-blue-500 text-white border-blue-400"
                : "bg-red-500 text-white border-red-400"
            }`}>
              <span>🖱️</span>
              <span>
                {routePickMode === "from" ? "Klik peta untuk titik awal" : "Klik peta untuk titik tujuan"}
              </span>
              <span className="text-xs opacity-75">— Esc untuk batal</span>
            </div>
          </div>
        )}
      </AnimatePresence>

      <MapContainer
        center={CENTER}
        zoom={ZOOM}
        style={{ width: "100%", height: "100%", cursor: cursorStyle }}
        zoomControl={false}
        className="z-0"
      >
        <DynamicTileLayer />
        <ZoomControl position="bottomright" />
        <MapInitializer onMap={(m) => { mapInstanceRef.current = m; }} />
        <ZoomWatcher onZoom={setZoom} />
        <FlyToFeature feature={flyTarget} />
        <MapClickHandler onMapClick={handleMapClick} />
        <MapLayerManager
          features={validFeatures}
          visibleLayers={visibleLayers}
          selected={selected}
          onMarkerClick={handleMarkerClick}
        />
        <RoutePanelInner
          features={validFeatures}
          onGPSRequest={handleGPSRequest}
        />
      </MapContainer>

      {/* Top bar / Sidebar */}
      <Sidebar
        features={validFeatures}
        visibleLayers={visibleLayers}
        onToggleLayer={toggleLayer}
        counts={counts}
        onSelect={handleSelect}
        visibleCount={visibleCount}
        gpsState={gpsState}
        onGPS={() => handleGPSRequest()}
      />

      {/* Right side controls: Basemap + Zoom info */}
      <div className="absolute right-4 bottom-16 z-[700] flex flex-col items-end gap-2 pointer-events-auto">
        <BasemapControl />
        <div className={`px-3 py-1.5 rounded-xl text-xs font-mono border shadow backdrop-blur-md ${
          isDark ? "bg-gray-800/90 border-gray-700/60 text-gray-400" : "bg-white/90 border-white/60 text-gray-500"
        }`}>
          Z{zoom}
        </div>
      </div>

      {/* Info panel (slide in from right) */}
      <LocationPanel
        feature={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

export interface LocationProperties {
  osm_id: number;
  osm_type: string;
  opening_hours: string | null;
  health_facility_type: string | null;
  status: string | null;
  medical_system_western: string | null;
  rooms: number | null;
  toilets_disposal: string | null;
  operator: string | null;
  tourism: string | null;
  operator_type: string | null;
  amenity: string | null;
  beds: number | null;
  staff_count_doctors: number | null;
  network: string | null;
  access: string | null;
  staff_count_nurses: number | null;
  health_facility_level: string | null;
  toilets_handwashing: string | null;
  name: string | null;
  health_facility_bed: number | null;
}

export interface LocationFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: LocationProperties;
  id?: string | number;
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: LocationFeature[];
}

export type CategoryKey =
  | "restaurant"
  | "cafe"
  | "fast_food"
  | "bar"
  | "pub"
  | "hotel"
  | "hostel"
  | "guest_house"
  | "motel"
  | "chalet"
  | "hospital"
  | "atm"
  | "shelter"
  | "other";

export interface CategoryInfo {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  restaurant: { label: "Restoran", icon: "🍽️", color: "#e67e22", bgColor: "#fef3e8" },
  cafe: { label: "Kafe", icon: "☕", color: "#6f4e37", bgColor: "#f5ede8" },
  fast_food: { label: "Makanan Cepat Saji", icon: "🍔", color: "#e74c3c", bgColor: "#fdf0ef" },
  bar: { label: "Bar", icon: "🍺", color: "#9b59b6", bgColor: "#f5edfb" },
  pub: { label: "Pub", icon: "🍻", color: "#8e44ad", bgColor: "#f3eafa" },
  hotel: { label: "Hotel", icon: "🏨", color: "#2980b9", bgColor: "#eaf4fd" },
  hostel: { label: "Hostel", icon: "🛏️", color: "#3498db", bgColor: "#ebf5fb" },
  guest_house: { label: "Guest House", icon: "🏡", color: "#27ae60", bgColor: "#eafaf1" },
  motel: { label: "Motel", icon: "🏩", color: "#16a085", bgColor: "#e8f8f5" },
  chalet: { label: "Chalet", icon: "⛺", color: "#1abc9c", bgColor: "#e8f8f5" },
  hospital: { label: "Rumah Sakit", icon: "🏥", color: "#c0392b", bgColor: "#fdedec" },
  atm: { label: "ATM", icon: "🏧", color: "#2ecc71", bgColor: "#eafaf1" },
  shelter: { label: "Shelter", icon: "⛱️", color: "#7f8c8d", bgColor: "#f2f3f4" },
  other: { label: "Lainnya", icon: "📍", color: "#95a5a6", bgColor: "#f8f9fa" },
};

export function getCategoryKey(properties: LocationProperties): CategoryKey {
  const amenity = properties.amenity;
  const tourism = properties.tourism;
  if (amenity === "restaurant") return "restaurant";
  if (amenity === "cafe") return "cafe";
  if (amenity === "fast_food") return "fast_food";
  if (amenity === "bar") return "bar";
  if (amenity === "pub") return "pub";
  if (amenity === "hospital") return "hospital";
  if (amenity === "atm") return "atm";
  if (amenity === "shelter") return "shelter";
  if (tourism === "hotel") return "hotel";
  if (tourism === "hostel") return "hostel";
  if (tourism === "guest_house") return "guest_house";
  if (tourism === "motel") return "motel";
  if (tourism === "chalet") return "chalet";
  return "other";
}

export function getDisplayName(properties: LocationProperties): string {
  if (properties.name) return properties.name;
  const cat = getCategoryKey(properties);
  return CATEGORIES[cat].label;
}

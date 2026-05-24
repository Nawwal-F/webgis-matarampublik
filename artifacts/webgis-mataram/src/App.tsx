import { useState } from "react";
import { AppProvider } from "@/context/AppContext";
import LoadingScreen from "@/components/LoadingScreen";
import MapView from "@/components/MapView";

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <AppProvider>
      <LoadingScreen onComplete={() => setLoaded(true)} duration={7000} />
      {loaded && <MapView />}
    </AppProvider>
  );
}

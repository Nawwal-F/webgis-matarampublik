import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import MapView from "@/components/MapView";

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <LoadingScreen onComplete={() => setLoaded(true)} duration={7000} />
      {loaded && <MapView />}
    </>
  );
}

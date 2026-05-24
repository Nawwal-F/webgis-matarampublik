import { useState } from "react";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import LoadingScreen from "@/components/LoadingScreen";
import MapView from "@/components/MapView";

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <AppProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { borderRadius: "14px", fontSize: "13px" },
        }}
        richColors
      />
      <LoadingScreen onComplete={() => setLoaded(true)} duration={7000} />
      {loaded && <MapView />}
    </AppProvider>
  );
}

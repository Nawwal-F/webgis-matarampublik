import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
}

export default function LoadingScreen({ onComplete, duration = 7000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showSkip, setShowSkip] = useState(false);

  const skip = useCallback(() => {
    setVisible(false);
    setTimeout(onComplete, 600);
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const update = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(update);
      } else {
        setTimeout(() => {
          setVisible(false);
          setTimeout(onComplete, 600);
        }, 300);
      }
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [duration, onComplete]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [skip]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0a2714 0%, #1a4a28 35%, #0d3d1e 65%, #071a0f 100%)" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <FloatingLeaves />

          <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center max-w-lg">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2d8a4e, #1a5e32)", boxShadow: "0 0 40px rgba(45,138,78,0.5), 0 8px 30px rgba(0,0,0,0.4)" }}>
                <span className="text-5xl">🗺️</span>
              </div>
              <motion.div
                className="absolute -inset-2 rounded-2xl border-2 border-green-400/30"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="space-y-3"
            >
              <h1 className="text-4xl font-bold tracking-tight"
                style={{ background: "linear-gradient(135deg, #a8f5c0, #4ade80, #86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                WebGIS Mataram Baru
              </h1>
              <p className="text-green-300/80 text-lg font-light tracking-wide">
                Peta Interaktif Kota Mataram, Lombok
              </p>
              <div className="flex items-center justify-center gap-2 text-green-400/60 text-sm">
                <span>🌴</span>
                <span>Nusa Tenggara Barat, Indonesia</span>
                <span>🌴</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="w-full space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <LoadingPhase progress={progress} />
                <span className="text-green-300 font-mono tabular-nums">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #16a34a, #4ade80, #86efac)",
                    boxShadow: "0 0 12px rgba(74,222,128,0.6)"
                  }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <div className="flex justify-between text-xs text-green-400/40 font-mono">
                <span>Memuat peta...</span>
                <span>651 lokasi</span>
              </div>
            </motion.div>

            <AnimatePresence>
              {showSkip && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={skip}
                  className="px-6 py-2.5 rounded-full border border-green-500/40 text-green-300/70 text-sm hover:bg-green-500/10 hover:text-green-200 hover:border-green-400/60 transition-all duration-200 cursor-pointer"
                >
                  Lewati — tekan <kbd className="mx-1 px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">Enter</kbd> atau <kbd className="mx-1 px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">Spasi</kbd>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className="absolute bottom-8 text-green-400/30 text-xs text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            Data: OpenStreetMap Contributors
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoadingPhase({ progress }: { progress: number }) {
  const phases = [
    { threshold: 0, text: "Menginisialisasi peta..." },
    { threshold: 20, text: "Memuat data GeoJSON..." },
    { threshold: 45, text: "Memproses 651 lokasi..." },
    { threshold: 65, text: "Menyiapkan layer peta..." },
    { threshold: 80, text: "Mengkonfigurasi kontrol..." },
    { threshold: 95, text: "Selesai! Membuka peta..." },
  ];
  const current = phases.filter((p) => progress >= p.threshold).pop() ?? phases[0];
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={current.text}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className="text-green-300/70"
      >
        {current.text}
      </motion.span>
    </AnimatePresence>
  );
}

function FloatingLeaves() {
  const leaves = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 6 + Math.random() * 8,
    size: 0.7 + Math.random() * 1.1,
    emoji: ["🌿", "🍃", "🌱", "🍀", "🌾"][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute text-2xl opacity-20"
          style={{ left: `${leaf.x}%`, fontSize: `${leaf.size}rem` }}
          initial={{ y: "110vh", rotate: 0, opacity: 0 }}
          animate={{ y: "-20vh", rotate: 360, opacity: [0, 0.25, 0.15, 0] }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {leaf.emoji}
        </motion.div>
      ))}
    </div>
  );
}

// components/GuideModalReadOnly.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GuideCarousel from "./GuideCarousel";

export default function GuideModalReadOnly({
  onClose,
}: {
  onClose: () => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* X en esquina superior derecha */}
      <button
        onClick={onClose}
        className="fixed top-16 right-36 text-2xl font-bold text-white hover:text-red-500 z-[60]"
        aria-label="close"
      >
        ✕
      </button>

      {/* sombra de fondo */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/60" />

      {/* contenedor del carrusel */}
      <div className="relative flex flex-col items-center text-white px-6 py-8 w-[92vw] max-w-6xl rounded-2xl">
        <GuideCarousel onFinish={() => setReady(true)} forceLarge={true} />
      </div>
    </div>
  );
}

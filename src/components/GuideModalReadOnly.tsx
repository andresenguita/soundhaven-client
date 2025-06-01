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
        className="absolute top-6 right-6 text-3xl font-bold text-white hover:text-red-500 z-[60]"
        aria-label="close"
      >
        ✕
      </button>

      {/* Fondo difuminado */}
      <div className="absolute inset-0 backdrop-blur-xl bg-transparent" />

      {/* Contenedor del carrusel */}
      <div
        className="relative flex flex-col items-center text-white px-6 py-10
                      w-[94vw] max-w-[82rem] rounded-2xl  bg-transparent "
      >
        <GuideCarousel onFinish={() => setReady(true)} forceLarge={true} />
      </div>
    </div>
  );
}

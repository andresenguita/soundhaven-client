// components/GuideModal.tsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GuideCarousel from "./GuideCarousel";

interface Props {
  onClose: () => void;
  onCreatePlaylist?: () => void | Promise<void>;
  showCreateButton?: boolean;
}

export default function GuideModal({
  onClose,
  onCreatePlaylist,
  showCreateButton = true,
}: Props) {
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
        className="absolute top-6 left-6 text-5xl font-bold text-white hover:text-red-500 z-[60]"
        aria-label="close"
      >
        ←
      </button>

      {/* Fondo difuminado */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/60" />

      {/* Contenedor del modal */}
      <div
        className="relative flex flex-col items-center text-white px-6 py-10
                   w-[94vw] max-w-[82rem] rounded-2xl bg-transparent"
      >
        <GuideCarousel onFinish={() => setReady(true)} forceLarge={true} />

        {showCreateButton && (
          <div className="mt-6 flex justify-center">
            <AnimatePresence>
              {ready && (
                <motion.button
                  key="cta"
                  onClick={onCreatePlaylist}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.35 }}
                  className="px-10 py-3 rounded-full font-semibold
                             bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg"
                >
                  Crear playlist y comenzar
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

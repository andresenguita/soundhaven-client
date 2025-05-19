import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GuideCarousel from "./GuideCarousel";

type Props = {
  onClose: () => void;
  onCreatePlaylist: () => void | Promise<void>;
};

export default function GuideModal({ onClose, onCreatePlaylist }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-xl  bg-black/60  " />

      <div
        className="relative flex flex-col items-center text-white px-16 py-12
             w-[96vw] max-w-7xl rounded-2xl border border-transparent bg-transparent"
      >
        {/* flecha roja */}
        <button
          onClick={onClose}
          className="fixed top-6 left-6 z-[60] text-red-400 hover:text-red-500 transition"
          aria-label="logout"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <GuideCarousel onFinish={() => setReady(true)} />

        <div className="mt-6 flex justify-center h-14">
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
                           bg-emerald-500 hover:bg-emerald-600 text-black"
              >
                Crear playlist y comenzar
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

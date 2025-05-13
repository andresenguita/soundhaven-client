import React from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Card3DProps {
  id: string;
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
  onSelect: () => void;
}

const layoutTransition = { type: "spring", stiffness: 500, damping: 30 };

export default function Card3D({
  id,
  front,
  back,
  isFlipped,
  onSelect,
}: Card3DProps) {
  return (
    <motion.div
      layoutId={id}
      /* w-72 ≈ 18 rem; cambia si quieres más grande o pequeño
         aspect-[2/3] asegura alto = ancho × 1.5  */
      className={`relative w-72 aspect-[2/3] perspective cursor-pointer ${
        isFlipped ? "invisible" : ""
      }`}
      onClick={onSelect}
      transition={layoutTransition}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front side */}
        <div className="absolute inset-0 backface-hidden rounded-md overflow-hidden shadow-lg">
          {front}
        </div>
        {/* Back side */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-md overflow-hidden shadow-lg">
          {back}
        </div>
      </motion.div>
    </motion.div>
  );
}

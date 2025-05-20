// components/Card3D.tsx
import React from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Card3DProps {
  id: string;
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
  onSelect: () => void;
  description?: string;
  disabled?: boolean;
}

const layoutTransition = { type: "spring", stiffness: 500, damping: 30 };

export default function Card3D({
  id,
  front,
  back,
  isFlipped,
  onSelect,
  description,
  disabled = false,
}: Card3DProps) {
  return (
    <motion.div
      layoutId={id}
      className={`relative w-72 aspect-[2/3] perspective group ${
        disabled ? "cursor-default" : "cursor-pointer"
      } ${isFlipped ? "invisible" : ""}`}
      onClick={() => {
        if (!disabled) onSelect();
      }}
      transition={layoutTransition}
    >
      {/* Descripción al hacer hover */}
      {!isFlipped && description && (
        <div
          className="m-0 absolute top-0 left-0 w-full z-20 px-4 py-2 text-sm text-white bg-black/60 
                      opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 
                      transition-all duration-300 scale-95 rounded-xl shadow-lg mt-1 "
        >
          {description}
        </div>
      )}

      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Cara frontal */}
        <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden shadow-lg hover:border-2 border border-zinc-700/60  hover:border-emerald-500 hover:scale-105 transition-all">
          {front}
        </div>

        {/* Cara trasera */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-xl overflow-hidden shadow-lg">
          {back}
        </div>
      </motion.div>
    </motion.div>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface ModalCardProps {
  open: boolean;
  id: string;
  children: ReactNode;
  onClose: () => void;
}

const layoutTransition = { type: "spring", stiffness: 500, damping: 30 };

export default function ModalCard({
  open,
  id,
  children,
  onClose,
}: ModalCardProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Wrapper flex que centra el contenido */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              layoutId={id}
              transition={layoutTransition}
              /* 83 vh de alto, proporción 2:3, sin salirse de 90 vw */
              className="h-[83vh] max-h-[90vh] aspect-[2/3] max-w-[90vw]
                         w-auto rounded-md overflow-hidden"
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

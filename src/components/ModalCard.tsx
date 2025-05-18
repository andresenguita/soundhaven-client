// components/ModalCard.tsx
import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  id?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function ModalCard({ open, id, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
      {/* sombreado y blur de fondo */}
      <div
        className="absolute inset-0 bg-transparent backdrop-blur-sm backdrop-brightness-50"
        onClick={onClose}
      />

      {/* contenido de la carta centrado y más grande */}
      <div
        id={id}
        className="relative bg-transparent text-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-[95vw] sm:max-w-lg w-full"
      >
        {/* botón cerrar arriba a la derecha */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl leading-none hover:text-red-500 transition"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}

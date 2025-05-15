import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  id?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function ModalCard({ open, id, onClose, children }: Props) {
  /* Cerrar con Escape cuando está abierto */
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* sombreado */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* contenido */}
      <div
        id={id}
        className="relative bg-zinc-900 text-white rounded-2xl shadow-2xl p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl leading-none hover:text-zinc-300"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

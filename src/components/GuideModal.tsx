import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

const slides = [
  { img: "/guide/step1.png", caption: "Gira una de las tres cartas diarias" },
  { img: "/guide/step2.png", caption: "Escucha la canción que revela" },
  { img: "/guide/step3.png", caption: "Añádela a tu playlist SoundHaven" },
];

export default function GuideModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* Fondo oscurecido */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        {/* Ventana */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm sm:max-w-lg lg:max-w-2xl bg-zinc-800 text-white rounded-2xl p-6 space-y-6">
              <img
                src={slides[idx].img}
                alt=""
                className="w-full object-cover rounded-lg"
              />
              <p className="text-center">{slides[idx].caption}</p>

              {/* Controles */}
              <div className="flex justify-between">
                <button
                  disabled={idx === 0}
                  onClick={() => setIdx((i) => Math.max(i - 1, 0))}
                  className="disabled:opacity-30"
                >
                  ← Prev
                </button>
                {idx < slides.length - 1 ? (
                  <button
                    onClick={() =>
                      setIdx((i) => Math.min(i + 1, slides.length - 1))
                    }
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="font-semibold text-emerald-400"
                  >
                    Got it!
                  </button>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

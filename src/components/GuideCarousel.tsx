import { useEffect, useState } from "react";

/* 6 pasos de la guía */
const slides = [
  { img: "/guide/step1A.png", caption: "Flip one of the three daily cards" },
  { img: "/guide/step2.png", caption: "Listen to the track it reveals" },
  { img: "/guide/step3.png", caption: "Add it to your SoundHaven playlist" },
  { img: "/guide/step4.png", caption: "Keep your daily streak alive" },
  { img: "/guide/step5.png", caption: "Share a card with friends" },
  { img: "/guide/step6.png", caption: "Explore your discovery log" },
];

type Props = { onFinish?: () => void };

export default function GuideCarousel({ onFinish }: Props) {
  const [idx, setIdx] = useState(0);
  const [visited, setVisited] = useState(() =>
    Array(slides.length).fill(false)
  );

  /* Avanza / retrocede sin loop */
  const go = (d: -1 | 1) =>
    setIdx((i) => Math.min(Math.max(i + d, 0), slides.length - 1));

  /* Marca visitada */
  useEffect(() => {
    setVisited((v) => {
      if (v[idx]) return v;
      const clone = [...v];
      clone[idx] = true;
      return clone;
    });
  }, [idx]);

  /* Callback al terminar */
  useEffect(() => {
    if (visited.every(Boolean)) onFinish?.();
  }, [visited, onFinish]);

  return (
    <section
      className="mt-6 inline-flex flex-col items-center gap-6
                 bg-zinc-800/30 border border-zinc-700/60 backdrop-blur-md
                 px-16 py-8 rounded-2xl"
    >
      <h2 className="text-lg font-semibold text-zinc-200">HOW DOES IT WORK?</h2>

      {/* Imagen (relative) + flechas absolutas */}
      <div className="relative">
        <img
          src={slides[idx].img}
          alt=""
          className="w-[32rem] md:w-[38rem] lg:w-[44rem] aspect-video rounded-md shadow-md object-cover mx-auto"
        />

        <Arrow
          dir="prev"
          disabled={idx === 0}
          onClick={() => go(-1)}
          position="left"
        />
        <Arrow
          dir="next"
          disabled={idx === slides.length - 1}
          onClick={() => go(1)}
          position="right"
        />
      </div>

      <p className="text-center text-sm md:text-base">{slides[idx].caption}</p>

      {/* dots */}
      <div className="flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-3 h-3 rounded-full transition
                        ${
                          i === idx
                            ? "bg-emerald-400 scale-110"
                            : "bg-zinc-500/40 hover:bg-zinc-400/70"
                        }`}
            aria-label={`go to step ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------- Flecha ---------- */
function Arrow({
  dir,
  position,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  position: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  const rotate = dir === "next" ? "rotate-180" : "";
  const side =
    position === "left"
      ? "left-0 -translate-x-full"
      : "right-0 translate-x-full";
  const invisible = disabled ? "opacity-0 pointer-events-none" : "";

  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 ${side}
                 w-10 h-24 flex items-center justify-center
                 bg-zinc-600 hover:bg-zinc-500 transition ${invisible}`}
      style={{
        borderRadius:
          dir === "prev" ? "0.375rem 0 0 0.375rem" : "0 0.375rem 0.375rem 0",
      }}
      aria-label={dir}
    >
      <svg
        viewBox="0 0 24 24"
        className={`w-5 h-5 text-white ${rotate}`}
        fill="currentColor"
      >
        <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
      </svg>
    </button>
  );
}

import { useEffect, useState } from "react";

/* 6 pasos de la guía */
const slides = [
  {
    img: "/guide/step1.png",
    title: "WELCOME TO SOUNDHAVEN",
    caption:
      "Welcome to SoundHaven! Let images guide you to songs that speak beyond sound",
  },
  {
    img: "/guide/step2.png",
    title: "PICK ONE CARD",
    caption:
      "Pick one card. Each card hides a song and its image hints at the mood behind it",
  },
  {
    img: "/guide/step3.png",
    title: "FLIP AND LISTEN",
    caption: "Turn the card to reveal the track and start listening",
  },
  {
    img: "/guide/step4.png",
    title: "ADD IT TO YOUR PLAYLIST",
    caption:
      "Add the songs you connect with to your personal SoundHaven playlist",
  },
  {
    img: "/guide/step5.png",
    title: "NEW CARDS EVERY DAY",
    caption: "Cards refresh every 24 hours",
  },
  {
    img: "/guide/step6.png",
    title: "CURATED WITH INTENTION",
    caption:
      "These songs are handpicked from books and trusted music communities",
  },
  {
    img: "/guide/step7.png",
    title: "YOUR PLAYLIST IN SPOTIFY",
    caption:
      "Access your SoundHaven playlist anytime directly from your Spotify library",
  },
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
      className="mt- w-full max-w-4xl mx-auto flex flex-col items-center gap-6
             
             px-4 sm:px-8 py-8 rounded-2xl "
    >
      {/* Imagen (relative) + flechas absolutas */}
      <div className="relative">
        <img
          src={slides[idx].img}
          alt=""
          className="w-[32rem] md:w-[38rem] lg:w-[44rem] aspect-video rounded-md  object-cover mx-auto border border-emerald-400/30 mt-0"
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

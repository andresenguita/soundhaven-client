// components/GuideCarousel.tsx
import { useEffect, useState } from "react";

const slides = [
  {
    img: "/guide/welcome.png",
    title: "WELCOME TO SOUNDHAVEN",
    caption: "A different way to discover music.",
  },
  {
    img: "/guide/cards.png",
    title: "CHOOSE ONE CARD",
    caption: "3 cards a day. Choose just one.",
  },
  {
    img: "/guide/flip.png",
    title: "FLIP AND LISTEN",
    caption: "Discover a hidden gem.",
  },
  {
    img: "/guide/add.png",
    title: "ADD TO PLAYLIST",
    caption: "Play it. Love it. Add it.",
  },
  {
    img: "/guide/daily.png",
    title: "NEW CARDS EVERY DAY",
    caption: "Cards refresh every 24 hours.",
  },
  {
    img: "/guide/curation.png",
    title: "HANDPICKED MUSIC",
    caption: "Selected from books and trusted communities.",
  },
  {
    img: "/guide/playlist.png",
    title: "YOUR SPOTIFY PLAYLIST",
    caption: "Your daily discoveries, saved in your SoundHaven playlist.",
  },
  {
    img: "/guide/vault.png",
    title: "HAVEN VAULT",
    caption: "Revisit every card you’ve flipped.",
  },
  {
    img: "/guide/start.png",
    title: "READY?",
    caption: "Let’s begin your journey.",
  },
];

type Props = {
  onFinish?: () => void;
  forceLarge?: boolean;
};

export default function GuideCarousel({ onFinish, forceLarge = false }: Props) {
  const [idx, setIdx] = useState(0);
  const [visited, setVisited] = useState(() =>
    Array(slides.length).fill(false)
  );

  const go = (d: -1 | 1) =>
    setIdx((i) => Math.min(Math.max(i + d, 0), slides.length - 1));

  useEffect(() => {
    setVisited((v) => {
      if (v[idx]) return v;
      const clone = [...v];
      clone[idx] = true;
      return clone;
    });
  }, [idx]);

  useEffect(() => {
    if (visited.every(Boolean)) onFinish?.();
  }, [visited, onFinish]);

  return (
    <section
      className={`mt-0 w-full ${
        forceLarge ? "max-w-[98vw]" : "max-w-6xl"
      } mx-auto flex flex-col items-center gap-6 px-0 sm:px-0 py-0 rounded-2xl`}
    >
      <div className="relative">
        <img
          src={slides[idx].img}
          alt={slides[idx].title}
          className={`aspect-video rounded-md object-cover mx-auto border border-emerald-400/30 ${
            forceLarge ? "w-[72rem]" : "w-[32rem] md:w-[38rem] lg:w-[44rem]"
          }`}
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

      <p className="text-center text-sm md:text-base text-white">
        {slides[idx].caption}
      </p>

      <div className="flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-3 h-3 rounded-full transition ${
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

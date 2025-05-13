import { useState, useEffect } from "react";
import { LayoutGroup } from "framer-motion";
import Card3D from "../components/Card3D";
import ModalCard from "../components/ModalCard";
import CardBack from "../components/CardBack";
import { useCountdown } from "../hooks/useCountdown";
import { useSpotify } from "../context/SpotifyContext";

interface CardData {
  img: string;
  title: string;
  artist: string;
  uri: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? ""; // ← NUEVO

export default function CardsPage() {
  const { logout, token } = useSpotify();
  const time = useCountdown();
  const [cards, setCards] = useState<CardData[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/api/cards`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: CardData[]) => setCards(data))
      .catch(console.error);
  }, [token]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="relative flex items-start justify-between p-8">
        <button
          onClick={logout}
          className="underline text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Log out
        </button>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mt-7 mx-auto">
          Sound<span className="text-emerald-400">Haven</span>
        </h1>
        <div className="w-7 h-7" />
      </header>

      <LayoutGroup>
        {/* Cartas */}
        <section className="flex-grow flex justify-center items-center">
          <div className="flex gap-14">
            {cards.map((c, i) => (
              <Card3D
                key={i}
                id={`card-${i}`}
                front={
                  <img
                    src={c.img}
                    alt={c.title}
                    className="w-full h-full object-cover"
                  />
                }
                back={
                  <CardBack
                    title={c.title}
                    artist={c.artist}
                    uri={c.uri}
                    token={token!}
                    onAdd={() => console.log("Añadir", c.uri)}
                  />
                }
                isFlipped={i === selected}
                onSelect={() => setSelected(i)}
              />
            ))}
          </div>
        </section>

        {/* Modal ampliado */}
        {selected !== null && (
          <ModalCard
            open
            id={`card-${selected}`}
            onClose={() => setSelected(null)}
          >
            <CardBack
              title={cards[selected].title}
              artist={cards[selected].artist}
              uri={cards[selected].uri}
              token={token!}
              onAdd={() => console.log("Añadir", cards[selected].uri)}
            />
          </ModalCard>
        )}
      </LayoutGroup>

      {/* Countdown */}
      <footer className="py-8 text-center text-zinc-400 text-xl">
        Our next sound voyage in: <span className="font-medium">{time}</span>
      </footer>
    </main>
  );
}

import { useState, useEffect } from "react";
import { LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card3D from "../components/Card3D";
import ModalCard from "../components/ModalCard";
import CardBack from "../components/CardBack";
import GuideModal from "../components/GuideModal";
import { useCountdown } from "../hooks/useCountdown";
import { useSpotify } from "../context/SpotifyContext";

interface CardData {
  img: string;
  title: string;
  artist: string;
  uri: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function CardsPage() {
  const { logout, token } = useSpotify();
  const navigate = useNavigate();
  const time = useCountdown();

  const [cards, setCards] = useState<CardData[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  /* ── 1. Mostrar guía la 1ª vez ─────────────────────────── */
  useEffect(() => {
    if (!localStorage.getItem("firstLoginDone")) setShowGuideModal(true);
  }, []);

  /* ── 2. Traer las cartas ───────────────────────────────── */
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

  /* ── 3. Handlers del modal guía ────────────────────────── */
  const handleCreatePlaylistAndContinue = async () => {
    try {
      await fetch(`${API_URL}/api/playlist/create`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem("firstLoginDone", "true");
    setShowGuideModal(false);
  };

  const handleLogoutAndBack = () => {
    localStorage.removeItem("firstLoginDone");
    logout(); // mismo efecto que botón «LogOut»
    navigate("/"); // redirige al login
  };

  /* ── 4. Render ─────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white flex flex-col">
      <header className="relative flex items-start justify-between p-8">
        <button
          onClick={logout}
          className="underline text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← LogOut
        </button>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mt-7 mx-auto">
          Sound<span className="text-emerald-400">Haven</span>
        </h1>

        <div className="w-7 h-7" />
      </header>

      <LayoutGroup>
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

      {/* Guía inicial */}
      {showGuideModal && (
        <GuideModal
          onClose={handleLogoutAndBack} // flecha roja = logout
          onCreatePlaylist={handleCreatePlaylistAndContinue}
        />
      )}

      <footer className="py-8 text-center text-zinc-400 text-xl">
        Our next sound voyage in: <span className="font-medium">{time}</span>
      </footer>
    </main>
  );
}

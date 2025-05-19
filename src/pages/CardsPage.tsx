// pages/CardsPage.tsx
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
  cover: string;
  description: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function CardsPage() {
  const { logout, token } = useSpotify();
  const navigate = useNavigate();
  const time = useCountdown();

  const [cards, setCards] = useState<CardData[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [visibleCards, setVisibleCards] = useState<CardData[]>([]);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [addedUris, setAddedUris] = useState<string[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("firstLoginDone")) setShowGuideModal(true);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/cards`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data: CardData[]) => {
        setCards(data);
        setVisibleCards(getRandomCards(data, 3));
      })
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (parseInt(time) === 0 && cards.length > 0) {
      setVisibleCards(getRandomCards(cards, 3));
      setSelected(null);
    }
  }, [time]);

  const getRandomCards = (data: CardData[], count: number) => {
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleCreatePlaylistAndContinue = async () => {
    try {
      const res = await fetch(`${API_URL}/api/playlist/create`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("No se pudo crear la playlist");
      }

      localStorage.setItem("firstLoginDone", "true");
      setShowGuideModal(false);
    } catch (e) {
      console.error("❌ Error al crear playlist:", e);
      // aquí puedes mostrar un error visual si quieres
    }
  };

  const handleLogoutAndBack = () => {
    localStorage.removeItem("firstLoginDone");
    logout();
    navigate("/");
  };

  const handleAddToPlaylist = async (uri: string) => {
    try {
      const res = await fetch(`${API_URL}/api/playlist/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uri }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "No se pudo añadir a la playlist");

      setAddedUris((prev) => [...prev, uri]);
      console.log("✅ Añadida a la playlist");
    } catch (e) {
      console.error("❌ Error al añadir canción:", e);
    }
  };

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
      </header>

      <LayoutGroup>
        <div className="flex-grow flex items-center justify-center">
          <div className="flex gap-10 flex-wrap justify-center items-center">
            {visibleCards.map((card, i) => (
              <Card3D
                key={i}
                id={`card-${i}`}
                front={
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                }
                back={
                  <CardBack
                    {...card}
                    img={card.cover}
                    token={token!}
                    onAdd={() => handleAddToPlaylist(card.uri)}
                    showControls={false}
                    isAdded={addedUris.includes(card.uri)}
                  />
                }
                isFlipped={selected === i}
                onSelect={() => setSelected(i)}
                description={card.description}
              />
            ))}
          </div>
        </div>
      </LayoutGroup>

      <footer className="pb-8 pt-5 text-center text-zinc-400 text-lg">
        Our next sound voyage in: <span className="font-medium">{time}</span>
      </footer>

      {showGuideModal && (
        <GuideModal
          onClose={handleLogoutAndBack}
          onCreatePlaylist={handleCreatePlaylistAndContinue}
        />
      )}

      <ModalCard open={selected !== null} onClose={() => setSelected(null)}>
        {selected !== null && (
          <CardBack
            {...visibleCards[selected]}
            img={visibleCards[selected].cover}
            token={token!}
            onAdd={() => handleAddToPlaylist(visibleCards[selected].uri)}
            isAdded={addedUris.includes(visibleCards[selected].uri)}
          />
        )}
      </ModalCard>
    </main>
  );
}

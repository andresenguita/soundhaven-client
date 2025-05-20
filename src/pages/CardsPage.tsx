// pages/CardsPage.tsx
import { useState, useEffect, useRef } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localStorage.getItem("firstLoginDone")) setShowGuideModal(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUserId(data.userId);
        setAvatarUrl(data.avatarUrl ?? null);
      })
      .catch((err) => console.error("No se pudo obtener userId", err));

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
    if (!token || !userId) return;

    fetch(`${API_URL}/api/discovery/all?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((logs) => {
        const uris = logs
          .filter((log: any) => log.added)
          .map((log: any) => log.trackUri);
        setAddedUris(uris);
      })
      .catch((err) => console.error("Error cargando DiscoveryLogs:", err));
  }, [token, userId]);

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

  const handleFlip = async (index: number) => {
    const card = visibleCards[index];
    setSelected(index);

    if (!userId || !card) return;

    try {
      await fetch(`${API_URL}/api/discovery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          cardTitle: card.title,
          trackUri: card.uri,
          added: false,
        }),
      });
    } catch (err) {
      console.error("❌ Error al guardar DiscoveryLog", err);
    }
  };

  const handleCloseCard = async () => {
    if (selected === null || !userId || !token) {
      setSelected(null);
      return;
    }

    const card = visibleCards[selected];

    try {
      await fetch(`${API_URL}/api/discovery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          cardTitle: card.title,
          trackUri: card.uri,
          added: addedUris.includes(card.uri),
        }),
      });
    } catch (err) {
      console.error("❌ Error al guardar DiscoveryLog", err);
    } finally {
      setSelected(null);
    }
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

      await fetch(`${API_URL}/api/discovery/mark-as-added`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          trackUri: uri,
        }),
      });
    } catch (e) {
      console.error("❌ Error al añadir canción o marcar en log:", e);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-black to-zinc-950 text-white flex flex-col">
      <header className="relative flex items-center justify-between p-6 pb-0">
        <h1 className="text-8xl sm:text-7xl font-extrabold tracking-tight mx-auto mt-12">
          Sound<span className="text-emerald-400">Haven</span>
        </h1>

        <div className="absolute top-12 right-10" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-lg font-medium hover:text-emerald-400"
          >
            <img
              src={avatarUrl ?? "/avatar.png"}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-2   border-white hover:border-emerald-400 hover:scale-110 transition object-cover"
            />
          </button>
          {menuOpen && (
            <div className=" mt-4 bg-zinc-800 text-white rounded-lg shadow-lg w-32 absolute right-0 z-50">
              <ul className="flex flex-col divide-y divide-zinc-700">
                <li>
                  <button
                    onClick={() => {
                      navigate("/discoveries");
                      setMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 hover:bg-zinc-700 hover:text-emerald-400  rounded-t-lg"
                  >
                    Haven Vault
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleLogoutAndBack();
                      setMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 hover:bg-zinc-700 hover:text-emerald-400  rounded-b-lg "
                  >
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      <LayoutGroup>
        <div className="flex-grow flex items-center justify-center ">
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
                onSelect={() => handleFlip(i)}
                description={card.description}
              />
            ))}
          </div>
        </div>
      </LayoutGroup>

      <footer className="pt-0 pb-14 text-center text-zinc-500 text-2xl">
        Our next sound voyage in: <span className="font-medium">{time}</span>
      </footer>

      {showGuideModal && (
        <GuideModal
          onClose={handleLogoutAndBack}
          onCreatePlaylist={handleCreatePlaylistAndContinue}
        />
      )}

      <ModalCard open={selected !== null} onClose={handleCloseCard}>
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

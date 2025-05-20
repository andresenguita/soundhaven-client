import { useEffect, useState } from "react";
import { LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card3D from "../components/Card3D";
import CardBack from "../components/CardBack";
import { useSpotify } from "../context/SpotifyContext";
import ModalCard from "../components/ModalCard";

interface DiscoveryLog {
  id: string;
  cardTitle: string;
  trackUri: string;
  createdAt: string;
  added: boolean;
}

interface CardData {
  img: string;
  title: string;
  artist: string;
  uri: string;
  cover: string;
  description: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function DiscoveriesPage() {
  const { token, logout } = useSpotify();
  const navigate = useNavigate();

  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [discoveries, setDiscoveries] = useState<DiscoveryLog[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUserId(data.userId))
      .catch((err) => console.error("No se pudo obtener userId", err));
  }, [token]);

  useEffect(() => {
    if (!token || !userId) return;

    fetch(`${API_URL}/api/discovery/all?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setDiscoveries(data))
      .catch((err) => console.error("Error cargando discoveries", err));

    fetch(`${API_URL}/api/cards`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setCards(data))
      .catch(console.error);
  }, [token, userId]);

  const findCardData = (uri: string): CardData | undefined =>
    cards.find((c) => c.uri === uri);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-black to-emerald-800 text-white px-6 py-5">
      <button
        className=" hover:text-emerald-500 text-5xl font-semibold absolute top-9 left-24"
        onClick={() => navigate("/cards")}
      >
        ←
      </button>
      <div className="flex justify-between items-center px-8 mb-4">
        <h1 className="text-5xl sm:text-5xl font-extrabold tracking-tight mt-4 mb-8 mx-auto">
          Haven<span className="text-emerald-400"> Vault</span>
        </h1>
      </div>
      <p className="text-center text-lg text-zinc-300 mb-10 max-w-4xl mx-auto">
        Every card you’ve flipped lives here — a haven for the songs that once
        found you. Revisit, replay, rediscover.
      </p>

      <LayoutGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 justify-items-center px-20">
          {discoveries.map((log) => {
            const card = findCardData(log.trackUri);
            if (!card) return null;

            return (
              <Card3D
                key={log.id}
                id={`discovery-${log.id}`}
                front={
                  <div className="relative w-full h-full">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    {log.added && (
                      <span className="absolute bottom-3 right-3 text-emerald-400 text-4xl">
                        ♥
                      </span>
                    )}
                  </div>
                }
                back={<></>}
                isFlipped={false}
                onSelect={() => setSelectedCard(card)}
                description={card.description}
              />
            );
          })}
        </div>
      </LayoutGroup>
      {selectedCard && (
        <ModalCard
          open={true}
          id={`modal-${selectedCard.uri}`}
          onClose={() => setSelectedCard(null)}
        >
          <CardBack
            title={selectedCard.title}
            artist={selectedCard.artist}
            uri={selectedCard.uri}
            token={token ?? ""}
            img={selectedCard.cover}
            onAdd={async () => {
              await fetch(`${API_URL}/api/discovery/mark-as-added`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({
                  userId,
                  trackUri: selectedCard.uri,
                }),
              });

              setDiscoveries((prev) =>
                prev.map((d) =>
                  d.trackUri === selectedCard.uri ? { ...d, added: true } : d
                )
              );
            }}
            isAdded={
              discoveries.find((d) => d.trackUri === selectedCard.uri)?.added ??
              false
            }
          />
        </ModalCard>
      )}
    </main>
  );
}

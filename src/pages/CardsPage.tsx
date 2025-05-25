// pages/CardsPage.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Card3D from "../components/Card3D";
import ModalCard from "../components/ModalCard";
import CardBack from "../components/CardBack";
import GuideModal from "../components/GuideModal";
import GuideModalReadOnly from "../components/GuideModalReadOnly";
import { useCountdown } from "../hooks/useCountdown";
import { useSpotify } from "../context/SpotifyContext";
import Toast from "../components/Toast";

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
  /* ───────── context & hooks ───────── */
  const { logout, token } = useSpotify();
  const navigate = useNavigate();
  const time = useCountdown();

  /* ───────────── state ───────────── */
  const [visibleCards, setVisibleCards] = useState<CardData[]>([]);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null); // carta del día
  const [flippedIdx, setFlippedIdx] = useState<number | null>(null); // carta abierta en modal
  const [hasChosen, setHasChosen] = useState(false);
  const [initialized, setInitialized] = useState(false); // ⬅️ NUEVO

  const [addedUris, setAddedUris] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  const [playlistCreatedMsg, setPlaylistCreatedMsg] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showReadOnlyGuide, setShowReadOnlyGuide] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  /* ─────────────────────────────────── */
  /* 1. Verificar si existe la playlist */
  /* ─────────────────────────────────── */
  useEffect(() => {
    if (!token) return;

    const checkPlaylist = async () => {
      try {
        const res = await fetch(`${API_URL}/api/playlist/exists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setShowGuideModal(!data.exists); // si NO existe → muestra modal
      } catch (err) {
        console.error("Error comprobando existencia de playlist:", err);
      }
    };

    checkPlaylist();
  }, [token]);

  /* ───────────── helpers ───────────── */
  const loadCardsAndChoice = useCallback(async () => {
    if (!token || !userId) return;

    /* 1 — cartas diarias */
    const cardsRes = await fetch(
      `${API_URL}/api/cards/daily?userId=${userId}`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const cards: CardData[] = await cardsRes.json();
    setVisibleCards(cards);

    /* 2 — comprobar si ya eligió hoy */
    const logRes = await fetch(
      `${API_URL}/api/discovery/today?userId=${userId}`,
      {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (logRes.ok) {
      const { trackUri } = await logRes.json();
      const idx = cards.findIndex((c) => c.uri === trackUri);
      if (idx !== -1) {
        setChosenIdx(idx);
        setHasChosen(true);
      } else {
        setChosenIdx(null);
        setHasChosen(false);
      }
    } else {
      setChosenIdx(null);
      setHasChosen(false);
    }
    setFlippedIdx(null); // no abrir modal por defecto
    setInitialized(true);
  }, [token, userId]);

  /* ───────────── side-effects ───────────── */
  /* perfil + avatar */
  useEffect(() => {
    if (!token) return;

    (async () => {
      const me = await fetch(`${API_URL}/api/me`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setUserId(me.userId);
      setAvatarUrl(me.avatarUrl ?? null);
    })();
  }, [token]);

  /* cartas + elección del día */
  useEffect(() => {
    if (userId) loadCardsAndChoice();
  }, [userId, loadCardsAndChoice]);

  /* refresco automático a medianoche */
  useEffect(() => {
    if (time === "00h 00m 00s") loadCardsAndChoice();
  }, [time, loadCardsAndChoice]);

  /* canciones añadidas a playlist */
  useEffect(() => {
    if (!token || !userId) return;

    fetch(`${API_URL}/api/discovery/all?userId=${userId}`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((logs) =>
        setAddedUris(
          logs.filter((l: any) => l.added).map((l: any) => l.trackUri)
        )
      )
      .catch((err) => console.error("Error cargando DiscoveryLogs:", err));
  }, [token, userId]);

  /* cerrar menú si clic fuera */
  useEffect(() => {
    const outside = (e: MouseEvent) =>
      menuRef.current &&
      !menuRef.current.contains(e.target as Node) &&
      setMenuOpen(false);
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  /* ───────────── eventos carta ───────────── */
  const handleFlip = async (idx: number) => {
    if (hasChosen && idx !== chosenIdx) return; // solo deja girar la elegida

    setFlippedIdx(idx);

    if (!hasChosen) {
      setHasChosen(true);
      setChosenIdx(idx);

      const card = visibleCards[idx];
      if (!card) return;

      await fetch(`${API_URL}/api/discovery`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          cardTitle: card.title,
          trackUri: card.uri,
          added: false,
        }),
      });
    }
  };

  const handleCloseCard = () => setFlippedIdx(null);

  const handleAddToPlaylist = async (uri: string) => {
    try {
      const ok = await fetch(`${API_URL}/api/playlist/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uri }),
      }).then((r) => r.ok);
      if (!ok) throw new Error("No se pudo añadir a la playlist");

      setAddedUris((p) => [...p, uri]);

      await fetch(`${API_URL}/api/discovery/mark-as-added`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, trackUri: uri }),
      });
    } catch (e) {
      console.error("❌", e);
    }
  };

  /* ───────────── UI ───────────── */
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black text-white flex flex-col">
      {/* ░░ Header ░░ */}
      <header className="relative flex items-center justify-between p-6 pb-4">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mx-auto mt-2">
          Sound<span className="text-emerald-400">Haven</span>
        </h1>
        {initialized && (
          <div className="absolute top-7 right-7" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-lg font-medium hover:text-emerald-400"
            >
              <img
                src={avatarUrl ?? "/avatar.png"}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-2 border-white hover:border-emerald-400 hover:scale-110 transition object-cover"
              />
            </button>

            {menuOpen && (
              <div className="mt-4 bg-zinc-800 rounded-lg shadow-lg w-32 absolute right-0 z-50">
                <ul className="flex flex-col divide-y divide-zinc-700">
                  <li>
                    <button
                      onClick={() => {
                        navigate("/discoveries");
                        setMenuOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-zinc-700 hover:text-emerald-400 rounded-t-lg"
                    >
                      Haven Vault
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setShowReadOnlyGuide(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-zinc-700 hover:text-emerald-400"
                    >
                      Guide
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        localStorage.removeItem("firstLoginDone");
                        logout();
                        navigate("/");
                        setMenuOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-zinc-700 hover:text-emerald-400 rounded-b-lg"
                    >
                      Log out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </header>
      {/* ░░ prompt ░░ */}
      {initialized && !hasChosen && (
        <p className="mt-8 text-center text-2xl font-semibold text-emerald-300 animate-pulse">
          Select your daily card!
        </p>
      )}
      {/* ░░ cartas ░░ */}
      {initialized && (
        <LayoutGroup>
          <div className="flex-grow flex items-center justify-center">
            <div className="flex gap-10 flex-wrap justify-center items-center">
              {visibleCards.map((card, idx) => {
                const blocked = hasChosen && idx !== chosenIdx;
                return (
                  <div
                    key={idx}
                    className={
                      blocked ? "pointer-events-none opacity-90 grayscale" : ""
                    }
                  >
                    <Card3D
                      id={`card-${idx}`}
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
                      isFlipped={flippedIdx === idx}
                      onSelect={() => handleFlip(idx)}
                      description={card.description}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </LayoutGroup>
      )}
      {/* ░░ mensaje elección ░░ */}
      {/* ░░ footer ░░ */}
      {initialized && (
        <footer className="pt-2 pb-6 pl-6 text-left text-zinc-400 text-xl">
          Next cards in:{" "}
          <span className="font-medium animate-pulse text-emerald-400">
            {time}
          </span>
        </footer>
      )}

      {/* ░░ modales & toast ░░ */}
      {showGuideModal && (
        <GuideModal
          onClose={() => {
            localStorage.removeItem("firstLoginDone");
            logout();
            navigate("/");
          }}
          onCreatePlaylist={async () => {
            try {
              const ok = await fetch(`${API_URL}/api/playlist/create`, {
                method: "POST",
                credentials: "include",
                headers: { Authorization: `Bearer ${token}` },
              }).then((r) => r.ok);

              if (ok) {
                setShowGuideModal(false);
                setPlaylistCreatedMsg(true);
                setTimeout(() => setPlaylistCreatedMsg(false), 4000);
              }
            } catch (e) {
              console.error("❌ Error creando playlist:", e);
            }
          }}
        />
      )}
      {showReadOnlyGuide && (
        <GuideModalReadOnly onClose={() => setShowReadOnlyGuide(false)} />
      )}
      <ModalCard open={flippedIdx !== null} onClose={handleCloseCard}>
        {flippedIdx !== null && (
          <CardBack
            {...visibleCards[flippedIdx]}
            img={visibleCards[flippedIdx].cover}
            token={token!}
            onAdd={() => handleAddToPlaylist(visibleCards[flippedIdx].uri)}
            isAdded={addedUris.includes(visibleCards[flippedIdx].uri)}
          />
        )}
      </ModalCard>
      <Toast message="Playlist created!" show={playlistCreatedMsg} />
    </main>
  );
}

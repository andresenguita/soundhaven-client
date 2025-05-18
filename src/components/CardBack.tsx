// components/CardBack.tsx
import { useSpotifyPlayer } from "../context/SpotifyPlayerContext";

interface Props {
  title: string;
  artist: string;
  uri: string;
  token: string;
  img: string;
  onAdd: () => void;
  showControls?: boolean; // ← NUEVO
}

const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function CardBack({
  title,
  artist,
  uri,
  img,
  token,
  onAdd,
  showControls = true,
}: Props) {
  const { isPaused, playTrack, pause } = useSpotifyPlayer();

  const handleClick = () => {
    if (isPaused) {
      console.log("🎵 Reproduciendo:", uri);
      playTrack(uri);
    } else {
      console.log("⏸️ Pausando playback");
      pause();
    }
  };

  return (
    <div className="w-full h-full bg-gray-200 transition text-black rounded-2xl p-6 pt-8 flex flex-col items-center justify-between">
      <img
        src={img}
        alt={title}
        className="w-full max-w-xs sm:max-w-sm aspect-square object-cover rounded-xl shadow-xl"
      />

      <div className="text-center mt-7">
        <h3 className="text-2xl font-semibold mb-1">{title}</h3>
        <p className="text-base">{artist}</p>
      </div>

      {showControls && (
        <>
          <button
            onClick={handleClick}
            className="rounded-full w-14 h-14 text-2xl text-gray-200 bg-black flex items-center justify-center hover:scale-110 transition shadow-md mt-8 hover:brightness-110"
          >
            {isPaused ? "⯈" : "𝅛𝅛"}
          </button>

          <button
            onClick={onAdd}
            className="mt-7 px-6 py-2 mb-3 text-lg rounded-xl font-medium shadow-md text-gray-200 hover:brightness-110 hover:scale-105 transition bg-black"
          >
            + Add to SoundHaven playlist
          </button>
        </>
      )}
    </div>
  );
}

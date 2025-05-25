// components/CardBack.tsx
import { useSpotifyPlayer } from "../context/SpotifyPlayerContext";

interface Props {
  title: string;
  artist: string;
  uri: string;
  token: string; // (no se usa aquí, pero lo conserva el caller)
  img: string;
  onAdd: () => void;
  showControls?: boolean;
  isAdded?: boolean;
}

export default function CardBack({
  title,
  artist,
  uri,
  img,
  onAdd,
  showControls = true,
  isAdded = false,
}: Props) {
  const { isPaused, currentUri, playTrack, pause } = useSpotifyPlayer();

  /** ¿Esta carta es la que está sonando ahora mismo? */
  const isThisPlaying = currentUri === uri && !isPaused;

  const handleClick = () => {
    if (isThisPlaying) {
      pause(); // ya suena esta → pausa
    } else {
      playTrack(uri); // en cualquier otro caso → reproduce
    }
  };

  return (
    <div className="w-full h-full bg-gray-200 text-black rounded-2xl p-6 pt-8 flex flex-col items-center justify-between">
      {/* carátula */}
      <img
        src={img}
        alt={title}
        className="w-full max-w-xs sm:max-w-sm aspect-square object-cover rounded-xl shadow-xl"
      />

      {/* título / artista */}
      <div className="text-center mt-5">
        <h3 className="text-2xl font-semibold mb-1">{title}</h3>
        <p className="text-base">{artist}</p>
      </div>

      {showControls && (
        <>
          {/* botón play / pause */}
          <button
            onClick={handleClick}
            className="rounded-full w-14 h-14 text-2xl text-gray-200 bg-black flex items-center justify-center hover:scale-110 transition shadow-md mt-5 hover:brightness-110"
          >
            {isThisPlaying ? "𝅛𝅛" /* pause */ : "⯈" /* play */}
          </button>

          {/* botón añadir a playlist */}
          <button
            onClick={onAdd}
            disabled={isAdded}
            className={`mt-5 px-6 py-2 text-lg rounded-xl font-medium shadow-md transition hover:scale-105 ${
              isAdded
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:brightness-105"
                : "bg-black text-gray-200 hover:brightness-110"
            }`}
          >
            {isAdded ? "✓ Added to Playlist" : "+ Add to SoundHaven playlist"}
          </button>
        </>
      )}
    </div>
  );
}

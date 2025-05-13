import { useState, useEffect } from "react";
import type { FC } from "react";

interface CardBackProps {
  title: string;
  artist: string;
  uri: string; // spotify:track:...
  token: string; // access token de Spotify en memoria
  onAdd: () => void;
}

let sdkLoaded = false;

const CardBack: FC<CardBackProps> = ({ title, artist, uri, token, onAdd }) => {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [paused, setPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Carga el SDK solo una vez
    if (!sdkLoaded) {
      const tag = document.createElement("script");
      tag.src = "https://sdk.scdn.co/spotify-player.js";
      document.body.appendChild(tag);
      sdkLoaded = true;
    }
    // Cuando el SDK esté listo, inicializamos el player
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      const p = new Spotify.Player({
        name: "SoundHaven Player",
        getOAuthToken: (cb) => cb(token),
      });
      setPlayer(p);

      p.addListener("ready", ({ device_id }: { device_id: string }) => {
        // Transferir reproducción y empezar la pista
        fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            device_ids: [device_id],
            play: true,
            uris: [uri],
          }),
        });
      });

      p.addListener(
        "player_state_changed",
        (state: Spotify.PlaybackState | null) => {
          if (!state) return;
          setPaused(state.paused);
          setPosition(state.position);
          setDuration(state.duration);
        }
      );

      p.connect();
    };
  }, [token, uri]);

  const togglePlay = () => player?.togglePlay();
  const seek = (e: React.ChangeEvent<HTMLInputElement>) =>
    player?.seek(Number(e.target.value));

  return (
    <div className="w-full h-full bg-zinc-800 text-white flex flex-col justify-between p-6 rounded-md shadow-lg">
      <div>
        <p className="text-xl font-semibold">{title}</p>
        <p className="text-sm text-zinc-400">{artist}</p>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={togglePlay}
          className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded mb-2"
        >
          {paused ? "▶ Play" : "▮▮ Pause"}
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          value={position}
          onChange={seek}
          className="w-full"
        />
      </div>

      <button
        onClick={onAdd}
        className="self-end bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded text-lg font-bold"
      >
        ＋ Añadir
      </button>
    </div>
  );
};

export default CardBack;

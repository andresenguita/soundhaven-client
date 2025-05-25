// context/SpotifyPlayerContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

interface SpotifyPlayerContextProps {
  player: Spotify.Player | null;
  deviceId: string | null;
  isPaused: boolean;
  currentUri: string | null; // ⬅️  EXPUESTO
  playTrack: (uri: string) => void;
  pause: () => void;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextProps>({
  player: null,
  deviceId: null,
  isPaused: true,
  currentUri: null,
  playTrack: () => {},
  pause: () => {},
});

export const SpotifyPlayerProvider = ({
  token,
  children,
}: {
  token: string;
  children: ReactNode;
}) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);

  /* ───────── Cargar SDK ───────── */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: "SoundHaven Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("✅ SDK listo → device_id:", device_id);
        setDeviceId(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.warn("⚠️ SDK perdió device_id:", device_id);
        setDeviceId(null);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setIsPaused(state.paused);
        const trackUri = state.track_window.current_track?.uri ?? null;
        setCurrentUri(trackUri);
      });

      player.connect();
      playerRef.current = player;
    };
  }, [token]);

  /* ───────── helpers ───────── */
  /** Reproduce uri (si ya es la actual y está pausada → reanuda) */
  const playTrack = async (uri: string) => {
    if (!deviceId) return;

    // Aseguramos que el dispositivo web es el activo
    await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ device_ids: [deviceId], play: true }),
    });

    if (currentUri === uri && isPaused) {
      // reanudar
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } else if (currentUri !== uri) {
      // nueva canción
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [uri] }),
        }
      );
    }
  };

  const pause = async () => {
    if (!deviceId) return;
    await fetch(
      `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  return (
    <SpotifyPlayerContext.Provider
      value={{
        player: playerRef.current,
        deviceId,
        isPaused,
        currentUri,
        playTrack,
        pause,
      }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

export const useSpotifyPlayer = () => useContext(SpotifyPlayerContext);

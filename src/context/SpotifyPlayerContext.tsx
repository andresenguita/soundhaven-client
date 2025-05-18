// context/SpotifyPlayerContext.tsx
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface SpotifyPlayerContextProps {
  player: Spotify.Player | null;
  deviceId: string | null;
  isPaused: boolean;
  playTrack: (uri: string) => void;
  pause: () => void;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextProps>({
  player: null,
  deviceId: null,
  isPaused: true,
  playTrack: () => {},
  pause: () => {},
});

export const SpotifyPlayerProvider = ({
  token,
  children,
}: {
  token: string;
  children: React.ReactNode;
}) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [position, setPosition] = useState<number>(0);
  const playerRef = useRef<Spotify.Player | null>(null);

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
        console.log("✅ SDK listo con device_id:", device_id);
        setDeviceId(device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.warn("⚠️ SDK perdido para:", device_id);
        setDeviceId(null);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;
        setIsPaused(state.paused);
        setPosition(state.position);
        if (state.track_window?.current_track?.uri) {
          setCurrentUri(state.track_window.current_track.uri);
        }
      });

      player.connect();
      playerRef.current = player;
    };
  }, [token]);

  const playTrack = async (uri: string) => {
    if (!deviceId || !token) return;

    if (currentUri === uri) {
      // Reanudar desde donde se pausó
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ position_ms: position }),
        }
      );
    } else {
      // Reproducir nueva canción desde el principio
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: true,
        }),
      });

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
    if (!deviceId || !token) return;

    // Antes de pausar, obtener la posición actual
    const player = playerRef.current;
    if (player) {
      const state = await player.getCurrentState();
      if (state) {
        setPosition(state.position);
        if (state.track_window?.current_track?.uri) {
          setCurrentUri(state.track_window.current_track.uri);
        }
      }
    }

    await fetch(
      `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  return (
    <SpotifyPlayerContext.Provider
      value={{
        player: playerRef.current,
        deviceId,
        isPaused,
        playTrack,
        pause,
      }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

export const useSpotifyPlayer = () => useContext(SpotifyPlayerContext);

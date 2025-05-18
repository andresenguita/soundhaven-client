// src/context/SpotifyPlayerProviderWrapper.tsx
import { useSpotify } from "./SpotifyContext";
import { SpotifyPlayerProvider } from "./SpotifyPlayerContext";

export default function SpotifyPlayerProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useSpotify();

  if (!token) {
    console.warn("⏳ Token aún no disponible para SpotifyPlayerProvider");
    return <>{children}</>; // sigue mostrando la app sin el SDK
  }

  return (
    <SpotifyPlayerProvider token={token}>{children}</SpotifyPlayerProvider>
  );
}

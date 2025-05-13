import React, { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";

interface SpotifyContextValue {
  token: string | null;
  logout: () => void;
  initialized: boolean;
}

const SpotifyContext = createContext<SpotifyContextValue>({
  token: null,
  logout: () => {},
  initialized: false,
});

const API_URL = import.meta.env.VITE_API_URL ?? ""; // ← NUEVO

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("access_token");

    if (urlToken) {
      setToken(urlToken);
      window.history.replaceState({}, "", "/cards");
      setInitialized(true);
      return;
    }

    fetch(`${API_URL}/api/auth/refresh`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("No autenticado");
        return res.json();
      })
      .then((data: { access_token: string }) => setToken(data.access_token))
      .catch(() => setToken(null))
      .finally(() => setInitialized(true));
  }, []);

  const logout = () => {
    fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).then(() => {
      setToken(null);
      window.location.href = "/";
    });
  };

  return (
    <SpotifyContext.Provider value={{ token, logout, initialized }}>
      {children}
    </SpotifyContext.Provider>
  );
}

export const useSpotify = () => useContext(SpotifyContext);

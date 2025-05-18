import React, { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";

// Define los valores que estarán disponibles en el contexto:
// el token de acceso a Spotify, una función para cerrar sesión,
// y un indicador de si la autenticación ya se ha procesado.
interface SpotifyContextValue {
  token: string | null;
  logout: () => void;
  initialized: boolean;
}

// Crea el contexto con valores por defecto (antes de que se cargue la app).
const SpotifyContext = createContext<SpotifyContextValue>({
  token: null,
  logout: () => {},
  initialized: false,
});

// URL del backend, configurada desde variables de entorno.
const API_URL = import.meta.env.VITE_API_URL ?? "";

// Componente que envuelve la app y proporciona acceso al contexto.
export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Al iniciar la app, este efecto intenta obtener el token de acceso:
  // 1. Primero lo busca en la URL (después de iniciar sesión con Spotify).
  // 2. Si no está, intenta renovarlo mediante una cookie desde el backend.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("access_token");

    if (urlToken) {
      setToken(urlToken);
      window.history.replaceState({}, "", "/cards"); // Limpia la URL y redirige
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

  // Esta función cierra la sesión del usuario eliminando la cookie de sesión
  // en el backend y reseteando el token local.
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

// Hook personalizado para acceder al contexto desde cualquier componente.
export const useSpotify = () => useContext(SpotifyContext);

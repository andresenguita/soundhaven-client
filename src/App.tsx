// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CardsPage from "./pages/CardsPage";
import DiscoveriesPage from "./pages/DiscoveriesPage";
import { useSpotify } from "./context/SpotifyContext";

export default function App() {
  const { token, initialized } = useSpotify();

  if (!initialized) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={!token ? <LoginPage /> : <Navigate to="/cards" replace />}
      />
      <Route
        path="/cards"
        element={token ? <CardsPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/discoveries"
        element={token ? <DiscoveriesPage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

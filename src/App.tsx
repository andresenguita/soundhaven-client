// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CardsPage from "./pages/CardsPage";
import { useSpotify } from "./context/SpotifyContext";
import DiscoveriesPage from "./pages/DiscoveriesPage";

export default function App() {
  const { token, initialized } = useSpotify();

  if (!initialized) return null;

  const firstLoginDone = localStorage.getItem("firstLoginDone");

  return (
    <Routes>
      <Route
        path="/"
        element={
          !token ? (
            <LoginPage />
          ) : !firstLoginDone ? (
            <Navigate to="/guide" replace />
          ) : (
            <Navigate to="/cards" replace />
          )
        }
      />
      <Route path="/guide" element={<LoginPage showGuideOnly />} />
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

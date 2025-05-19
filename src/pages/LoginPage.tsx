// src/pages/LoginPage.tsx
import GuideCarousel from "../components/GuideCarousel";

type Props = {
  showGuideOnly?: boolean;
};

const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function LoginPage({ showGuideOnly = false }: Props) {
  const handleLogin = () => {
    window.location.href = `${API_URL}/api/auth/login`;
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white px-4">
      <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-5 mt-2 ">
        Sound<span className="text-emerald-400">Haven</span>
      </h1>

      {!showGuideOnly && (
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600
                   active:scale-95 transition font-semibold text-black
                   py-3 px-7 rounded-full mt-2 mb-7"
        >
          <img
            src="/spotify_primary_logo_rgb_black.png"
            alt=""
            className="w-6 h-6"
          />
          Login with Spotify
        </button>
      )}

      <div className="mb-1 w-full max-w-4xl ">
        <GuideCarousel />
      </div>
    </main>
  );
}

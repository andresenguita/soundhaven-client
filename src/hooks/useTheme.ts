import { useEffect, useState } from "react";

/** Hook que devuelve el tema actual y una función toggle() */
export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.theme as "light" | "dark") || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.theme = theme;
  }, [theme]);

  return { theme, toggle: () => setTheme(t => (t === "dark" ? "light" : "dark")) };
}

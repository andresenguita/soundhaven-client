import { useEffect, useState } from "react";

export function useCountdown() {
  const [delta, setDelta] = useState(calcDiff());

  useEffect(() => {
    const id = setInterval(() => setDelta(calcDiff()), 1000);
    return () => clearInterval(id);
  }, []);

  return format(delta);
}

function calcDiff() {
  const now = new Date();
  /** siguiente 00:00 UTC */
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return Math.floor((next.getTime() - now.getTime()) / 1000); // seg
}

function format(sec: number) {
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}h ${m}m ${s}s`;
}

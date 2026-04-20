import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://dm-back-fn4l.onrender.com";

export function useTrackSectorEntry(sectorKey: string) {
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !sectorKey) return;

    // evita doble conteo por StrictMode en desarrollo
    const visitKey = `metric:${sectorKey}:${location.key}`;
    if (sessionStorage.getItem(visitKey)) return;

    sessionStorage.setItem(visitKey, "1");

    fetch(`${BASE_URL}/metrics/track-sector-entry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sector_key: sectorKey,
        path: location.pathname,
      }),
    }).catch((error) => {
      console.error("Error tracking sector entry:", error);
    });
  }, [sectorKey, location.key, location.pathname]);
}
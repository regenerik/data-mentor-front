import { useEffect } from "react";

const BASE_URL = "https://dm-back-fn4l.onrender.com";

export function useTrackSectorEntry(sectorKey: string) {
  useEffect(() => {
    console.log(`Tracking entry for sector: ${sectorKey}`);
    const token = localStorage.getItem("token");
    if (!token || !sectorKey) return;

    const visitKey = `metric:${sectorKey}:${window.location.pathname}`;
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
        path: window.location.pathname,
      }),
    }).catch((error) => {
      console.error("Error tracking sector entry:", error);
    });
  }, [sectorKey]);
}
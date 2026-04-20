import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://dm-back-fn4l.onrender.com";

export function useTrackSectorEntry(sectorKey: string) {
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !sectorKey) return;

    const run = async () => {
      try {
        console.log("Tracking sector:", sectorKey, "path:", location.pathname);

        const response = await fetch(`${BASE_URL}/metrics/track-sector-entry`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sector_key: sectorKey,
            path: location.pathname,
          }),
        });

        const result = await response.json().catch(() => ({}));

        console.log("TRACK status:", response.status);
        console.log("TRACK body:", result);

        if (!response.ok) {
          console.error("Tracking failed:", result);
        }
      } catch (error) {
        console.error("Error tracking sector entry:", error);
      }
    };

    run();
  }, [sectorKey, location.pathname]);
}
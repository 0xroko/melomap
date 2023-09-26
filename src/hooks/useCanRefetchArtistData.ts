import { ARTIST_DATA_SET_TIME_KEY } from "@/lib/const";
import { useEffect, useState } from "react";

const REFETCH_AFTER = 1000 * 60 * 60 * 24 * 7; // 7 days

export const useCanRefetchArtistData = () => {
  const [canRefetch, setCanRefetch] = useState(false);

  useEffect(() => {
    const lastSetTime = localStorage.getItem(ARTIST_DATA_SET_TIME_KEY);
    // check if the data is older than 7 days
    if (lastSetTime && Date.now() - Number(lastSetTime) > REFETCH_AFTER) {
      setCanRefetch(true);
    }
  }, []);

  return canRefetch;
};

import { ARTIST_DATA_KEY, ARTIST_DATA_SET_TIME_KEY } from "@/lib/const";
import { map } from "@/lib/map";
import { fetchArtistData } from "@/lib/spotify";
import {
  Artist,
  ArtistData,
  ArtistRelation,
  ExtendedGraphData,
} from "@/lib/types";
import { MotionValue } from "framer-motion";
import { getSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
interface AppSettings {
  showSpotifyArtistView: boolean;
  setShowSpotifyArtistView: (value: boolean) => void;
  showLegend: boolean;
  setShowLegend: (value: boolean) => void;
}

export const useAppSettings = create<AppSettings>()(
  persist(
    (set, get) => ({
      showSpotifyArtistView: true,
      setShowSpotifyArtistView: (value) =>
        set({ showSpotifyArtistView: value }),
      showLegend: true,
      setShowLegend: (value) => set({ showLegend: value }),
    }),
    {
      name: "app-settings", // name of the item in the storage (must be unique)
    },
  ),
);

// useStore.ts
const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};

export default useStore;

export const buildGraph = ({ artists, artistsRelations }: ArtistData) => {
  useAppState.setState({ graphState: "BUILDING" });

  const graph: ExtendedGraphData = {
    links: [],
    nodes: [],
    nodeRelationsMap: new Map(),
  };

  if (!artists || !artistsRelations) {
    console.log("no data");
    return;
  }

  for (let i = 0; i < artists.length; i++) {
    const artist = artists[i];

    const relatedArtistsA = artistsRelations.filter(
      (n) => n.idA === artist.id,
    ).length;

    graph.nodes.push({
      id: artist.id,
      label: artist.name,
      size: relatedArtistsA,
      type: artist.type,
    });
  }

  const maxSize = Math.max(...graph.nodes.map((n) => n.size));

  graph.nodes = graph.nodes.map((node) => ({
    ...node,
    size: map(node.size, 1, maxSize, 1, 2.4, true),
  }));

  for (let relation of artistsRelations) {
    graph.links.push({
      source: relation.idA,
      target: relation.idB,
      type: relation.type,
    });
  }

  graph.links.forEach((link) => {
    const source = link.source as string;
    const target = link.target as string;

    if (!graph.nodeRelationsMap.has(source)) {
      graph.nodeRelationsMap.set(source, []);
    }

    if (!graph.nodeRelationsMap.has(target)) {
      graph.nodeRelationsMap.set(target, []);
    }

    graph.nodeRelationsMap.set(target, [
      ...graph.nodeRelationsMap.get(target)!,
      source,
    ]);

    graph.nodeRelationsMap.set(source, [
      ...graph.nodeRelationsMap.get(source)!,
      target,
    ]);
  });

  // remove related artists with no relations
  graph.nodes = graph.nodes.filter((node) => {
    const relations = graph.nodeRelationsMap.get(node.id as string);
    return relations && relations.length > 0;
  });

  return graph;
};

const getCachedArtistData = () => {
  const data = JSON.parse(localStorage.getItem(ARTIST_DATA_KEY) || "{}") as {
    artists: Artist[];
    artistsRelations: ArtistRelation[];
  };

  if (!data.artists || !data.artistsRelations) {
    return null;
  }

  return data;
};

const setArtistData = async (artistData: ArtistData) => {
  localStorage.setItem(ARTIST_DATA_KEY, JSON.stringify(artistData));
  localStorage.setItem(ARTIST_DATA_SET_TIME_KEY, Date.now().toString());
};

const fetchAndBuild = async () => {
  try {
    const session = await getSession();
    if (!session) return;
    const artistData = await fetchArtistData({ session });
    const graph = buildGraph(artistData);
    setArtistData(artistData);
    return graph;
  } catch (error) {
    console.error(error);
    // TODO: handle error
  }
};

interface AppStateStore {
  graphState:
    | "BUILDING"
    | "FETCHING_RELATED_ARTISTS"
    | "FETCHING_PLAYLISTS"
    | "FETCHING_USER_SAVED_TRACKS"
    | "DONE"
    | "NOT_BUILD"
    | "UNKNOWN";

  fetchProgress: MotionValue<number>;
  init: () => void;
  selectedArtist: string | null;
  setSelectedArtist: (artistId: string | null) => void;
  refetch: () => void;
  initFinished: boolean;
  graph?: ExtendedGraphData;
  logout: () => void;
}

export const useAppState = create<AppStateStore>((set, get) => ({
  graphState: "UNKNOWN",
  setSelectedArtist: (artistId) => {
    set({ selectedArtist: artistId });
  },
  selectedArtist: null,
  // since it's only used for the progress bar, we can use a motion value to avoid re-renders
  fetchProgress: new MotionValue(),
  initFinished: false,
  logout: () => {
    localStorage.removeItem(ARTIST_DATA_KEY);
    localStorage.removeItem(ARTIST_DATA_SET_TIME_KEY);
    set({ graphState: "NOT_BUILD", graph: undefined });
    signOut({ redirect: true, callbackUrl: "/" });
  },
  refetch: async () => {
    localStorage.removeItem(ARTIST_DATA_KEY);
    set({ graphState: "DONE", graph: undefined });
    const graph = await fetchAndBuild();
    set({ graphState: "DONE", graph });
  },
  init: async () => {
    if (get().initFinished) {
      return;
    }
    set({ initFinished: true });

    const cachedArtistData = getCachedArtistData();

    if (cachedArtistData) {
      set({ graphState: "BUILDING" });
      const graph = buildGraph(cachedArtistData);
      set({ graphState: "DONE", graph });
    } else {
      const graph = await fetchAndBuild();
      set({ graphState: "DONE", graph });
    }
  },
}));

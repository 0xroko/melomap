import type * as CSS from "csstype";

export const colors = {
  link: {
    related: "#aec0f5",
    colab: "#eeafbc",
    both: "#e2f5c4",
  },
  node: {
    related: "#aec0f5",
    playlist: "#eeafbc",
    top: "#e2f5c4",
  },
};

export const ARTIST_DATA_KEY = "artist-data";
export const ARTIST_DATA_SET_TIME_KEY = "artist-data-set-time";

export const demoDataPath = "/demo-artist-data.json" as const;

export type Properties = CSS.Properties<string | number>;

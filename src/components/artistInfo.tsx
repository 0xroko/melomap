import { Pannel } from "@/components";
import useStore, { useAppSettings, useAppState } from "@/lib/store";

interface ArtistInfoPannelProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const ArtistInfoPannel = ({ children }: ArtistInfoPannelProps) => {
  const showSpotifyArtistView = useStore(
    useAppSettings,
    (state) => state.showSpotifyArtistView,
  );

  const artistId = useAppState((t) => t.selectedArtist);

  if (!showSpotifyArtistView) return null;

  return (
    <Pannel
      className={`fixed bottom-2 left-2 right-2 flex flex-col gap-3 overflow-y-auto sm:bottom-3 sm:left-auto sm:right-3 sm:overflow-y-hidden`}
    >
      {artistId ? (
        <iframe
          style={{
            border: "12px",
            overflow: "hidden",
          }}
          key={artistId}
          src={`https://open.spotify.com/embed/artist/${artistId}?utm_source=generator&theme=0`}
          className={`h-[152px]  w-full sm:h-[352px] sm:w-[300px]`}
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      ) : (
        <div
          className={`flex h-[40px] w-full items-center justify-center text-sm font-medium text-neutral-400 sm:w-[300px]`}
        >
          Select artist to view info
        </div>
      )}
    </Pannel>
  );
};

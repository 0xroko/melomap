import { useAppSettings } from "@/lib/store";
import { ExtendedGraphData } from "@/lib/types";
import { useSession } from "next-auth/react";

interface StatsProps {
  graphData: ExtendedGraphData;
  demoMode?: boolean;
}

export const Stats = ({ graphData, demoMode = false }: StatsProps) => {
  const showLegend = useAppSettings((state) => state.showLegend);
  const session = useSession();

  const userName = session.data?.user.name;
  return (
    <div>
      <div className="mb-3 font-semibold text-white">
        {userName && !demoMode ? (
          <>{userName}&apos;s stats</>
        ) : (
          <div>
            Stats{""}
            <div className={`text-xs text-neutral-400`}>
              (source: various Spotify playlists)
            </div>
          </div>
        )}
      </div>
      <div className="text-sm font-medium text-neutral-400">
        {graphData?.nodes.length} artists
      </div>
      <div className="text-sm font-medium text-neutral-400">
        {graphData?.links.length} connections
      </div>
    </div>
  );
};

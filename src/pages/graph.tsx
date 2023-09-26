import { useAppState } from "@/lib/store";
import dynamic from "next/dynamic";
import { useEffect } from "react";

import { TopPannel } from "@/components";
import { ArtistInfoPannel } from "@/components/artistInfo";
import { Menu } from "@/components/dropdownMenu";
import { Legend } from "@/components/legend";
import { LoadingScreen } from "@/components/loadingScreen";
import { Stats } from "@/components/stats";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const Graph = dynamic(
  import("../components/graph").then((mod) => mod.ForceGraph2d),
  { ssr: false },
);

export default function Home() {
  useAuthGuard();

  const init = useAppState((state) => state.init);
  const graphState = useAppState((state) => state.graphState);
  const graphData = useAppState((state) => state.graph);

  useEffect(() => {
    init();
  }, []);

  const loaded = graphState === "DONE";

  if (!loaded) return <LoadingScreen />;

  return (
    <div className={`h-[100svh]`}>
      {graphData && <Graph graphData={graphData} />}
      <TopPannel>
        {graphData && <Stats graphData={graphData} />}
        <Legend />
      </TopPannel>
      <ArtistInfoPannel />
      <Menu />
    </div>
  );
}

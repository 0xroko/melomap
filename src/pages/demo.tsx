import { TopPannel } from "@/components";
import { ArtistInfoPannel } from "@/components/artistInfo";
import { Menu } from "@/components/dropdownMenu";
import { Legend } from "@/components/legend";
import { LoadingScreen } from "@/components/loadingScreen";
import { Stats } from "@/components/stats";
import { demoDataPath } from "@/lib/const";
import { buildGraph } from "@/lib/store";
import { ExtendedGraphData } from "@/lib/types";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Graph = dynamic(
  import("../components/graph").then((mod) => mod.ForceGraph2d),
  { ssr: false },
);

const useDemoData = () => {
  const [graphData, setGraphData] = useState<ExtendedGraphData>();

  const isSet = useRef(false);

  useEffect(() => {
    if (!isSet.current) {
      isSet.current = true;
      const t = async () => {
        const artistData = await (await fetch(demoDataPath)).json();
        const build = buildGraph(artistData);
        setGraphData(build);
      };
      t();
    }
  }, []);

  return graphData;
};

const Demo = () => {
  const graphData = useDemoData();

  if (!graphData) return <LoadingScreen />;

  return (
    <div>
      <Graph graphData={graphData} />
      <TopPannel>
        <Stats demoMode graphData={graphData} />
        <Legend />
      </TopPannel>
      <ArtistInfoPannel />
      <Menu />
    </div>
  );
};
export default Demo;

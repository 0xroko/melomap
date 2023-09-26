import { cn } from "@/lib/cn";
import { colors } from "@/lib/const";
import { useAppSettings } from "@/lib/store";
import { useStore } from "zustand";

interface LegendItemProps {
  children?: React.ReactNode | React.ReactNode[];
  type: "node" | "link";
  color?: string;
  text?: string;
}

export const LegendItem = ({ color, text, type }: LegendItemProps) => {
  return (
    <div className={`flex items-center gap-3`}>
      <div
        className={`${type === "node" ? "w-3" : "w-9"} h-3 rounded-full `}
        style={{
          backgroundColor: `${color}aa`,
        }}
      />
      <div className="text-sm font-medium leading-3 text-neutral-400">
        {text}
      </div>
    </div>
  );
};

interface LegendSectionProps {
  children?: React.ReactNode | React.ReactNode[];
  title?: string;
}

export const LegendSection = ({ children, title }: LegendSectionProps) => {
  return (
    <div className={`flex flex-col`}>
      <div className="mb-3 text-sm font-semibold text-white">{title}</div>
      <div className={`flex flex-col gap-2`}>{children}</div>
    </div>
  );
};

interface LegendProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const Legend = ({ children }: LegendProps) => {
  const showLegend = useStore(useAppSettings, (state) => state.showLegend);
  return (
    <div
      className={cn(`flex flex-row gap-6`, {
        hidden: !showLegend,
      })}
    >
      <LegendSection title="Artist">
        <LegendItem type="node" color={colors.node.top} text="top" />
        <LegendItem type="node" color={colors.node.playlist} text="playlist" />
        <LegendItem type="node" color={colors.node.related} text="related" />
      </LegendSection>
      <LegendSection title="Connection">
        <LegendItem type="link" color={colors.link.both} text="both" />
        <LegendItem type="link" color={colors.link.colab} text="colab" />
        <LegendItem type="link" color={colors.link.related} text="related" />
      </LegendSection>
    </div>
  );
};

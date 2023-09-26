import { cn } from "@/lib/cn";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollIndicatorProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const ScrollIndicator = ({ children }: ScrollIndicatorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, {
    margin: "0px 100px -20px 0px",
    once: false,
    amount: "all",
  });

  return (
    <div
      ref={ref}
      className={cn(`pointer-events-none absolute bottom-0 w-full`)}
    >
      <div
        className={cn(`w-full duration-200`, {
          "opacity-0": visible,
          "opacity-100": !visible,
        })}
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, #090909 100%)",
        }}
      >
        <div
          className={cn(
            `animate-bouncee pb-2 text-center text-sm  font-medium text-white duration-500 md:pb-3`,
          )}
        >
          ↓ Scroll ↓
        </div>
      </div>
    </div>
  );
};

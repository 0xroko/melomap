import { cn } from "@/lib/cn";
import { HTMLAttributes, forwardRef } from "react";

interface PannelProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode | React.ReactNode[];
}

export const Pannel = forwardRef(
  ({ children, className, ...props }: PannelProps, ref: any) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          `fixed z-50 flex rounded-lg bg-neutral-900 bg-opacity-60 backdrop-blur-md`,
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

Pannel.displayName = "Pannel";

interface TopPannelProps {
  children?: React.ReactNode | React.ReactNode[];
}

export const TopPannel = ({ children }: TopPannelProps) => {
  return (
    <Pannel
      className={cn(`left-2 top-2 flex flex-col gap-3 pb-5 pl-3 pr-5 pt-3`)}
    >
      {children}
    </Pannel>
  );
};

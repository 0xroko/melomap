import { cn } from "@/lib/cn";
import { useInView } from "framer-motion";
import { HTMLAttributes, useRef } from "react";

// motion div
interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, {
    margin: "99990px 0px 0px 0px",
    once: false,
    amount: 0.8,
  });

  return (
    <div ref={ref} className={cn(`group`)}>
      <div
        {...props}
        style={{
          "--card-amount": "30px",
        }}
        className={cn(
          `relative flex min-h-[340px] basis-[50%] flex-col overflow-hidden rounded-2xl bg-black px-6 py-6 opacity-0 duration-500 ease-in-out sm:min-h-[400px]`,
          className,
          {
            "translate-y-[--card-amount] opacity-0 ": !visible,
            "translate-y-0 opacity-100": visible,
          },
        )}
      >
        {props.children}
      </div>
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardTitle = ({
  children,
  className,
  style,
  ...props
}: CardTitleProps) => {
  return (
    <div
      {...props}
      style={{
        ...style,
        textShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
      }}
      className={cn(
        `relative text-2xl font-semibold leading-loose text-white`,
        className,
      )}
    >
      {children}
    </div>
  );
};

interface CardSubtitleProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardSubtitle = ({
  children,
  className,
  style,
  ...props
}: CardSubtitleProps) => {
  return (
    <div
      {...props}
      style={{
        ...style,
        textShadow: "0px 0px 10px rgba(0, 0, 0, 0.6)",
      }}
      className={cn(`relative text-base text-neutral-400`, className)}
    >
      {children}
    </div>
  );
};

interface CardBackgroundProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const CardBackground = ({
  className,
  ...props
}: CardBackgroundProps) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={cn(
        `text-out absolute inset-0 h-full w-full object-cover grayscale`,
        className,
      )}
      {...props}
    />
  );
};

Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Background = CardBackground;

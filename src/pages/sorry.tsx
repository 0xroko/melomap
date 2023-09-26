import Link from "next/link";

interface SorryProps {}

const Sorry = ({}: SorryProps) => {
  return (
    <div
      className={`mx-auto flex h-full w-full max-w-[1800px] flex-col items-center `}
    >
      <div className={`relative h-[100svh] w-full`}>
        <video
          style={{
            maskRepeat: "no-repeat",
            "--mask-image":
              "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          }}
          className={`mask-image absolute inset-0 left-1/2 top-[-10vh] h-screen -translate-x-1/2 object-cover mix-blend-color-dodge sm:w-[100%]`}
          autoPlay
          muted
          loop
          src="assets/section1.mp4"
        />

        <div
          className={`relative mt-[67vh] flex flex-col items-center justify-center gap-4`}
        >
          <div
            style={{
              background:
                "linear-gradient(to right bottom,#fff 30%,hsla(0,0%,100%,.5))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            className="mb-2 max-w-lg text-center text-4xl font-bold tracking-tight  sm:text-5xl"
          >
            Sorry, we are still awaiting Spotify API approval
          </div>
          <div
            style={{
              background:
                "linear-gradient(60deg,#626262 30%, hsla(0, 0%, 38.4%, 0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            className="text-center text-xl font-medium sm:text-xl"
          >
            You can still check out{" "}
            <Link href={"/demo"} className={`text-neutral-600 underline`}>
              the demo page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Sorry;

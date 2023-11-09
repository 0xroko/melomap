import { Card } from "@/components/homeCard";
import { ScrollIndicator } from "@/components/scrollIndicator";
import { signIn } from "next-auth/react";
import Link from "next/link";

interface HomePageProps {}

const HomePage = ({}: HomePageProps) => {
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
          className={`relative mt-[67vh] flex flex-col items-center justify-center`}
        >
          <div
            style={{
              background:
                "linear-gradient(to right bottom,#fff 30%,hsla(0,0%,100%,.5))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            className="mb-2 text-6xl font-bold  tracking-tight  sm:text-8xl"
          >
            melomap
          </div>
          <div
            style={{
              background:
                "linear-gradient(60deg,#626262 30%, hsla(0, 0%, 38.4%, 0.5) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            className="text-center text-xl font-medium sm:text-3xl"
          >
            placing your music taste on the map
          </div>
          <div className="mt-10 inline-flex items-start justify-start gap-3.5">
            <button
              onClick={() => {
                signIn("spotify", {
                  callbackUrl: "/graph",
                });
              }}
              className="flex items-center justify-center rounded-xl border border-green-600 bg-neutral-950 bg-opacity-60 px-4  py-2 text-white"
            >
              <div className="text-sm font-semibold text-green-600">
                Continue with Spoitfy
              </div>
            </button>
            <Link
              href={"/demo"}
              className="flex items-center justify-center rounded-xl bg-white px-4 py-2 text-neutral-900 backdrop-blur-md duration-300 hover:opacity-60"
            >
              <div className="text-center text-sm font-semibold">View demo</div>
            </Link>
          </div>
        </div>
        <ScrollIndicator />
      </div>

      <div className={`mt-24 w-full max-w-3xl px-10 md:px-6`}>
        <div className={` flex flex-col gap-8 sm:flex-row`}>
          <Card className={`border border-neutral-900 bg-neutral-900`}>
            <Card.Background
              className={`mask-image opacity-40 mix-blend-hard-light`}
              style={{
                "--mask-image":
                  "linear-gradient(0deg, rgba(0,0,0,0.9) 70%, rgba(0,0,0,0.0) 100%)",
              }}
              src="assets/card2.gif"
            />
            <Card.Title>Explore</Card.Title>
            <Card.Subtitle>
              Explore a web of musical connections as we chart the artists you
              love and their related counterparts, unlocking new horizons in the
              world of music.
            </Card.Subtitle>
          </Card>
          <Card className={`border border-neutral-900 bg-neutral-800`}>
            <Card.Background
              className={`mask-image`}
              style={{
                "--mask-image":
                  "linear-gradient(0deg, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.0) 100%)",
              }}
              src="assets/card1.gif"
            />

            <Card.Title>Discover</Card.Title>
            <Card.Subtitle>
              Discover hidden gems and delve deeper into the music you adore
              through artist profiles and exclusive insights that elevate your
              music journey to new heights.
            </Card.Subtitle>
          </Card>
        </div>
        <Card
          className={`mt-8 min-h-[180px] border border-neutral-900 bg-neutral-950 sm:min-h-[180px]`}
        >
          <Card.Background
            src="assets/card3.gif"
            className={`left-auto right-0 w-[40%] scale-150 mix-blend-hard-light`}
          />
          <Card.Title>Privacy</Card.Title>
          <Card.Subtitle className={`max-w-[80%] md:max-w-[70%]`}>
            While you explore and discover music with us, know that we
            don&apos;t store any of your data, keeping your privacy intact.
          </Card.Subtitle>
        </Card>
      </div>

      <div className={`w-full max-w-lg `}>
        <div
          className={`px-10 pb-10 pt-16 text-center text-[12px] leading-snug tracking-[-0.01em] text-neutral-600 md:px-6`}
        >
          All images/gifs/videos used are for demo purposes only and belong to
          their respective owners. <br /> This is a non-commercial project.
        </div>
      </div>
    </div>
  );
};
export default HomePage;

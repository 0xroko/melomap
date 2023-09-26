import { useAppState } from "@/lib/store";
import {
  MotionValue,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";

interface LoadingScreenProps {
  children?: React.ReactNode | React.ReactNode[];
}

const loadingPhrases = [
  "Hang tight",
  "Sit tight",
  "This will take a second",
  "Almost there",
  "Loading",
];

interface LoadingBarProps {
  value: MotionValue<number>;
  speed?: number;
  visible?: boolean;
}

export const LoadingBar = ({
  speed = 0.05,
  visible,
  value,
}: LoadingBarProps) => {
  const x = useMotionValue("-100%");

  useMotionValueEvent(value, "change", (p) => {
    const percentage = `-${(1 - p) * 100}%`;
    if (p === 0) {
      console.log("resetting");

      x.set(percentage, true);
      return;
    }
    animate(x, percentage, {
      duration: speed,
    });
  });

  return (
    <div
      className={`h-2 w-full max-w-sm overflow-hidden rounded-md ${
        visible ? "visible" : "invisible"
      }`}
    >
      <motion.div
        className={`h-full bg-white`}
        style={{
          x: x,
        }}
      ></motion.div>
    </div>
  );
};

export const LoadingScreen = ({ children }: LoadingScreenProps) => {
  const state = useAppState((state) => state.graphState);
  const progress = useAppState((state) => state.fetchProgress);

  const showBar =
    state === "FETCHING_RELATED_ARTISTS" ||
    state === "FETCHING_USER_SAVED_TRACKS" ||
    state === "FETCHING_PLAYLISTS";

  let message = "";
  switch (state) {
    case "FETCHING_RELATED_ARTISTS":
      message = "Fetching related artists";
      break;
    case "FETCHING_PLAYLISTS":
      message = "Fetching playlists";
      break;
    case "FETCHING_USER_SAVED_TRACKS":
      message = "Fetching saved tracks";
      break;
    case "BUILDING":
      message =
        loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
      break;
    case "DONE":
      message = "Done!";
      break;
  }

  return (
    <div
      className={`relative flex h-screen w-screen flex-col items-center justify-center`}
    >
      <div className={`mb-2 text-sm font-medium text-white`}>{message}</div>
      <LoadingBar
        visible={showBar}
        value={progress}
        speed={state === "FETCHING_RELATED_ARTISTS" ? 0.02 : 0.05}
      />

      <div
        className={`fixed bottom-2 mt-2 text-center text-sm font-medium text-neutral-400`}
      >
        {showBar && "Don't close this tab"}
        <br />
        For best viewing experience, please use a desktop browser
      </div>
    </div>
  );
};

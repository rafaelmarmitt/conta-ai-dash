import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { PersistentBackground } from "./components/PersistentBackground";
import { SceneHook } from "./scenes/SceneHook";
import { SceneWhatsApp } from "./scenes/SceneWhatsApp";
import { SceneTransform } from "./scenes/SceneTransform";
import { SceneDashboard } from "./scenes/SceneDashboard";
import { SceneClosing } from "./scenes/SceneClosing";

loadFont("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#eef9f8", overflow: "hidden" }}>
      <PersistentBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={95}>
          <SceneHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <SceneWhatsApp />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 25 })}
        />
        <TransitionSeries.Sequence durationInFrames={100}>
          <SceneTransform />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 22 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <SceneDashboard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />
        <TransitionSeries.Sequence durationInFrames={120}>
          <SceneClosing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

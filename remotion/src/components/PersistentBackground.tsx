import { AbsoluteFill, useCurrentFrame } from "remotion";

// Soft animated gradient blobs in the brand mint/teal palette
export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const x1 = Math.sin(t * 0.4) * 80;
  const y1 = Math.cos(t * 0.3) * 60;
  const x2 = Math.cos(t * 0.35) * 100;
  const y2 = Math.sin(t * 0.45) * 70;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 20% 30%, #d5f5ef 0%, transparent 55%), radial-gradient(circle at 80% 70%, #e6f7d1 0%, transparent 55%), linear-gradient(180deg, #f3fbf9 0%, #e8f6ee 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          left: -150 + x1,
          top: -150 + y1,
          background: "radial-gradient(circle, rgba(20,184,166,0.18), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          right: -200 + x2,
          bottom: -200 + y2,
          background: "radial-gradient(circle, rgba(132,204,22,0.18), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      {/* subtle grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,31,29,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,31,29,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

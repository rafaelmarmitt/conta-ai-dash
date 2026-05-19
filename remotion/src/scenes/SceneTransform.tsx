import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const FONT = "Plus Jakarta Sans, sans-serif";

const Particle: React.FC<{ delay: number; from: { x: number; y: number }; to: { x: number; y: number }; color: string; size: number }> = ({
  delay, from, to, color, size,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 80 } });
  const x = interpolate(p, [0, 1], [from.x, to.x]);
  const y = interpolate(p, [0, 1], [from.y, to.y]);
  const op = interpolate(p, [0, 0.2, 0.85, 1], [0, 1, 1, 0]);
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: size, height: size,
      borderRadius: "50%", background: color, opacity: op,
      boxShadow: `0 0 ${size * 1.5}px ${color}`,
    }} />
  );
};

export const SceneTransform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headline = spring({ frame: frame - 5, fps, config: { damping: 20 } });
  const sub = spring({ frame: frame - 25, fps, config: { damping: 20 } });

  // Generate flowing particles
  const particles = [];
  const colors = ["#25d366", "#14b8a6", "#84cc16", "#22c55e"];
  for (let i = 0; i < 24; i++) {
    particles.push({
      delay: i * 2,
      from: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 700 },
      to: { x: 1300 + Math.random() * 400, y: 200 + Math.random() * 700 },
      color: colors[i % colors.length],
      size: 8 + Math.random() * 16,
    });
  }

  return (
    <AbsoluteFill style={{ fontFamily: FONT, justifyContent: "center", alignItems: "center" }}>
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <div style={{ textAlign: "center", maxWidth: 1500 }}>
        <div style={{
          opacity: spring({ frame, fps, config: { damping: 22 } }),
          fontSize: 26, fontWeight: 700, letterSpacing: "0.3em", color: "#0d7a6f",
          textTransform: "uppercase", marginBottom: 24,
        }}>
          2 · A mágica acontece
        </div>
        <div style={{
          opacity: headline,
          transform: `translateY(${interpolate(headline, [0, 1], [30, 0])}px)`,
          fontSize: 120, fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.04em", color: "#0f1f1d",
        }}>
          Mensagens viram <span style={{
            background: "linear-gradient(135deg, #14b8a6, #84cc16)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>dados</span>.
        </div>
        <div style={{
          opacity: sub,
          transform: `translateY(${interpolate(sub, [0, 1], [20, 0])}px)`,
          fontSize: 34, fontWeight: 500, color: "#3d524f", marginTop: 24,
        }}>
          Categorizamos, somamos e organizamos automaticamente.
        </div>
      </div>
    </AbsoluteFill>
  );
};

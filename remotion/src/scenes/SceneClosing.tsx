import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const FONT = "Plus Jakarta Sans, sans-serif";

export const SceneClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoS = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const lineS = spring({ frame: frame - 18, fps, config: { damping: 20 } });
  const tagS = spring({ frame: frame - 40, fps, config: { damping: 22 } });
  const ctaS = spring({ frame: frame - 60, fps, config: { damping: 18, stiffness: 120 } });
  const pulse = 1 + Math.sin(frame / 12) * 0.02;

  return (
    <AbsoluteFill style={{ fontFamily: FONT, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      {/* Glow */}
      <div style={{
        position: "absolute", width: 900, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(20,184,166,0.25), transparent 60%)",
        opacity: logoS, transform: `scale(${pulse})`,
      }} />

      <div style={{
        opacity: logoS,
        transform: `scale(${interpolate(logoS, [0, 1], [0.6, 1])})`,
        display: "flex", alignItems: "center", gap: 24,
      }}>
        <div style={{
          width: 140, height: 140, borderRadius: 38,
          background: "linear-gradient(135deg, #14b8a6, #84cc16)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 30px 60px rgba(20,184,166,0.45)",
        }}>
          <svg width="78" height="78" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <div style={{ fontSize: 160, fontWeight: 800, letterSpacing: "-0.05em", color: "#0f1f1d", lineHeight: 1 }}>
          Conta<span style={{
            background: "linear-gradient(135deg, #14b8a6, #84cc16)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>.AI</span>
        </div>
      </div>

      <div style={{
        opacity: lineS, transform: `scaleX(${lineS})`, transformOrigin: "center",
        width: 280, height: 4, background: "linear-gradient(90deg, #14b8a6, #84cc16)",
        borderRadius: 2, marginTop: 36,
      }} />

      <div style={{
        opacity: tagS,
        transform: `translateY(${interpolate(tagS, [0, 1], [20, 0])}px)`,
        fontSize: 56, fontWeight: 700, color: "#0f1f1d",
        marginTop: 36, letterSpacing: "-0.02em",
      }}>
        Sua contabilidade resolvida no chat.
      </div>

      <div style={{
        opacity: ctaS,
        transform: `translateY(${interpolate(ctaS, [0, 1], [16, 0])}px)`,
        marginTop: 56, padding: "26px 56px", borderRadius: 999,
        background: "linear-gradient(135deg, #14b8a6, #84cc16)",
        color: "white", fontSize: 36, fontWeight: 800, letterSpacing: "-0.01em",
        boxShadow: "0 20px 50px rgba(20,184,166,0.4)",
      }}>
        Comece grátis hoje →
      </div>
    </AbsoluteFill>
  );
};

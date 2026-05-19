import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const FONT = "Plus Jakarta Sans, sans-serif";

const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    width: 540, height: 1080, borderRadius: 78, background: "#0f1f1d",
    padding: 16, boxShadow: "0 60px 120px rgba(13,122,111,0.35), 0 0 0 2px rgba(255,255,255,0.5) inset",
    position: "relative", ...style,
  }}>
    <div style={{
      width: "100%", height: "100%", borderRadius: 64, background: "#ece5dd",
      overflow: "hidden", position: "relative",
    }}>
      {/* notch */}
      <div style={{
        position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
        width: 140, height: 30, background: "#0f1f1d", borderRadius: 20, zIndex: 10,
      }} />
      {children}
    </div>
  </div>
);

const ChatMsg: React.FC<{
  delay: number; text: string; me?: boolean; top: number;
}> = ({ delay, text, me = false, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 140 } });
  return (
    <div style={{
      position: "absolute", top, [me ? "right" : "left"]: 18,
      maxWidth: 360, padding: "14px 18px",
      background: me ? "#dcf8c6" : "#ffffff",
      borderRadius: 16,
      borderTopRightRadius: me ? 4 : 16, borderTopLeftRadius: me ? 16 : 4,
      fontFamily: FONT, fontSize: 22, fontWeight: 500, color: "#0f1f1d",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      opacity: s, transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`,
      transformOrigin: me ? "top right" : "top left",
    } as React.CSSProperties}>
      {text}
      <div style={{ fontSize: 14, color: "#8a9a96", textAlign: "right", marginTop: 4 }}>
        {me ? "✓✓ 09:42" : "09:42"}
      </div>
    </div>
  );
};

export const SceneWhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneIn = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const float = Math.sin(frame / 30) * 8;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Side label */}
      <div style={{
        position: "absolute", left: 140, top: 380, maxWidth: 520, fontFamily: FONT,
        opacity: spring({ frame: frame - 20, fps, config: { damping: 20 } }),
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#0d7a6f", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
          1 · Você manda no chat
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#0f1f1d" }}>
          Apenas digite a venda. A IA cuida do resto.
        </div>
      </div>

      <div style={{
        transform: `scale(${interpolate(phoneIn, [0, 1], [0.7, 0.78])}) translateY(${float}px) rotate(${interpolate(phoneIn, [0, 1], [10, 4])}deg)`,
        opacity: phoneIn,
        marginLeft: 540,
      }}>
        <Phone>
          {/* WhatsApp header */}
          <div style={{
            background: "#075e54", color: "white", padding: "60px 18px 14px",
            display: "flex", alignItems: "center", gap: 12, fontFamily: FONT,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "white" }}>AI</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Conta.AI</div>
              <div style={{ fontSize: 16, opacity: 0.8 }}>online</div>
            </div>
          </div>
          <div style={{ position: "relative", height: 880, padding: 0 }}>
            <ChatMsg delay={15} top={20}  me text="Vendi 3 bolos hoje, R$ 180" />
            <ChatMsg delay={40} top={120} text="✓ Venda registrada — R$ 180,00" />
            <ChatMsg delay={62} top={240} text="Total do mês: R$ 4.820,00" />
            <ChatMsg delay={82} top={360} me text="Quanto de imposto?" />
            <ChatMsg delay={105} top={460} text="DAS de Outubro: R$ 75,90 — vence em 5 dias. Quer o PIX?" />
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

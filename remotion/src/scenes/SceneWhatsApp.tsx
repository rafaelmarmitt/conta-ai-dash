import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const FONT = "Plus Jakarta Sans, sans-serif";

const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    width: 640, height: 1240, borderRadius: 88, background: "#0f1f1d",
    padding: 20, boxShadow: "0 60px 120px rgba(13,122,111,0.35), 0 0 0 2px rgba(255,255,255,0.5) inset",
    position: "relative", ...style,
  }}>
    <div style={{
      width: "100%", height: "100%", borderRadius: 72, background: "#ece5dd",
      overflow: "hidden", position: "relative",
    }}>
      {/* notch */}
      <div style={{
        position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
        width: 160, height: 34, background: "#0f1f1d", borderRadius: 22, zIndex: 10,
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
      position: "absolute", top, [me ? "right" : "left"]: 20,
      maxWidth: 460, padding: "16px 20px",
      background: me ? "#dcf8c6" : "#ffffff",
      borderRadius: 18,
      borderTopRightRadius: me ? 4 : 18, borderTopLeftRadius: me ? 18 : 4,
      fontFamily: FONT, fontSize: 26, fontWeight: 500, color: "#0f1f1d",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      opacity: s, transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`,
      transformOrigin: me ? "top right" : "top left",
    } as React.CSSProperties}>
      {text}
      <div style={{ fontSize: 16, color: "#8a9a96", textAlign: "right", marginTop: 4 }}>
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
        position: "absolute", left: 80, top: 340, maxWidth: 520, fontFamily: FONT,
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
        transform: `scale(${interpolate(phoneIn, [0, 1], [0.75, 0.88])}) translateY(${float}px) rotate(${interpolate(phoneIn, [0, 1], [10, 4])}deg)`,
        opacity: phoneIn,
        marginLeft: 480,
      }}>
        <Phone>
          {/* WhatsApp header */}
          <div style={{
            background: "#075e54", color: "white", padding: "64px 20px 16px",
            display: "flex", alignItems: "center", gap: 14, fontFamily: FONT,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "white" }}>AI</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>Conta.AI</div>
              <div style={{ fontSize: 17, opacity: 0.8 }}>online</div>
            </div>
          </div>
          <div style={{ position: "relative", height: 1040, padding: 0 }}>
            <ChatMsg delay={15} top={24}  me text="Vendi 3 bolos hoje, R$ 180" />
            <ChatMsg delay={40} top={140} text="✓ Venda registrada — R$ 180,00" />
            <ChatMsg delay={62} top={280} text="Total do mês: R$ 4.820,00" />
            <ChatMsg delay={82} top={420} me text="Quanto de imposto?" />
            <ChatMsg delay={105} top={560} text="DAS de Outubro: R$ 75,90 — vence em 5 dias. Quer o PIX?" />
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  );
};

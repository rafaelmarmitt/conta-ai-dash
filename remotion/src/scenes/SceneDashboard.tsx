import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const FONT = "Plus Jakarta Sans, sans-serif";

const Counter: React.FC<{ delay: number; from: number; to: number; prefix?: string; suffix?: string; decimals?: number }> = ({
  delay, from, to, prefix = "", suffix = "", decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 30, stiffness: 60 } });
  const v = interpolate(p, [0, 1], [from, to]);
  const formatted = v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <>{prefix}{formatted}{suffix}</>;
};

const KpiCard: React.FC<{
  delay: number; label: string; value: React.ReactNode; delta: string; tint: string; x: number; y: number; w: number;
}> = ({ delay, label, value, delta, tint, x, y, w }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 120 } });
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w,
      background: "white", borderRadius: 32, padding: "32px 36px",
      boxShadow: "0 30px 60px rgba(15,31,29,0.12)",
      opacity: s, transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
      fontFamily: FONT, border: `2px solid ${tint}40`,
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: "#3d524f", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 72, fontWeight: 800, color: "#0f1f1d", lineHeight: 1.1, letterSpacing: "-0.03em", marginTop: 8 }}>{value}</div>
      <div style={{ display: "inline-block", marginTop: 12, padding: "6px 14px", background: `${tint}25`, color: tint, borderRadius: 999, fontSize: 20, fontWeight: 700 }}>
        {delta}
      </div>
    </div>
  );
};

const Chart: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 70 } });
  const draw = interpolate(frame - delay, [0, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Data points
  const pts1 = [40, 55, 48, 70, 65, 82, 78, 95];
  const pts2 = [30, 38, 45, 42, 55, 60, 68, 75];
  const w = 760, h = 260, pad = 20;
  const mkPath = (pts: number[]) => {
    const dx = (w - pad * 2) / (pts.length - 1);
    return pts.map((v, i) => `${i === 0 ? "M" : "L"} ${pad + i * dx} ${h - pad - (v / 100) * (h - pad * 2)}`).join(" ");
  };
  const path1 = mkPath(pts1);
  const path2 = mkPath(pts2);
  const len = 1200;

  return (
    <div style={{
      position: "absolute", left: 140, top: 360, width: 820, height: 360,
      background: "white", borderRadius: 32, padding: 30, fontFamily: FONT,
      boxShadow: "0 30px 60px rgba(15,31,29,0.12)",
      opacity: s, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#0f1f1d" }}>Receita por mês</div>
        <div style={{ display: "flex", gap: 16, fontSize: 18, color: "#3d524f", fontWeight: 600 }}>
          <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#14b8a6", borderRadius: 3, marginRight: 6 }} />2025</span>
          <span><span style={{ display: "inline-block", width: 12, height: 12, background: "#84cc16", borderRadius: 3, marginRight: 6 }} />2024</span>
        </div>
      </div>
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={pad} x2={w - pad} y1={pad + i * ((h - pad * 2) / 3)} y2={pad + i * ((h - pad * 2) / 3)} stroke="#e5efed" strokeWidth={1} />
        ))}
        <path d={path2} fill="none" stroke="#84cc16" strokeWidth={4} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} strokeLinecap="round" />
        <path d={path1} fill="none" stroke="#14b8a6" strokeWidth={5} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} strokeLinecap="round" />
        {pts1.map((v, i) => {
          const dx = (w - pad * 2) / (pts1.length - 1);
          const cx = pad + i * dx;
          const cy = h - pad - (v / 100) * (h - pad * 2);
          const dotOp = interpolate(frame - delay - 25 - i * 3, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return <circle key={i} cx={cx} cy={cy} r={7} fill="white" stroke="#14b8a6" strokeWidth={3} opacity={dotOp} />;
        })}
      </svg>
    </div>
  );
};

export const SceneDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const header = spring({ frame, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <div style={{
        position: "absolute", top: 90, left: 140, opacity: header,
        transform: `translateY(${interpolate(header, [0, 1], [20, 0])}px)`,
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#0d7a6f", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>
          3 · Dashboard em tempo real
        </div>
        <div style={{ fontSize: 80, fontWeight: 800, letterSpacing: "-0.03em", color: "#0f1f1d", lineHeight: 1.0 }}>
          Tudo organizado.<br />
          <span style={{ background: "linear-gradient(135deg, #14b8a6, #84cc16)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Pronto pro Imposto de Renda.
          </span>
        </div>
      </div>

      <Chart delay={20} />

      <KpiCard delay={35} label="Receita" tint="#14b8a6" x={1000} y={360} w={380}
        value={<><span style={{ fontSize: 42 }}>R$ </span><Counter delay={35} from={0} to={4820} /></>}
        delta="↑ 18% vs mês anterior" />
      <KpiCard delay={50} label="Vendas" tint="#84cc16" x={1410} y={360} w={370}
        value={<Counter delay={50} from={0} to={142} />}
        delta="↑ 24% este mês" />
      <KpiCard delay={65} label="Próximo DAS" tint="#f59e0b" x={1000} y={620} w={380}
        value={<><span style={{ fontSize: 42 }}>R$ </span><Counter delay={65} from={0} to={75.9} decimals={2} /></>}
        delta="Vence em 5 dias" />
      <KpiCard delay={80} label="Clientes ativos" tint="#0ea5e9" x={1410} y={620} w={370}
        value={<Counter delay={80} from={0} to={38} />}
        delta="+6 novos" />
    </AbsoluteFill>
  );
};

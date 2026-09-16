import { ImageResponse } from "next/og";
import { decodeShareData } from "@/lib/shareCard";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
  bg: "#0a1420",
  bgElevated: "#101f30",
  border: "rgba(255,255,255,0.08)",
  text: "#eef3f8",
  textSoft: "#93a8bd",
  accent: "#ccff33",
  atp: "#4da3ff",
  wta: "#ff6fae",
};

export default async function Image({ params }: { params: Promise<{ data: string }> }) {
  const { data: encoded } = await params;
  const data = decodeShareData(encoded);

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: COLORS.bg,
            color: COLORS.text,
            fontSize: 48,
          }}
        >
          🎾 MatchPoint
        </div>
      ),
      size
    );
  }

  const tourColor = data.t === "atp" ? COLORS.atp : COLORS.wta;
  const maxSets = Math.max(data.s1.length, data.s2.length);

  const scoreRow = (name: string, country: string | null, sets: number[], winner: boolean) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "18px 0",
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span
          style={{
            fontSize: 40,
            fontWeight: winner ? 700 : 400,
            color: winner ? COLORS.text : COLORS.textSoft,
          }}
        >
          {name}
        </span>
        {country ? <span style={{ fontSize: 22, color: COLORS.textSoft }}>({country})</span> : null}
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        {Array.from({ length: maxSets }, (_, i) => (
          <span
            key={i}
            style={{
              fontSize: 40,
              width: 44,
              textAlign: "center",
              fontWeight: winner ? 700 : 400,
              color: winner ? COLORS.accent : COLORS.textSoft,
            }}
          >
            {sets[i] ?? 0}
          </span>
        ))}
      </div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.bgElevated} 100%)`,
          color: COLORS.text,
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              color: COLORS.accent,
              textTransform: "uppercase",
            }}
          >
            🎾 MatchPoint
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 20,
            padding: "36px 44px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: COLORS.bg,
                background: tourColor,
                borderRadius: 999,
                padding: "6px 16px",
              }}
            >
              {data.t.toUpperCase()}
            </span>
            <span style={{ fontSize: 22, color: COLORS.textSoft }}>{data.r}</span>
          </div>

          <span style={{ fontSize: 30, fontWeight: 700, marginBottom: 24 }}>{data.tn}</span>

          {scoreRow(data.p1, data.c1, data.s1, data.w === 1)}
          {scoreRow(data.p2, data.c2, data.s2, data.w === 2)}
        </div>

        <span style={{ fontSize: 20, color: COLORS.textSoft }}>Live ATP & WTA scores at MatchPoint</span>
      </div>
    ),
    size
  );
}

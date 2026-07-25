import { ImageResponse } from "next/og";

export const alt = "Nishaj M — Full Stack Developer and Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", color: "#000000", padding: "72px" }}>
      <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: "0.08em" }}>NISHAJ M / PORTFOLIO</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 800, letterSpacing: "-0.05em" }}>Full Stack Developer</div>
        <div style={{ display: "flex", fontSize: 38, color: "#3f3f46" }}>Web applications, automation, and interactive experiences.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 600 }}>
        <span>nishaj.me</span>
        <span>nishaj0</span>
      </div>
    </div>,
    size,
  );
}

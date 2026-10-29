import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "#F7F2F1",
          color: "#1A1214",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 64,
            height: 72,
            borderRadius: "12px 12px 20px 20px",
            background: "#9B2D3A",
            marginBottom: 28,
          }}
        />
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>RedCup</div>
        <div style={{ fontSize: 28, marginTop: 12, color: "#6B5A5C", maxWidth: 720 }}>
          Fund a reel bounty. Pay for verified Instagram views.
        </div>
      </div>
    ),
    { ...size },
  );
}

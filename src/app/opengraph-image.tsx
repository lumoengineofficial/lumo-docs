import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE.name;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a0e17",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(79,94,245,0.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(139,94,245,0.28), transparent 45%)",
          color: "#e6eaf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg,#4f5ef5,#8b5ef5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            L
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#fff" }}>Lumo Asset Store</div>
            <div style={{ fontSize: 18, color: "#8b93ad" }}>for Lumo Engine</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, color: "#fff", lineHeight: 1.05 }}>
            Assets for Lumo Engine
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#8b93ad", maxWidth: 820 }}>
            3D models, textures, sprites, audio, plugins and templates — drop them into your
            project&apos;s Assets/ folder and import in the editor.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              display: "flex",
              background: "#4f5ef5",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: 10,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Download Engine
          </div>
          <div
            style={{
              display: "flex",
              border: "1px solid #1f2740",
              background: "#111726",
              color: "#e6eaf5",
              padding: "14px 28px",
              borderRadius: 10,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Browse the store
          </div>
        </div>
      </div>
    ),
    size,
  );
}

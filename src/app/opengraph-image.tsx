import { ImageResponse } from "next/og";

export const alt = "Elimina tu DICOM. Borrón y cuenta nueva.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagenOg() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", padding: 72, color: "#0b1f3a", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 34, fontWeight: 700 }}>Elimínate</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 124, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>ELIMINA TU DICOM</div>
          <div style={{ fontSize: 40, marginTop: 28, color: "#5b6779" }}>Borrón y cuenta nueva, con gestión legal.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", background: "#07875f", color: "#fff", borderRadius: 14, padding: "12px 24px", fontSize: 28, fontWeight: 700 }}>HISTORIAL LIMPIO</div>
        </div>
      </div>
    ),
    size,
  );
}

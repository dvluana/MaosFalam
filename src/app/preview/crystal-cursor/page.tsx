import CrystalCursor from "@/components/landing/CrystalCursor";

export default function CrystalCursorPreviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "rgba(201,162,74,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        letterSpacing: "2px",
        textTransform: "uppercase",
        fontSize: "12px",
      }}
    >
      <CrystalCursor />
      <p>Mova o mouse para ver o cursor de cristal</p>
    </main>
  );
}

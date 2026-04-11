import SceneVignette from "@/components/landing/SceneVignette";
import Smoke from "@/components/landing/Smoke";

/**
 * Preview isolado dos componentes atmosféricos: SceneVignette + Smoke.
 * Server Component. Fundo preto, texto central instruindo observar o fundo.
 */
export default function AtmospherePreviewPage() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#000",
        color: "#bfb38a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <SceneVignette />
      <Smoke />
      <div style={{ position: "relative", zIndex: 20, maxWidth: "32rem" }}>
        <h1 style={{ fontSize: "1.5rem", letterSpacing: "0.2em", marginBottom: "1rem" }}>
          ATMOSFERA
        </h1>
        <p style={{ opacity: 0.7, lineHeight: 1.6 }}>
          Observe o fundo: vinheta radial nas bordas e wisps de fumaça derivando lentamente pela
          cena.
        </p>
      </div>
    </main>
  );
}

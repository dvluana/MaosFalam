import Nav from "@/components/landing/Nav";

export default function NavPreviewPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#0a0908",
        color: "var(--color-bone, #e8e3d5)",
      }}
    >
      <Nav activeId="home" />

      <div
        style={{
          maxWidth: 430,
          margin: "0 auto",
          padding: "120px 20px 80px",
          fontFamily: "var(--font-cinzel)",
        }}
      >
        <h1 style={{ color: "var(--color-gold)", marginBottom: 16 }}>Nav Preview</h1>
        <p style={{ opacity: 0.75, lineHeight: 1.6 }}>
          Corpo fake pra mostrar o posicionamento fixo do Nav. Role a página e o nav deve permanecer
          colado no topo, com gradiente esmaecendo pra baixo.
        </p>
        {Array.from({ length: 20 }).map((_, i) => (
          <p key={i} style={{ opacity: 0.4, lineHeight: 1.6, marginTop: 24 }}>
            Linha {i + 1} — lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </main>
  );
}

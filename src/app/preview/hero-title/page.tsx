import HeroTitle from "@/components/landing/HeroTitle";

export default function HeroTitlePreviewPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "80px",
        padding: "40px 20px",
      }}
    >
      <section style={{ width: "min(640px, 100%)" }}>
        <HeroTitle />
      </section>

      <section style={{ width: "min(640px, 100%)" }}>
        <HeroTitle
          title="Eu li a sua mão antes de você chegar."
          titleLine2="Agora só falta você ouvir."
          subtitle="Uma foto. Um sussurro. A verdade que ninguém teve coragem de te dizer."
          startDelay={600}
          typeSpeed={48}
          subtitleDelay={120}
        />
      </section>
    </main>
  );
}

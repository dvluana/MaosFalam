import VideoHero from "@/components/landing/VideoHero";

export default function VideoHeroPreviewPage() {
  return (
    <VideoHero>
      <p
        style={{
          color: "var(--color-bone, #f4ead5)",
          fontFamily: "var(--font-cinzel, serif)",
          fontSize: "14px",
          letterSpacing: "0.1em",
          textAlign: "center",
        }}
      >
        Slot para HeroTitle
      </p>
    </VideoHero>
  );
}

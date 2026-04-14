"use client";

// useEffect, useState removed — were only used for navVisible delay (Curtains reveal)

import Constellation from "./Constellation";
// import CrystalCursor from "./CrystalCursor";
// import Curtains from "./Curtains";
// import EdisonLamp from "./EdisonLamp";
import Grain from "./Grain";
import HeroCTA from "./HeroCTA";
import HeroTitle from "./HeroTitle";
import Nav from "./Nav";
import SceneVignette from "./SceneVignette";
import VideoHero from "./VideoHero";

/**
 * HomeLanding — maestro que monta toda a landing.
 *
 * Efeitos desativados (descomentar pra reativar):
 * - Curtains: cortinas de veludo preloader
 * - EdisonLamp: lâmpada Edison + stage-dark + cone de luz
 * - CrystalCursor: cursor de cristal customizado
 */

export default function HomeLanding() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "#000" }}>
      {/* Camada 1: ruído cinematográfico (z baixo) */}
      <Grain />

      {/* Camada 2: constelação de fundo */}
      <Constellation />

      {/* Camada 4: vinheta moldando a cena */}
      <SceneVignette />

      {/* Camada 5: vídeo + mandala (centralizado) */}
      <VideoHero />

      {/* Camada 5b: texto + CTA fixos na base */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center pointer-events-none"
        style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="pointer-events-auto">
          <HeroTitle />
        </div>
      </div>
      <HeroCTA />

      {/* Camada 6: lâmpada Edison + stage-dark + cone de luz (desativado) */}
      {/* <EdisonLamp /> */}

      {/* Camada 7: cursor de cristal (desativado) */}
      {/* <CrystalCursor /> */}

      {/* Camada 8: nav */}
      <Nav activeId="home" visible />

      {/* Camada 9: cortinas de veludo — preloader (desativado) */}
      {/* <Curtains /> */}
    </main>
  );
}

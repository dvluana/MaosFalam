"use client";

import { useEffect, useState } from "react";

import Constellation from "./Constellation";
import CrystalCursor from "./CrystalCursor";
import Curtains from "./Curtains";
import EdisonLamp from "./EdisonLamp";
import Grain from "./Grain";
import HeroCTA from "./HeroCTA";
import HeroTitle from "./HeroTitle";
import Nav from "./Nav";
import SceneVignette from "./SceneVignette";
import VideoHero from "./VideoHero";

/**
 * HomeLanding — maestro que monta toda a landing na ordem certa.
 *
 * Coreografia (espelha o reveal original do home.html):
 *   t=0      → Curtains, Grain, Constellation, Smoke, EdisonLamp, CrystalCursor
 *               (todos montados; stage-dark sela a cena)
 *   t=0.8s   → fixture + halo da lâmpada acendem
 *   t=1.8s   → bulb warm-up + cone de luz
 *   t=2.2s   → cortinas começam anticipation breath
 *   t=2.4s   → stage-dark inicia dissolve (4.4s ease)
 *   t=3.0s   → cortinas começam o sweep
 *   t=3.2s   → LogoReveal materializa no gap
 *   t=5.0s   → bulb estabiliza em flicker idle
 *   t=5.2s   → SceneVignette aparece, LogoReveal começa a sumir
 *   t=6.2s   → Nav fade in + LunarClock visíveis
 *   t=7.2s   → Cortinas fade
 *   t=8.5s   → Cortinas vão embora
 */

export default function HomeLanding() {
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setNavVisible(true), 6200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-hidden cursor-none"
      style={{ background: "#000" }}
    >
      {/* Camada 1: ruído cinematográfico (z baixo) */}
      <Grain />

      {/* Camada 2: constelação de fundo */}
      <Constellation />

      {/* Camada 3: fumaça atmosférica (removida — clareava o fundo) */}

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

      {/* Camada 6: lâmpada Edison + stage-dark + cone de luz */}
      <EdisonLamp />

      {/* Camada 7: cursor de cristal (z baixo, pointer-events none) */}
      <CrystalCursor />

      {/* Camada 8: nav */}
      <Nav activeId="home" visible={navVisible} />

      {/* Camada 9 (top): cortinas de veludo — preloader */}
      <Curtains />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Constellation from "./Constellation";
import Curtains from "./Curtains";
import CrystalCursor from "./CrystalCursor";
import EdisonLamp from "./EdisonLamp";
import Grain from "./Grain";
import HeroCTA from "./HeroCTA";
import HeroTitle from "./HeroTitle";
import LogoReveal from "./LogoReveal";
import LunarClock from "./LunarClock";
import Nav from "./Nav";
import SceneVignette from "./SceneVignette";
import Smoke from "./Smoke";
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
  const [clockVisible, setClockVisible] = useState(false);

  useEffect(() => {
    const ids: number[] = [];
    ids.push(window.setTimeout(() => setNavVisible(true), 6200));
    ids.push(window.setTimeout(() => setClockVisible(true), 6200));
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      {/* Camada 1: ruído cinematográfico (z baixo) */}
      <Grain />

      {/* Camada 2: constelação de fundo */}
      <Constellation />

      {/* Camada 3: fumaça atmosférica */}
      <Smoke />

      {/* Camada 4: vinheta moldando a cena */}
      <SceneVignette />

      {/* Camada 5: hero com vídeo + mandala (HeroTitle dentro) */}
      <VideoHero>
        <HeroTitle />
        <HeroCTA />
      </VideoHero>

      {/* Camada 6: lâmpada Edison + stage-dark + cone de luz */}
      <EdisonLamp />

      {/* Camada 7: cursor de cristal (z baixo, pointer-events none) */}
      <CrystalCursor />

      {/* Camada 8: nav + relógio lunar (aparecem juntos) */}
      <Nav activeId="home" visible={navVisible} />
      <LunarClock visible={clockVisible} />

      {/* Camada 9: logo reveal — materializa no gap das cortinas */}
      <LogoReveal />

      {/* Camada 10 (top): cortinas de veludo — preloader */}
      <Curtains />
    </main>
  );
}

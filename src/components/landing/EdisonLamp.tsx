"use client";

import { useEffect, useState } from "react";

import styles from "./EdisonLamp.module.css";

/**
 * EdisonLamp — lustre de latão Art Nouveau com bulbo Edison,
 * cone de luz atmosférico, halo no teto, e o stage-dark que sela
 * a cena até a lâmpada iluminar.
 *
 * É a única fonte de luz da cena. Quando acende, o véu preto
 * (stage-dark) se dissolve com ease cúbico lento e a cena emerge.
 *
 * Timeline default (bate com o reveal original da home):
 *   t = fixtureDelay    (  800 ms) → fixture ghost in + halo
 *   t = igniteDelay     ( 1800 ms) → bulb warm-up + cone ignite
 *   t = stageClearDelay ( 2400 ms) → stage-dark começa a dissolver (4.4s)
 *   t = steadyDelay     ( 5000 ms) → bulb entra em flicker idle
 *
 * Callbacks pra coreografia externa (integrar com Curtains/Nav/etc):
 *   onFixtureOn, onIgnite, onStageClearStart, onSteady
 */

type Phase = "off" | "igniting" | "steady";

interface EdisonLampProps {
  /** ms antes da fixture aparecer (halo + canopy + shade). */
  fixtureDelay?: number;
  /** ms antes do bulb acender + cone de luz. */
  igniteDelay?: number;
  /** ms antes do stage-dark começar a dissolver. */
  stageClearDelay?: number;
  /** ms antes do bulb entrar em flicker idle. */
  steadyDelay?: number;

  onFixtureOn?: () => void;
  onIgnite?: () => void;
  onStageClearStart?: () => void;
  onSteady?: () => void;

  /** Se false, não roda a timeline automática. Default: true. */
  autoPlay?: boolean;
}

export default function EdisonLamp({
  fixtureDelay = 800,
  igniteDelay = 1800,
  stageClearDelay = 800,
  steadyDelay = 5000,
  onFixtureOn,
  onIgnite,
  onStageClearStart,
  onSteady,
  autoPlay = true,
}: EdisonLampProps) {
  const [fixtureOn, setFixtureOn] = useState(false);
  const [haloOn, setHaloOn] = useState(false);
  const [coneOn, setConeOn] = useState(false);
  const [bulbPhase, setBulbPhase] = useState<Phase>("off");
  const [stageClearing, setStageClearing] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;
    const timeouts: number[] = [];

    timeouts.push(
      window.setTimeout(() => {
        setFixtureOn(true);
        setHaloOn(true);
        onFixtureOn?.();
      }, fixtureDelay),
    );

    timeouts.push(
      window.setTimeout(() => {
        setBulbPhase("igniting");
        setConeOn(true);
        onIgnite?.();
      }, igniteDelay),
    );

    timeouts.push(
      window.setTimeout(() => {
        setStageClearing(true);
        onStageClearStart?.();
      }, stageClearDelay),
    );

    timeouts.push(
      window.setTimeout(() => {
        setBulbPhase("steady");
        onSteady?.();
      }, steadyDelay),
    );

    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrapCls = [styles.wrap, fixtureOn ? styles.on : ""].filter(Boolean).join(" ");
  const haloCls = [styles.halo, haloOn ? styles.on : ""].filter(Boolean).join(" ");
  const coneCls = [styles.cone, coneOn ? styles.on : ""].filter(Boolean).join(" ");
  const bulbCls = [
    styles.bulb,
    bulbPhase === "igniting" ? styles.ignite : "",
    bulbPhase === "steady" ? styles.steady : "",
  ]
    .filter(Boolean)
    .join(" ");
  const stageCls = [styles.stageDark, stageClearing ? styles.clearing : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={stageCls} aria-hidden="true" />

      <div className={coneCls} aria-hidden="true" />

      <div className={wrapCls} aria-hidden="true">
        <div className={styles.canopy} />
        <div className={styles.cord} />
        <div className={styles.socket} />
        <div className={styles.shade}>
          <div className={bulbCls} />
        </div>
      </div>

      <div className={haloCls} aria-hidden="true" />
    </>
  );
}

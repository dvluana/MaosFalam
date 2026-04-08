import styles from "./Smoke.module.css";

/**
 * Smoke — fumaça atmosférica em camada fixa fullscreen.
 *
 * Renderiza N orbs (default 5) posicionados via :nth-child no CSS Module,
 * cada um com blur pesado e animação de deriva lenta. Puramente decorativo.
 *
 * Em viewports <= 480px, o CSS esconde orbs a partir do 3º (blur é caro
 * na GPU em mobile).
 */

interface SmokeProps {
  /** Quantidade de orbs renderizados. Default 5 (original). */
  orbs?: number;
}

export default function Smoke({ orbs = 5 }: SmokeProps) {
  return (
    <div aria-hidden="true" className={styles.smoke}>
      {Array.from({ length: orbs }, (_, i) => (
        <div key={i} className={styles.orb} />
      ))}
    </div>
  );
}

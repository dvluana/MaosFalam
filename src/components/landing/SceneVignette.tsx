import styles from "./SceneVignette.module.css";

/**
 * SceneVignette — moldura radial permanente que escurece as bordas
 * da viewport, dando sensação de palco/teatro.
 *
 * Puramente visual, sem JS. Pode ser Server Component.
 */

interface SceneVignetteProps {
  /** Classe extra pra composição. */
  className?: string;
}

export default function SceneVignette({ className }: SceneVignetteProps) {
  return (
    <div
      aria-hidden="true"
      className={`${styles.vignette}${className ? ` ${className}` : ""}`}
    />
  );
}

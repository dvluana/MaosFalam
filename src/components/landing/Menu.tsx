"use client";

import { useCallback, useEffect, useState } from "react";

import type { MenuItem } from "@/data/menu-items";
import { GUEST_ITEMS } from "@/data/menu-items";

import styles from "./Menu.module.css";

/**
 * Menu — trigger burger (canto superior direito) + overlay fullscreen.
 *
 * A cigana não mostra o índice. Ela destranca uma gaveta.
 *
 * Porta:
 *  - Animação de cortina descendo (cubic-bezier 0.86,0,0.07,1)
 *  - Glow central + sweep horizontal + revelação cascateada dos itens
 *  - Burger → X com delays cuidadosos
 *  - Fecha no Escape, no close button, ou 320ms após click num item
 *  - Trava o scroll do body enquanto aberto
 */

interface MenuProps {
  /** Qual item aparece marcado como ativo. */
  activeId?: string;
  /** Substitui a lista default se precisar. */
  items?: MenuItem[];
}

export default function Menu({ activeId = "home", items = GUEST_ITEMS }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [activeState, setActiveState] = useState(activeId);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Esc fecha + trava do scroll do body
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  function handleItemClick(e: React.MouseEvent<HTMLAnchorElement>, item: MenuItem) {
    if (item.onClick) {
      e.preventDefault();
      item.onClick();
      window.setTimeout(close, 320);
      return;
    }
    if (item.href === "#") e.preventDefault();
    setActiveState(item.id);
    // Pequeno atraso pra o olho pegar o highlight antes do painel subir
    window.setTimeout(close, 320);
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="maosfalam-menu"
        onClick={toggle}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
      >
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
        <span className={styles.burgerLine} />
      </button>

      <div
        id="maosfalam-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        className={`${styles.overlay} ${open ? styles.open : ""}`}
      >
        <div className={styles.panel}>
          <button type="button" aria-label="Fechar menu" onClick={close} className={styles.close}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line
                x1="2"
                y1="2"
                x2="12"
                y2="12"
                stroke="#7a6832"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="2"
                x2="2"
                y2="12"
                stroke="#7a6832"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className={styles.glow} />
          <div className={styles.sweep} />

          <div className={styles.inner}>
            <div className={styles.brand}>
              <svg width="24" viewBox="0 0 613 366" fill="none" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M288.841 46.146C293.104 63.164 294.411 81.573 303.299 97.107C325.889 136.609 370.568 149.719 409.266 166.602C448.926 183.898 485.101 198.622 526.441 211.064C554.06 219.031 584.428 226.543 613 229.958C589.772 232.047 567.585 233.251 545.348 241.341C490.896 261.154 455.302 309.301 405.034 336.378C376.118 352.549 342.428 363.614 309.407 365.631C228.034 370.594 156.821 324.788 100.808 270.409C69.826 240.329 46.14 231.59 3.873 233.998C39.206 222.563 76.544 210.374 110.893 196.244C131.719 187.677 153.615 176.583 174.614 167.361C201.576 155.521 232.546 143.208 255.681 125.206C282.259 104.522 285.384 77.21 288.841 46.146Z"
                  fill="#7a6832"
                  opacity="0.7"
                />
              </svg>
              <span className={styles.brandLabel}>MãosFalam</span>
            </div>

            <nav className={styles.nav}>
              {items.map((item, i) => {
                const isActive = item.id === activeState;
                // Cascata: cada item entra 80ms depois do anterior, primeiro a t=480ms.
                const delay = `${0.48 + i * 0.08}s`;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleItemClick(e, item)}
                    className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    style={
                      {
                        "--menu-item-delay": delay,
                      } as React.CSSProperties
                    }
                  >
                    <div className={styles.cornerTl} />
                    <div className={styles.cornerBr} />
                    <div className={styles.itemInner}>
                      <span className={styles.itemNum}>{item.num}</span>
                      <span className={styles.itemLabel}>{item.label}</span>
                    </div>
                    <div className={styles.itemSub}>{item.sub}</div>
                  </a>
                );
              })}
            </nav>

            <div className={styles.footer}>
              <div className={styles.orn}>
                <div className={styles.ornDot} />
              </div>
              <p className={styles.tagline}>Me mostre sua mão e eu te conto quem você é</p>
              <p className={styles.version}>© 2025 · MãosFalam</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

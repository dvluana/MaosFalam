"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./HeroCTA.module.css";

/**
 * HeroCTA — botão central que abre o funil de leitura.
 *
 * Substitui o "Em Breve" do home.html legado. Agora leva pra
 * /ler/toque (primeira tela do funil de captura de mão).
 *
 * Aparece com fade-in suave após `delay` ms (default 9000 —
 * espera o reveal da landing terminar pra não competir).
 */

interface HeroCTAProps {
  href?: string;
  label?: string;
  delay?: number;
}

export default function HeroCTA({
  href = "/ler/nome",
  label = "Mostre sua mão",
  delay = 9000,
}: HeroCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);

  return (
    <Link href={href} className={`${styles.cta} corner-ornaments ${visible ? styles.visible : ""}`}>
      {label}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.icon}
        aria-hidden="true"
      >
        <path
          d="M5 2.5L9.5 7L5 11.5"
          stroke="url(#cta-chevron-grad)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="cta-chevron-grad" x1="5" y1="2.5" x2="9.5" y2="11.5">
            <stop offset="0%" stopColor="#e3c77a" />
            <stop offset="100%" stopColor="#c9a24a" />
          </linearGradient>
        </defs>
      </svg>
    </Link>
  );
}

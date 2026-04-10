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
    </Link>
  );
}

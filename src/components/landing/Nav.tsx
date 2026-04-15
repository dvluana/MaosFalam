"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import BrandIcon from "@/components/ui/BrandIcon";
import { GUEST_ITEMS, LOGGED_ITEMS } from "@/data/menu-items";
import { useAuth } from "@/hooks/useAuth";

import Menu from "./Menu";
import styles from "./Nav.module.css";

interface NavProps {
  activeId?: string;
  visible?: boolean;
}

export default function Nav({ activeId = "home", visible = true }: NavProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = useMemo(() => {
    if (!user) return GUEST_ITEMS;
    return [
      ...LOGGED_ITEMS,
      {
        id: "sair",
        num: "05",
        label: "Sair",
        sub: "Até a próxima",
        href: "/",
        onClick: () => {
          logout();
          router.push("/");
        },
      },
    ];
  }, [user, logout, router]);

  return (
    <header role="banner" className={`${styles.nav} ${visible ? styles.show : ""}`}>
      <div className={styles.inner}>
        <div className={styles.logo} aria-label="MãosFalam">
          <BrandIcon width={28} height={17} className="text-gold" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vetor-logo.svg" alt="MãosFalam" className={styles.logoMark} />
        </div>

        <Menu activeId={activeId} items={menuItems} />
      </div>
    </header>
  );
}

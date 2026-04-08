import type { Metadata } from "next";
import {
  Cinzel,
  Cormorant_Garamond,
  Raleway,
  JetBrains_Mono,
  Cinzel_Decorative,
} from "next/font/google";
import "./globals.css";
import { OfflineDetector, SiteHeader } from "@/components/ui";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: "italic",
  variable: "--font-cormorant",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-raleway",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-jetbrains",
  display: "swap",
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MãosFalam",
  description: "Suas mãos já sabem. Você ainda não.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${cinzel.variable} ${cormorant.variable} ${raleway.variable} ${jetbrains.variable} ${cinzelDecorative.variable} font-raleway antialiased`}
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[0.025] mix-blend-overlay"
        >
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
        <OfflineDetector />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}

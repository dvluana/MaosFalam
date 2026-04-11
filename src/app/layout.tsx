import { ClerkProvider } from "@clerk/nextjs";
import {
  Cinzel,
  Cinzel_Decorative,
  Cormorant_Garamond,
  JetBrains_Mono,
  Raleway,
} from "next/font/google";

import ComingSoon from "@/components/ComingSoon";
import { OfflineDetector, SiteHeader, ToastProvider } from "@/components/ui";

import type { Metadata } from "next";

import "./globals.css";

const ENV_LABEL = process.env.NEXT_PUBLIC_ENV_LABEL;
const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

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

const siteTitle = ENV_LABEL ? `${ENV_LABEL} · MãosFalam` : "MãosFalam";
const faviconPath = ENV_LABEL ? "/icons/favicon-staging.svg" : "/favicon.ico";

export const metadata: Metadata = {
  title: siteTitle,
  description: "Suas mãos já sabem. Você ainda não.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: faviconPath, sizes: "32x32", type: ENV_LABEL ? "image/svg+xml" : "image/x-icon" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteTitle,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "#110C1A",
          colorText: "#E8DFD0",
          colorPrimary: "#C9A24A",
          colorInputBackground: "#171222",
          colorInputText: "#E8DFD0",
          borderRadius: "0px 6px 0px 6px",
        },
        elements: {
          card: { backgroundColor: "#110C1A", border: "1px solid rgba(201,162,74,0.1)" },
          headerTitle: { color: "#E8DFD0" },
          headerSubtitle: { color: "#9b9284" },
          socialButtonsBlockButton: {
            backgroundColor: "#171222",
            border: "1px solid rgba(201,162,74,0.15)",
            color: "#E8DFD0",
          },
          formFieldInput: {
            backgroundColor: "#171222",
            borderColor: "rgba(123,107,165,0.2)",
            color: "#E8DFD0",
          },
          footerActionLink: { color: "#C9A24A" },
          internal: { fontFamily: "var(--font-raleway)" },
        },
      }}
    >
      <html lang="pt-BR">
        <head>
          <meta name="theme-color" content="#08050E" />
        </head>
        <body
          className={`${cinzel.variable} ${cormorant.variable} ${raleway.variable} ${jetbrains.variable} ${cinzelDecorative.variable} font-raleway antialiased`}
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-[0.025] mix-blend-overlay"
          >
            <filter id="grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.9"
                numOctaves="2"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain)" />
          </svg>
          <ToastProvider>
            <OfflineDetector />
            {COMING_SOON ? (
              <ComingSoon />
            ) : (
              <>
                <SiteHeader />
                {children}
              </>
            )}
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

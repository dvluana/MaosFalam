import { NextResponse } from "next/server";

const ENV_LABEL = process.env.NEXT_PUBLIC_ENV_LABEL;

export function GET() {
  const isStaging = !!ENV_LABEL;
  const name = isStaging ? `MãosFalam ${ENV_LABEL}` : "MãosFalam";
  const shortName = isStaging ? `MF ${ENV_LABEL}` : "MãosFalam";

  return NextResponse.json({
    name,
    short_name: shortName,
    description: "Me mostre sua mão e eu te conto quem você é",
    start_url: "/",
    display: "standalone",
    background_color: "#08050E",
    theme_color: "#08050E",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  });
}

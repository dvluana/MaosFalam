import { notFound } from "next/navigation";

import type { Metadata } from "next";

interface PreviewLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Preview | MãosFalam",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewLayout({ children }: PreviewLayoutProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return children;
}

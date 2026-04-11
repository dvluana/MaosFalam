import HomeLanding from "@/components/landing/HomeLanding";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MãosFalam",
  description: "Suas mãos já sabem. Você ainda não.",
};

export default function HomePage() {
  return <HomeLanding />;
}

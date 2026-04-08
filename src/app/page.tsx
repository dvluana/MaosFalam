import type { Metadata } from "next";
import HomeLanding from "@/components/landing/HomeLanding";

export const metadata: Metadata = {
  title: "MãosFalam",
  description: "Suas mãos já sabem. Você ainda não.",
};

export default function HomePage() {
  return <HomeLanding />;
}

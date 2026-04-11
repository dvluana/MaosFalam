import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function RedefinirSenhaPage(_props: PageProps) {
  redirect("/login");
}

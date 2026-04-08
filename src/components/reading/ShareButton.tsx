import Link from "next/link";
import Button from "@/components/ui/Button";

interface Props {
  readingId: string;
}

export default function ShareButton({ readingId }: Props) {
  return (
    <Link href={`/ler/resultado/${readingId}/share`}>
      <Button variant="secondary" size="sm">
        Compartilhar
      </Button>
    </Link>
  );
}

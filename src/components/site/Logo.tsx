import Image from "next/image";
import Link from "next/link";

export default function Logo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Unilight — на главную" className="shrink-0">
      <Image src="/logo.png" alt="Unilight" width={546} height={288} priority className={className} />
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";

export default function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <Link href="/" aria-label="StepByStep — на главную" className="shrink-0">
      <Image src="/logo.png" alt="Step by Step — Move forward" width={708} height={319} priority className={className} />
    </Link>
  );
}

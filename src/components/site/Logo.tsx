import Image from "next/image";
import Link from "next/link";

// tone="light" — белый логотип для тёмного фона.
export default function Logo({ className = "h-9 w-auto", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link href="/" aria-label="Unilight — на главную" className="shrink-0">
      <Image src={tone === "light" ? "/logo-white.png" : "/logo.png"} alt="Unilight" width={548} height={304} priority className={className} />
    </Link>
  );
}

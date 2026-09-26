import Image from "next/image";
import Link from "next/link";

// tone="light" — логотип для тёмного фона: в тёмной теме белый, в светлой — обычный тёмный.
// tone="dark" — всегда тёмный (админка, печать).
export default function Logo({ className = "h-9 w-auto", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link href="/" aria-label="Unilight — на главную" className="shrink-0">
      {tone === "light" ? (
        <>
          <Image src="/logo-white.png" alt="Unilight" width={548} height={304} priority className={`theme-dark-only ${className}`} />
          <Image src="/logo.png" alt="Unilight" width={548} height={304} priority className={`theme-light-only ${className}`} />
        </>
      ) : (
        <Image src="/logo.png" alt="Unilight" width={548} height={304} priority className={className} />
      )}
    </Link>
  );
}

import type { Metadata } from "next";
import { Inter, Outfit, Unbounded } from "next/font/google";
import AuthSync from "@/components/site/AuthSync";
import CabinetLoaderHost from "@/components/site/CabinetLoader";
import { HTML_LANG } from "@/lib/i18n";
import { LangProvider } from "@/lib/i18n/client";
import { getLang, getT } from "@/lib/i18n/server";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    metadataBase: new URL(SITE.url),
    title: { default: t.meta.title, template: "%s — Unilight" },
    description: t.meta.description,
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: "Unilight",
      title: t.meta.title,
      description: t.meta.description,
      images: [{ url: "/logo.png", width: 546, height: 288, alt: "Unilight" }],
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html lang={HTML_LANG[lang]} className={`${inter.variable} ${unbounded.variable} ${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <LangProvider lang={lang}>
          <AuthSync />
          {children}
          <CabinetLoaderHost />
        </LangProvider>
      </body>
    </html>
  );
}

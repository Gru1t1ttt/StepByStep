import type { Metadata } from "next";
import { Inter, Outfit, Unbounded } from "next/font/google";
import AuthSync from "@/components/site/AuthSync";
import CabinetLoaderHost from "@/components/site/CabinetLoader";
import { HTML_LANG } from "@/lib/i18n";
import { LangProvider } from "@/lib/i18n/client";
import { getLang, getT, getTheme } from "@/lib/i18n/server";
import { ThemeProvider } from "@/lib/theme";
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
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);
  return (
    <html
      lang={HTML_LANG[lang]}
      data-theme={theme}
      style={{ colorScheme: theme }}
      className={`${inter.variable} ${unbounded.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider initial={theme}>
          <LangProvider lang={lang}>
            <AuthSync />
            {children}
            <CabinetLoaderHost />
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Outfit, Unbounded } from "next/font/google";
import AuthSync from "@/components/site/AuthSync";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Unilight — поступи в университет мечты без страха", template: "%s — Unilight" },
  description:
    "ИИ-платформа для школьников: персональная карта развития, подбор олимпиад и конкурсов, gap analysis для университетов, портфолио и ИИ-наставник.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Unilight",
    title: "Unilight — поступи в университет мечты без страха",
    description: "Персональная карта развития, подбор возможностей и ИИ-наставник для поступления за рубеж.",
    images: [{ url: "/logo.png", width: 546, height: 288, alt: "Unilight" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${inter.variable} ${unbounded.variable} ${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthSync />
        {children}
      </body>
    </html>
  );
}

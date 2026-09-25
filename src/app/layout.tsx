import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import AuthSync from "@/components/site/AuthSync";
import { SITE } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "StepByStep — поступление в зарубежный университет шаг за шагом", template: "%s — StepByStep" },
  description:
    "ИИ-платформа для школьников: персональная карта развития, подбор олимпиад и конкурсов, gap analysis для университетов, портфолио и ИИ-наставник.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "StepByStep",
    title: "StepByStep — поступи в университет мечты шаг за шагом",
    description: "Персональная карта развития, подбор возможностей и ИИ-наставник для поступления за рубеж.",
    images: [{ url: "/logo.png", width: 708, height: 319, alt: "Step by Step — Move forward" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${inter.variable} ${unbounded.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthSync />
        {children}
      </body>
    </html>
  );
}

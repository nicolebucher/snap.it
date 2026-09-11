"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useLanguage } from "@/lib/i18n/language-context";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-10">
        <Logo size="lg" />
      </div>
      <h1 className="text-xl font-bold sm:text-2xl">{t.landing.heading}</h1>
      <p className="mt-4 max-w-xl text-zinc-400">{t.landing.subtitle}</p>
      <Link
        href="/erstellen"
        className="mt-8 rounded-full bg-teal-400 px-8 py-3 font-medium text-black hover:bg-teal-300"
      >
        {t.landing.cta}
      </Link>
    </main>
  );
}

"use client";

import { useLanguage } from "@/lib/i18n/language-context";

export function LoadingState() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-teal-400" />
      <p className="text-lg font-medium">{t.loading.title}</p>
      <p className="text-sm text-zinc-400">{t.loading.subtitle}</p>
    </div>
  );
}

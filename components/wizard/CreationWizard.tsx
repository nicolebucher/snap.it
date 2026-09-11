"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/form/ProfileForm";
import { FileUpload } from "@/components/form/FileUpload";
import { FormatSelector } from "@/components/form/FormatSelector";
import { GameShell } from "@/components/game/GameShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ShareButton } from "@/components/ui/ShareButton";
import { PdfPreview } from "@/components/pdf/PdfPreview";
import { useLanguage } from "@/lib/i18n/language-context";
import { MAX_TOTAL_SIZE } from "@/lib/files/extract-input";
import type { GameData, OutputFormat, Profile } from "@/types/generation";

type Step = "input" | "loading" | "result-file" | "result-game" | "error";

interface DownloadInfo {
  url: string;
  filename: string;
  blob: Blob;
}

export function CreationWizard() {
  const { locale, t } = useLanguage();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<OutputFormat | null>(null);
  const [step, setStep] = useState<Step>("input");
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [game, setGame] = useState<GameData | null>(null);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const canSubmit = files.length > 0 && !!format && totalSize <= MAX_TOTAL_SIZE;

  async function handleSubmit() {
    if (!canSubmit || !format) return;
    setStep("loading");
    setErrorMessage("");

    const body = new FormData();
    if (profile.age !== undefined) body.set("age", String(profile.age));
    if (profile.grade !== undefined) body.set("grade", String(profile.grade));
    if (profile.schoolType) body.set("schoolType", profile.schoolType);
    if (profile.subject) body.set("subject", profile.subject);
    body.set("format", format);
    body.set("locale", locale);
    files.forEach((file) => body.append("file", file));

    try {
      const response = await fetch("/api/generate", { method: "POST", body });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong.");
      }

      if (format === "game") {
        const data = await response.json();
        setGame(data.game);
        setStep("result-game");
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const filename = response.headers.get("X-Filename") ?? `${format}.pdf`;
        setDownloadInfo({ url, filename, blob });
        setStep("result-file");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error.");
      setStep("error");
    }
  }

  function handleRestart() {
    setStep("input");
    setFiles([]);
    setFormat(null);
    setGame(null);
    setDownloadInfo(null);
    setErrorMessage("");
  }

  if (step === "loading") {
    return <LoadingState />;
  }

  if (step === "error") {
    return <ErrorState message={errorMessage} onRetry={() => setStep("input")} />;
  }

  if (step === "result-game" && game) {
    return (
      <div>
        <GameShell game={game} />
        <div className="mt-8 text-center">
          <button type="button" onClick={handleRestart} className="text-sm text-teal-400 hover:underline">
            {t.wizard.newMaterial}
          </button>
        </div>
      </div>
    );
  }

  if (step === "result-file" && downloadInfo && format) {
    const downloadLabel = format === "worksheet" ? t.wizard.downloadWorksheet : t.wizard.downloadTest;
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-lg font-semibold">{t.wizard.done}</p>

        <p className="mb-2 text-left text-xs uppercase tracking-wide text-zinc-500">{t.wizard.preview}</p>
        <PdfPreview url={downloadInfo.url} label={downloadLabel} />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={downloadInfo.url}
            download={downloadInfo.filename}
            className="inline-block rounded-full bg-teal-400 px-6 py-3 font-medium text-black hover:bg-teal-300"
          >
            {downloadLabel}
          </a>
          <ShareButton
            getFile={() => new File([downloadInfo.blob], downloadInfo.filename, { type: "application/pdf" })}
          />
        </div>

        <div className="mt-6">
          <button type="button" onClick={handleRestart} className="text-sm text-teal-400 hover:underline">
            {t.wizard.newMaterial}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <ProfileForm profile={profile} onChange={setProfile} />
      <FileUpload files={files} onChange={setFiles} />
      <FormatSelector value={format} onChange={setFormat} />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-6 w-full rounded-full bg-teal-400 px-6 py-3 font-medium text-black transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {t.wizard.submit}
      </button>
    </div>
  );
}

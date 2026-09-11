"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/form/ProfileForm";
import { FileUpload } from "@/components/form/FileUpload";
import { FormatSelector } from "@/components/form/FormatSelector";
import { GameShell } from "@/components/game/GameShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ShareButton } from "@/components/ui/ShareButton";
import { useLanguage } from "@/lib/i18n/language-context";
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
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat | null>(null);
  const [step, setStep] = useState<Step>("input");
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
  const [game, setGame] = useState<GameData | null>(null);

  const canSubmit = !!file && !!format;

  async function handleSubmit() {
    if (!canSubmit || !file || !format) return;
    setStep("loading");
    setErrorMessage("");

    const body = new FormData();
    if (profile.age !== undefined) body.set("age", String(profile.age));
    if (profile.grade !== undefined) body.set("grade", String(profile.grade));
    if (profile.schoolType) body.set("schoolType", profile.schoolType);
    if (profile.subject) body.set("subject", profile.subject);
    body.set("format", format);
    body.set("locale", locale);
    body.set("file", file);

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
        const filename =
          format === "worksheet"
            ? locale === "de"
              ? "arbeitsblatt.pdf"
              : "worksheet.pdf"
            : locale === "de"
              ? "testarbeit.pdf"
              : "test.pdf";
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
    setFile(null);
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
        <iframe
          src={downloadInfo.url}
          title={t.wizard.preview}
          className="mb-6 h-[70vh] w-full rounded-lg border border-zinc-700 bg-white"
        />

        <div className="flex flex-wrap items-center justify-center gap-3">
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
      <FileUpload file={file} onChange={setFile} />
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

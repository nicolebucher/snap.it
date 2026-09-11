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
import { InteractiveWorksheet } from "@/components/worksheet/InteractiveWorksheet";
import { useLanguage } from "@/lib/i18n/language-context";
import { MAX_TOTAL_SIZE } from "@/lib/files/extract-input";
import type { GameData, OutputFormat, Profile, WorksheetData } from "@/types/generation";

type Step = "input" | "loading" | "result-file" | "result-game" | "error";
type ResultTab = "preview" | "practice";

interface DownloadInfo {
  url: string;
  filename: string;
  blob: Blob;
  data: WorksheetData;
}

function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

export function CreationWizard() {
  const { locale, t } = useLanguage();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<OutputFormat | null>(null);
  const [step, setStep] = useState<Step>("input");
  const [resultTab, setResultTab] = useState<ResultTab>("preview");
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
    if (profile.grade !== undefined) body.set("grade", String(profile.grade));
    if (profile.schoolType) body.set("schoolType", profile.schoolType);
    if (profile.subject) body.set("subject", profile.subject);
    if (profile.notes) body.set("notes", profile.notes);
    body.set("format", format);
    body.set("locale", locale);
    files.forEach((file) => body.append("file", file));

    try {
      const response = await fetch("/api/generate", { method: "POST", body });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(json?.error ?? "Something went wrong.");
      }

      if (format === "game") {
        setGame(json.game);
        setStep("result-game");
      } else {
        const blob = base64ToBlob(json.pdfBase64, "application/pdf");
        const url = URL.createObjectURL(blob);
        setDownloadInfo({ url, filename: json.filename, blob, data: json.data });
        setResultTab("preview");
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

        <div className="sticky top-2 z-10 mb-4 flex flex-wrap items-center justify-center gap-3 rounded-full bg-black/90 p-2 backdrop-blur">
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

        <div className="mb-4 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setResultTab("preview")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              resultTab === "preview" ? "bg-teal-400 text-black" : "border border-zinc-700 text-zinc-400"
            }`}
          >
            {t.wizard.previewTab}
          </button>
          <button
            type="button"
            onClick={() => setResultTab("practice")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              resultTab === "practice" ? "bg-teal-400 text-black" : "border border-zinc-700 text-zinc-400"
            }`}
          >
            {t.wizard.practiceTab}
          </button>
        </div>

        {resultTab === "preview" ? (
          <PdfPreview url={downloadInfo.url} label={downloadLabel} />
        ) : (
          <InteractiveWorksheet data={downloadInfo.data} />
        )}

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

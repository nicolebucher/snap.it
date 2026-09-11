"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { useLanguage } from "@/lib/i18n/language-context";

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function FileUpload({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);

  async function handleFile(selected: File) {
    setError("");

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError(t.upload.errorType);
      return;
    }

    if (selected.type === "application/pdf") {
      onChange(selected);
      return;
    }

    try {
      setIsCompressing(true);
      const compressed = await imageCompression(selected, {
        maxWidthOrHeight: 1600,
        maxSizeMB: 3,
        useWebWorker: true,
      });
      onChange(compressed);
    } catch {
      onChange(selected);
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <div className="mb-6">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const dropped = e.dataTransfer.files[0];
          if (dropped) void handleFile(dropped);
        }}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 p-6 text-center hover:border-teal-400"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) void handleFile(selected);
          }}
        />
        {isCompressing && <p className="text-sm text-zinc-400">{t.upload.compressing}</p>}
        {!isCompressing && file && <p className="text-sm font-medium text-white">{file.name}</p>}
        {!isCompressing && !file && <p className="text-sm text-zinc-400">{t.upload.dragText}</p>}
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      <p className="mt-2 text-xs text-zinc-500">{t.upload.privacyNote}</p>
    </div>
  );
}

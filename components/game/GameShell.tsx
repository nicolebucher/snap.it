"use client";

import { useState } from "react";
import type { GameData } from "@/types/generation";
import { buildStandaloneGameHtml } from "@/lib/game/build-standalone-game-html";
import { useLanguage } from "@/lib/i18n/language-context";
import { ShareButton } from "@/components/ui/ShareButton";
import { LevelPlayer, type LevelResult } from "./LevelPlayer";
import { ResultScreen } from "./ResultScreen";

const GAME_FILENAME = "learning-game.html";

export function GameShell({ game }: { game: GameData }) {
  const { locale, t } = useLanguage();
  const [results, setResults] = useState<Record<number, LevelResult>>({});
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);

  const sortedLevels = [...game.levels].sort((a, b) => a.id - b.id);
  const isUnlocked = (index: number) => index === 0 || results[sortedLevels[index - 1].id] !== undefined;
  const activeLevel = sortedLevels.find((level) => level.id === activeLevelId) ?? null;
  const allDone = sortedLevels.every((level) => results[level.id] !== undefined);

  function buildGameFile(): File {
    const html = buildStandaloneGameHtml(game, locale);
    return new File([html], GAME_FILENAME, { type: "text/html" });
  }

  function handleDownload() {
    const file = buildGameFile();
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (activeLevel) {
    return (
      <LevelPlayer
        level={activeLevel}
        onExit={() => setActiveLevelId(null)}
        onComplete={(result) => {
          setResults((prev) => ({ ...prev, [activeLevel.id]: result }));
          setActiveLevelId(null);
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold">{game.gameTitle}</h1>
          <p className="text-sm text-zinc-400">{game.subject}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full border border-teal-400 px-4 py-2 text-sm font-medium text-teal-400 hover:bg-teal-400/10"
          >
            {t.game.download}
          </button>
          <ShareButton getFile={buildGameFile} compact />
        </div>
      </div>

      {allDone && <ResultScreen levels={sortedLevels} results={results} />}

      <div className="grid gap-3 sm:grid-cols-2">
        {sortedLevels.map((level, index) => {
          const unlocked = isUnlocked(index);
          const result = results[level.id];
          return (
            <button
              key={level.id}
              type="button"
              disabled={!unlocked}
              onClick={() => setActiveLevelId(level.id)}
              className={`rounded-xl border p-4 text-left transition ${
                unlocked
                  ? "border-zinc-700 bg-zinc-950 hover:border-teal-400"
                  : "cursor-not-allowed border-zinc-900 bg-zinc-950/50 text-zinc-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Level {index + 1}: {level.title}
                </span>
                {!unlocked && <span aria-hidden>🔒</span>}
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                {t.difficulty[level.difficulty] ?? level.difficulty}
              </p>
              {result && (
                <p className="mt-2 text-sm">
                  {"⭐".repeat(result.stars)}
                  {"☆".repeat(3 - result.stars)}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

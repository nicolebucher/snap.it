"use client";

import { useRef, useState } from "react";
import type { Level } from "@/types/generation";
import { useLanguage } from "@/lib/i18n/language-context";
import { QuestionCard } from "./QuestionCard";
import { SnapEffect } from "./SnapEffect";

export interface LevelResult {
  stars: number;
  score: number;
}

const SNAPS_BY_DIFFICULTY: Record<string, number> = { leicht: 10, mittel: 15, schwer: 20 };

export function LevelPlayer({
  level,
  onComplete,
  onExit,
  onSnap,
}: {
  level: Level;
  onComplete: (result: LevelResult) => void;
  onExit: () => void;
  onSnap: (amount: number) => void;
}) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [snapBurst, setSnapBurst] = useState<{ key: number; amount: number } | null>(null);
  // Mirrors `answered`/advance-in-progress synchronously so a second click/tap event
  // (e.g. a touch device firing both `touchend` and a synthetic `click`) landing before
  // React commits the state update can't slip through and answer/advance twice per tap.
  const answeredRef = useRef(false);
  const advancingRef = useRef(false);

  const question = level.questions[index];
  const isLast = index === level.questions.length - 1;
  const answered = selected !== null;
  const isCorrect = answered && selected === question.correctIndex;
  const snapsForThisQuestion = SNAPS_BY_DIFFICULTY[level.difficulty] ?? 10;

  function handleSelect(optionIndex: number) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setSelected(optionIndex);
    if (optionIndex === question.correctIndex) {
      setCorrectCount((c) => c + 1);
      onSnap(snapsForThisQuestion);
      setSnapBurst({ key: Date.now(), amount: snapsForThisQuestion });
    }
  }

  function handleNext() {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setSnapBurst(null);
    if (isLast) {
      const ratio = correctCount / level.questions.length;
      const stars = ratio === 1 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
      onComplete({ stars, score: correctCount });
    } else {
      setSelected(null);
      answeredRef.current = false;
      advancingRef.current = false;
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={onExit} className="text-sm text-zinc-500 hover:text-zinc-300">
          ← {t.game.back}
        </button>
        <span className="text-sm text-zinc-500">{t.game.questionOf(index + 1, level.questions.length)}</span>
      </div>
      <h2 className="mb-4 text-lg font-semibold">{level.title}</h2>
      <div className="relative">
        <QuestionCard question={question} selected={selected} onSelect={handleSelect} />
        {snapBurst && <SnapEffect key={snapBurst.key} amount={snapBurst.amount} snapsUnit={t.game.snapsUnit} />}
      </div>
      {answered && (
        <div
          className={`mt-4 rounded-lg p-4 text-sm ${
            isCorrect ? "bg-green-400/10 text-green-300" : "bg-orange-400/10 text-orange-300"
          }`}
        >
          <p className="mb-1 font-medium">{isCorrect ? t.game.correct : t.game.wrong}</p>
          <p>{question.explanation}</p>
        </div>
      )}
      {answered && (
        <button
          type="button"
          onClick={handleNext}
          className="mt-4 rounded-full bg-teal-400 px-5 py-2 font-medium text-black hover:bg-teal-300"
        >
          {isLast ? t.game.finishLevel : t.game.next}
        </button>
      )}
    </div>
  );
}

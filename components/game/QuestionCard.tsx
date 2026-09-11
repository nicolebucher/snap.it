"use client";

import type { Question } from "@/types/generation";

export function QuestionCard({
  question,
  selected,
  onSelect,
}: {
  question: Question;
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="mb-4 font-medium">{question.prompt}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correctIndex;
          let stateClass = "border-zinc-700 hover:border-teal-400";
          if (selected !== null) {
            if (isCorrect) stateClass = "border-green-400 bg-green-400/10";
            else if (isSelected) stateClass = "border-orange-400 bg-orange-400/10";
            else stateClass = "border-zinc-800 text-zinc-600";
          }
          return (
            <button
              key={i}
              type="button"
              disabled={selected !== null}
              onClick={() => onSelect(i)}
              className={`rounded-lg border px-4 py-2 text-left text-sm transition ${stateClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { schoolTypes, type Profile } from "@/types/generation";
import { useLanguage } from "@/lib/i18n/language-context";

export function ProfileForm({
  profile,
  onChange,
}: {
  profile: Partial<Profile>;
  onChange: (profile: Partial<Profile>) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-medium">{t.profile.heading}</p>
      <p className="mb-2 text-sm text-zinc-400">{t.profile.hint}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t.profile.grade}
          <input
            type="number"
            min={1}
            max={13}
            value={profile.grade ?? ""}
            onChange={(e) => onChange({ ...profile, grade: e.target.value ? Number(e.target.value) : undefined })}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t.profile.schoolType}
          <select
            value={profile.schoolType ?? ""}
            onChange={(e) =>
              onChange({ ...profile, schoolType: (e.target.value || undefined) as Profile["schoolType"] })
            }
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            <option value="">{t.profile.schoolTypeNone}</option>
            {schoolTypes.map((type) => (
              <option key={type} value={type}>
                {t.schoolTypeLabels[type] ?? type}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t.profile.subject}
          <input
            type="text"
            placeholder={t.profile.subjectPlaceholder}
            value={profile.subject ?? ""}
            onChange={(e) => onChange({ ...profile, subject: e.target.value || undefined })}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">
          {t.profile.notes}
          <textarea
            rows={2}
            maxLength={300}
            placeholder={t.profile.notesPlaceholder}
            value={profile.notes ?? ""}
            onChange={(e) => onChange({ ...profile, notes: e.target.value || undefined })}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
          />
        </label>
      </div>
    </div>
  );
}

"use client";

import { Calendar } from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

export type Period =
  | "jour"
  | "semaine"
  | "semaine_precedente"
  | "mois"
  | "tout";

const OPTIONS: { value: Period; label: string }[] = [
  { value: "jour", label: "Aujourd'hui" },
  { value: "semaine", label: "Cette semaine" },
  { value: "semaine_precedente", label: "Semaine précédente" },
  { value: "mois", label: "Ce mois-ci" },
  { value: "tout", label: "Tout" },
];

/* =========================================================
   COMPOSANT
========================================================= */

export default function PeriodFilter({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) {
  return (
    <div
      className="
        flex items-center gap-1.5
        bg-white dark:bg-gray-900
        p-1.5 rounded-xl shadow-sm
        overflow-x-auto
      "
    >
      <Calendar className="w-4 h-4 text-gray-400 shrink-0 ml-1.5" />

      {OPTIONS.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              whitespace-nowrap
              text-xs
              font-medium
              px-3 py-1.5
              rounded-lg
              transition-colors
              duration-200
              ${
                active
                  ? "bg-[#008080] text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
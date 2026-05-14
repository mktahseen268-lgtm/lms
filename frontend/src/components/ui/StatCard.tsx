import { ReactNode } from "react";
import clsx from "clsx";

const TONE: Record<string, string> = {
  purple: "from-brand-700 to-brand-900 text-white",
  green: "from-emerald-600 to-teal-700 text-white",
  orange: "from-orange-500 to-amber-600 text-white",
  red: "from-rose-500 to-red-600 text-white",
  blue: "from-sky-500 to-indigo-600 text-white",
  slate: "from-slate-600 to-slate-800 text-white",
};

export default function StatCard({
  label,
  value,
  hint,
  tone = "purple",
  icon,
  onClick,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: keyof typeof TONE;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={clsx(
        "text-start rounded-xl p-4 bg-gradient-to-br shadow-card transition-transform hover:scale-[1.01]",
        TONE[tone],
        !onClick && "cursor-default"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs/5 opacity-80">{label}</div>
          <div className="text-2xl font-extrabold mt-1">{value}</div>
          {hint && <div className="text-[11px] mt-2 opacity-85">{hint}</div>}
        </div>
        {icon && <div className="opacity-90">{icon}</div>}
      </div>
    </button>
  );
}

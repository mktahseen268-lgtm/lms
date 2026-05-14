import clsx from "clsx";

export default function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  hint?: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked ? "bg-brand-700" : "bg-slate-300 dark:bg-slate-700"
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "end-0.5" : "start-0.5"
          )}
        />
      </button>
      {(label || hint) && (
        <div className="text-sm">
          {label && <div className="font-medium text-slate-700 dark:text-slate-200">{label}</div>}
          {hint && <div className="text-xs text-slate-500">{hint}</div>}
        </div>
      )}
    </label>
  );
}

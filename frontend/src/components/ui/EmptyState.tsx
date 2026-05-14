import { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card p-10 flex flex-col items-center text-center">
      <div className="h-16 w-16 rounded-full bg-brand-50 dark:bg-brand-900/20 grid place-items-center text-brand-700 dark:text-brand-300 mb-4">
        {icon || <PackageOpen size={28} />}
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">{description}</p>}
      {action}
    </div>
  );
}

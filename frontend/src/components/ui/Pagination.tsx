import { ChevronRight, ChevronLeft } from "lucide-react";
import { useT, useLanguage } from "../../i18n/LanguageContext";

export default function Pagination({
  page, perPage, total, onPage, onPerPage,
}: {
  page: number; perPage: number; total: number;
  onPage: (n: number) => void; onPerPage: (n: number) => void;
}) {
  const t = useT();
  const { dir } = useLanguage();
  const pages = Math.max(1, Math.ceil(total / perPage));
  const Prev = dir === "rtl" ? ChevronRight : ChevronLeft;
  const Next = dir === "rtl" ? ChevronLeft : ChevronRight;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <select
          value={perPage}
          onChange={(e) => onPerPage(Number(e.target.value))}
          className="input !py-1 !w-auto"
        >
          {[10, 20, 30, 50, 100].map((n) => (
            <option key={n} value={n}>{n} {t("page.perPage")}</option>
          ))}
        </select>
        <span>{t("page.total")}: {total}</span>
      </div>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="btn-outline !p-2">
          <Prev size={16} />
        </button>
        <span className="px-3 text-sm">{t("page.page")} {page} {t("page.of")} {pages}</span>
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="btn-outline !p-2">
          <Next size={16} />
        </button>
      </div>
    </div>
  );
}

import { useT } from "../../i18n/LanguageContext";

export default function Logo({ collapsed = false }: { collapsed?: boolean }) {
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-700 to-brand-900 grid place-items-center text-white font-extrabold shadow-md">
        D
      </div>
      {!collapsed && (
        <div className="leading-tight text-start">
          <div className="font-extrabold text-slate-900 dark:text-white text-sm">{t("brand.name")}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">{t("brand.tagline")}</div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { PlusCircle } from "lucide-react";
import { api } from "../../lib/api";
import { useT } from "../../i18n/LanguageContext";

export default function ListRoles() {
  const t = useT();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get("/roles").then((r) => setRows(r.data.data || [])); }, []);

  return (
    <>
      <PageHeader
        title={t("roles.title")}
        subtitle={t("roles.subtitle")}
        actions={<button className="btn-cyan"><PlusCircle size={16} /> {t("roles.add")}</button>}
      />
      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr><th className="th">{t("roles.col.name")}</th><th className="th">{t("shipments.col.actions")}</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length === 0 ? (
              <tr><td colSpan={2} className="td text-center text-slate-400 py-8">{t("roles.empty")}</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="tr">
                <td className="td font-semibold">{r.name}</td>
                <td className="td"><button className="text-brand-700 text-sm">{t("btn.edit")}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

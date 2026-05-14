import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import { PlusCircle, Search, BookOpenCheck } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { useT } from "../../i18n/LanguageContext";

export default function DelegateDiaries() {
  const t = useT();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { api.get("/couriers/diaries").then((r) => setRows(r.data.data || [])).catch(() => {}); }, []);

  return (
    <>
      <PageHeader
        title={t("diaries.title")}
        subtitle={t("diaries.subtitle")}
        actions={<button className="btn-cyan"><PlusCircle size={16} /> {t("diaries.open")}</button>}
      />
      <div className="card p-3 mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-9" placeholder={t("users.searchPh")} />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<BookOpenCheck size={28} />} title={t("diaries.empty")} description={t("diaries.emptyDesc")} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="th">{t("couriers.col.serial")}</th>
                <th className="th">{t("diaries.driver")}</th>
                <th className="th">{t("diaries.driverPhone")}</th>
                <th className="th">{t("couriers.col.created")}</th>
                <th className="th">{t("diaries.closedAt")}</th>
                <th className="th">{t("shipments.col.status")}</th>
                <th className="th">{t("shipments.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r, i) => (
                <tr key={r.id} className="tr">
                  <td className="td">{i + 1}</td>
                  <td className="td">{r.courier?.name}</td>
                  <td className="td">{r.courier?.phone}</td>
                  <td className="td">{formatDate(r.openedAt)}</td>
                  <td className="td">{r.closedAt ? formatDate(r.closedAt) : "—"}</td>
                  <td className="td"><span className={"badge " + (r.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700")}>{r.status === "open" ? t("diaries.open.status") : t("diaries.closed.status")}</span></td>
                  <td className="td"><button className="text-brand-700 hover:underline text-sm">{t("btn.view")}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

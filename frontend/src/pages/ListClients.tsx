import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import { PlusCircle, Search } from "lucide-react";
import { api } from "../lib/api";
import { useT } from "../i18n/LanguageContext";

export default function ListClients() {
  const t = useT();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => { api.get("/clients").then((r) => setRows(r.data.data || [])); }, []);
  const filtered = rows.filter((r) => !search || r.name?.includes(search) || r.email?.includes(search) || r.phone?.includes(search));

  return (
    <>
      <PageHeader
        title={t("clients.title")}
        subtitle={t("clients.subtitle")}
        actions={<button className="btn-cyan"><PlusCircle size={16} /> {t("clients.add")}</button>}
      />
      <div className="card p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-9" placeholder={t("users.searchPh")} />
        </div>
        <select className="input"><option value="">{t("clients.seller")}</option></select>
        <select className="input"><option value="">{t("clients.contains")}</option><option>{t("clients.containsIntegration")}</option><option>{t("clients.containsContract")}</option></select>
      </div>

      {filtered.length === 0 ? <EmptyState title={t("clients.empty")} /> : (
        <div className="table-wrap">
          <table className="table">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="th">{t("clients.col.status")}</th>
                <th className="th">{t("clients.col.city")}</th>
                <th className="th">{t("clients.col.name")}</th>
                <th className="th">{t("clients.col.email")}</th>
                <th className="th">{t("clients.col.phone")}</th>
                <th className="th">{t("clients.col.integration")}</th>
                <th className="th">{t("shipments.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.id} className="tr">
                  <td className="td"><span className={"badge " + (r.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>{r.active ? t("users.active") : t("users.suspended")}</span></td>
                  <td className="td">{r.city}</td>
                  <td className="td font-semibold">{r.name}</td>
                  <td className="td">{r.email}</td>
                  <td className="td">{r.phone}</td>
                  <td className="td font-mono">{r.integrationCode || "—"}</td>
                  <td className="td"><button className="text-brand-700 text-sm">{t("btn.edit")}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Toggle from "../../components/ui/Toggle";
import { PlusCircle, Search } from "lucide-react";
import { api } from "../../lib/api";
import { useT } from "../../i18n/LanguageContext";

export default function ListBranches() {
  const t = useT();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  useEffect(() => { api.get("/branches").then((r) => setRows(r.data.data || [])); }, []);

  const filtered = rows.filter((r) => !search || r.name?.includes(search) || r.address?.includes(search));

  return (
    <>
      <PageHeader title={t("branches.title")} subtitle={t("branches.subtitle")} actions={<button className="btn-cyan"><PlusCircle size={16} /> {t("branches.add")}</button>} />
      <div className="card p-3 mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-9" placeholder={t("users.searchPh")} />
        </div>
      </div>
      {filtered.length === 0 ? <EmptyState title={t("branches.empty")} /> : (
        <div className="table-wrap">
          <table className="table">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr><th className="th">{t("branches.col.active")}</th><th className="th">{t("branches.col.name")}</th><th className="th">{t("branches.col.address")}</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.id} className="tr">
                  <td className="td"><Toggle checked={!!r.active} onChange={() => {}} /></td>
                  <td className="td font-semibold">{r.name}</td>
                  <td className="td">{r.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

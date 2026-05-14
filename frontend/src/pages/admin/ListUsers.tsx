import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Toggle from "../../components/ui/Toggle";
import { PlusCircle, Search } from "lucide-react";
import { api } from "../../lib/api";
import { useT } from "../../i18n/LanguageContext";

export default function ListUsers() {
  const t = useT();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [active, setActive] = useState("");

  useEffect(() => { api.get("/users").then((r) => setRows(r.data.data || [])); }, []);

  const filtered = rows.filter((r) => {
    if (search && !(r.name?.includes(search) || r.email?.includes(search))) return false;
    if (role && r.role !== role) return false;
    if (active && String(r.active) !== active) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title={t("users.title")}
        subtitle={t("users.subtitle")}
        actions={<button className="btn-cyan"><PlusCircle size={16} /> {t("users.addNew")}</button>}
      />

      <div className="card p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-9" placeholder={t("users.searchPh")} />
        </div>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">{t("users.allRoles")}</option>
          <option>SUPER_ADMIN</option><option>COMPANY_ADMIN</option><option>DATA_ENTRY</option>
          <option>SUPERVISOR</option><option>COURIER</option><option>CLIENT</option><option>AGENT</option><option>DISTRIBUTOR</option>
        </select>
        <select className="input" value={active} onChange={(e) => setActive(e.target.value)}>
          <option value="">{t("users.allStatuses")}</option>
          <option value="true">{t("users.active")}</option>
          <option value="false">{t("users.suspended")}</option>
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState title={t("users.empty")} /> : (
        <div className="table-wrap">
          <table className="table">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="th">{t("users.col.active")}</th>
                <th className="th">{t("users.col.username")}</th>
                <th className="th">{t("users.col.email")}</th>
                <th className="th">{t("users.col.role")}</th>
                <th className="th">{t("shipments.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.id} className="tr">
                  <td className="td"><Toggle checked={!!r.active} onChange={() => {}} /></td>
                  <td className="td font-semibold">{r.name}</td>
                  <td className="td">{r.email}</td>
                  <td className="td"><span className="badge bg-brand-100 text-brand-800">{r.role}</span></td>
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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Search, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { api } from "../../lib/api";
import { shortDate } from "../../lib/format";
import { useT, useLanguage } from "../../i18n/LanguageContext";
import { localizeProvince } from "../../lib/statuses";
import { useToast } from "../../components/ui/Toast";

type Courier = {
  id: number;
  name: string;
  phone: string;
  workType: string;
  active: boolean;
  provinces: string[];
  createdAt: string;
};

export default function ListDelegates() {
  const t = useT();
  const { lang } = useLanguage();
  const toast = useToast();
  const [rows, setRows] = useState<Courier[]>([]);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() { api.get("/couriers").then((r) => setRows(r.data.data || [])); }
  useEffect(load, []);

  const filtered = rows.filter((r) => !search || r.name.includes(search) || r.phone.includes(search));

  async function confirmDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    try { await api.delete(`/couriers/${deleteId}`); toast.success(t("toast.deleted")); setDeleteId(null); load(); }
    catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setDeleting(false); }
  }

  return (
    <>
      <PageHeader
        title={t("couriers.title")}
        subtitle={t("couriers.subtitle")}
        actions={<Link to="/add-delegates" className="btn-cyan"><PlusCircle size={16} /> {t("couriers.addCourier")}</Link>}
      />

      <div className="card p-3 mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-9" placeholder={t("couriers.searchPh")} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t("couriers.empty.title")} description={t("couriers.empty.desc")} action={<Link to="/add-delegates" className="btn-cyan"><PlusCircle size={16} /> {t("couriers.addCourier")}</Link>} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="th">{t("couriers.col.serial")}</th>
                <th className="th">{t("couriers.col.status")}</th>
                <th className="th">{t("couriers.col.name")}</th>
                <th className="th">{t("couriers.col.workType")}</th>
                <th className="th">{t("couriers.col.regions")}</th>
                <th className="th">{t("couriers.col.phone")}</th>
                <th className="th">{t("couriers.col.created")}</th>
                <th className="th">{t("shipments.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((c, i) => (
                <tr key={c.id} className="tr">
                  <td className="td">{i + 1}</td>
                  <td className="td">
                    <span className={"badge " + (c.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                      {c.active ? t("couriers.status.active") : t("couriers.status.suspended")}
                    </span>
                  </td>
                  <td className="td font-semibold">{c.name}</td>
                  <td className="td">{c.workType}</td>
                  <td className="td">
                    <div className="flex flex-wrap gap-1">
                      {c.provinces.slice(0, 3).map((p) => <span key={p} className="badge bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">{localizeProvince(p, lang)}</span>)}
                      {c.provinces.length > 3 && <span className="text-xs text-slate-500">+{c.provinces.length - 3}</span>}
                    </div>
                  </td>
                  <td className="td font-mono">{c.phone}</td>
                  <td className="td">{shortDate(c.createdAt)}</td>
                  <td className="td">
                    <Link to={`/add-delegates?id=${c.id}`} className="text-brand-700 hover:underline text-sm">{t("btn.edit")}</Link>
                    <span className="mx-1 text-slate-300">|</span>
                    <button onClick={() => setDeleteId(c.id)} className="text-rose-600 hover:underline text-sm inline-flex items-center gap-1"><Trash2 size={14} /> {t("btn.delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("modal.deleteTitle")}
        message={t("modal.deleteMessage")}
        destructive
        busy={deleting}
      />
    </>
  );
}

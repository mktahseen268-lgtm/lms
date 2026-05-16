import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { useT, useLanguage } from "../i18n/LanguageContext";
import { useToast } from "../components/ui/Toast";
import { EG_PROVINCES, EG_PROVINCES_EN, localizeProvince } from "../lib/statuses";

type Distributor = { id: number; partnerCompany: string; provinces: string; status: string };
type Row = { id: number; province: string; distributor: string };

export default function SupplyManagement() {
  const t = useT();
  const { lang } = useLanguage();
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Distributor | null>(null);
  const [form, setForm] = useState<{ partnerCompany: string; provinces: string[]; status: string }>({ partnerCompany: "", provinces: [], status: "active" });
  const [busy, setBusy] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const r = await api.get("/supply");
    setRows(r.data.data || []);
    // also fetch raw distributors for edit
    const rd = await api.get("/network/distributors").catch(() => ({ data: { data: [] } }));
    setDistributors(rd.data.data || []);
  }
  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ partnerCompany: "", provinces: [], status: "active" });
    setEditorOpen(true);
  }
  function openEditFromRow(row: Row) {
    // find the distributor record
    const d = distributors.find((x) => x.partnerCompany === row.distributor);
    if (!d) {
      // create from scratch with this province pre-selected
      setEditing(null);
      setForm({ partnerCompany: row.distributor, provinces: [row.province], status: "active" });
    } else {
      let provs: string[] = [];
      try { provs = JSON.parse(d.provinces || "[]"); } catch {}
      setEditing(d);
      setForm({ partnerCompany: d.partnerCompany, provinces: provs, status: d.status });
    }
    setEditorOpen(true);
  }
  function toggleProvince(p: string) {
    setForm((f) => ({ ...f, provinces: f.provinces.includes(p) ? f.provinces.filter((x) => x !== p) : [...f.provinces, p] }));
  }

  async function save() {
    setBusy(true);
    try {
      if (editing) await api.put(`/supply/${editing.id}`, form);
      else await api.post("/supply", form);
      toast.success(t("toast.saved"));
      setEditorOpen(false);
      load();
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setBusy(false); }
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    try {
      await api.delete(`/supply/${deleteId}`);
      toast.success(t("toast.deleted"));
      setDeleteId(null);
      load();
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setDeleting(false); }
  }

  const provinceLabels = lang === "ar" ? EG_PROVINCES : EG_PROVINCES_EN;

  return (
    <>
      <PageHeader
        title={t("supply.title")}
        subtitle={t("supply.subtitle")}
        actions={<button onClick={openAdd} className="btn-cyan"><PlusCircle size={16} /> {t("btn.add")}</button>}
      />
      {rows.length === 0 ? (
        <EmptyState title={t("supply.empty")} action={<button onClick={openAdd} className="btn-cyan"><PlusCircle size={16} /> {t("btn.add")}</button>} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="th">{t("supply.col.province")}</th>
                <th className="th">{t("supply.col.distributor")}</th>
                <th className="th">{t("shipments.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r, i) => (
                <tr key={`${r.id}-${i}`} className="tr">
                  <td className="td font-semibold">{localizeProvince(r.province, lang)}</td>
                  <td className="td">{r.distributor}</td>
                  <td className="td">
                    <button onClick={() => openEditFromRow(r)} className="text-brand-700 hover:underline text-sm">{t("btn.edit")}</button>
                    <span className="mx-1 text-slate-300">|</span>
                    <button onClick={() => setDeleteId(r.id)} className="text-rose-600 hover:underline text-sm inline-flex items-center gap-1"><Trash2 size={14} /> {t("btn.delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? t("btn.edit") : t("btn.add")}
        size="lg"
        footer={
          <>
            <button onClick={() => setEditorOpen(false)} className="btn-outline">{t("btn.cancel")}</button>
            <button disabled={busy || !form.partnerCompany || !form.provinces.length} onClick={save} className="btn-primary">{busy ? "..." : t("btn.save")}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">{t("supply.col.distributor")} *</label>
            <input className="input" value={form.partnerCompany} onChange={(e) => setForm({ ...form, partnerCompany: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("supply.col.province")} *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 max-h-64 overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-lg">
              {EG_PROVINCES.map((p, i) => (
                <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.provinces.includes(p)} onChange={() => toggleProvince(p)} />
                  <span>{provinceLabels[i]}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">{t("shipments.col.status")}</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">{t("users.active")}</option>
              <option value="pending">{t("distReq.col.status")}</option>
              <option value="suspended">{t("users.suspended")}</option>
            </select>
          </div>
        </div>
      </Modal>

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

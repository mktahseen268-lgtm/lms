import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Toggle from "../../components/ui/Toggle";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { PlusCircle, Search, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { useT } from "../../i18n/LanguageContext";
import { useToast } from "../../components/ui/Toast";

type Branch = { id: number; name: string; address: string | null; active: boolean };

export default function ListBranches() {
  const t = useT();
  const toast = useToast();
  const [rows, setRows] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: "", address: "", active: true });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    api.get("/branches").then((r) => setRows(r.data.data || []));
  }
  useEffect(load, []);

  const filtered = rows.filter((r) => !search || r.name?.includes(search) || (r.address || "").includes(search));

  function openAdd() {
    setEditing(null);
    setForm({ name: "", address: "", active: true });
    setErr(null);
    setEditorOpen(true);
  }
  function openEdit(b: Branch) {
    setEditing(b);
    setForm({ name: b.name, address: b.address || "", active: b.active });
    setErr(null);
    setEditorOpen(true);
  }

  async function save() {
    setBusy(true); setErr(null);
    try {
      if (editing) await api.put(`/branches/${editing.id}`, form);
      else await api.post("/branches", form);
      setEditorOpen(false);
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "خطأ");
    } finally { setBusy(false); }
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    try {
      await api.delete(`/branches/${deleteId}`);
      toast.success(t("toast.deleted"));
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || t("toast.error"));
    } finally { setDeleting(false); }
  }

  async function toggleActive(b: Branch) {
    await api.put(`/branches/${b.id}`, { active: !b.active });
    load();
  }

  return (
    <>
      <PageHeader
        title={t("branches.title")}
        subtitle={t("branches.subtitle")}
        actions={<button onClick={openAdd} className="btn-cyan"><PlusCircle size={16} /> {t("branches.add")}</button>}
      />
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
              <tr>
                <th className="th">{t("branches.col.active")}</th>
                <th className="th">{t("branches.col.name")}</th>
                <th className="th">{t("branches.col.address")}</th>
                <th className="th">{t("shipments.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => (
                <tr key={r.id} className="tr">
                  <td className="td"><Toggle checked={r.active} onChange={() => toggleActive(r)} /></td>
                  <td className="td font-semibold">{r.name}</td>
                  <td className="td">{r.address}</td>
                  <td className="td">
                    <button onClick={() => openEdit(r)} className="text-brand-700 hover:underline text-sm">{t("btn.edit")}</button>
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
        title={editing ? t("modal.editBranch") : t("modal.addBranch")}
        footer={
          <>
            <button onClick={() => setEditorOpen(false)} className="btn-outline">{t("btn.cancel")}</button>
            <button disabled={busy || !form.name} onClick={save} className="btn-primary">{busy ? "..." : t("btn.save")}</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">{t("branches.col.name")} *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("branches.col.address")}</label>
            <textarea className="input min-h-[80px]" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label={t("users.active")} />
          {err && <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/30 rounded-lg p-2">{err}</div>}
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

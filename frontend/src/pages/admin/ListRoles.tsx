import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { PlusCircle, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { useT } from "../../i18n/LanguageContext";
import { useToast } from "../../components/ui/Toast";

type Role = { id: number; name: string; permissions: string };

const PERMISSIONS = [
  "shipments.read", "shipments.write", "shipments.delete",
  "couriers.read", "couriers.write", "couriers.delete",
  "clients.read", "clients.write",
  "accounts.read", "accounts.write",
  "pricing.read", "pricing.write",
  "users.read", "users.write", "users.delete",
  "reports.read", "reports.export",
];

export default function ListRoles() {
  const t = useT();
  const toast = useToast();
  const [rows, setRows] = useState<Role[]>([]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<{ name: string; permissions: string[] }>({ name: "", permissions: [] });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() { api.get("/roles").then((r) => setRows(r.data.data || [])); }
  useEffect(load, []);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", permissions: [] });
    setErr(null);
    setEditorOpen(true);
  }
  function openEdit(r: Role) {
    setEditing(r);
    let perms: string[] = [];
    try { perms = JSON.parse(r.permissions || "[]"); } catch {}
    setForm({ name: r.name, permissions: perms });
    setErr(null);
    setEditorOpen(true);
  }
  function togglePerm(p: string) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(p) ? f.permissions.filter((x) => x !== p) : [...f.permissions, p],
    }));
  }

  async function save() {
    setBusy(true); setErr(null);
    try {
      if (editing) await api.put(`/roles/${editing.id}`, form);
      else await api.post("/roles", form);
      setEditorOpen(false);
      load();
    } catch (e: any) {
      setErr(e?.response?.data?.error || "خطأ");
    } finally { setBusy(false); }
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    setDeleting(true);
    try { await api.delete(`/roles/${deleteId}`); toast.success(t("toast.deleted")); setDeleteId(null); load(); }
    catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setDeleting(false); }
  }

  return (
    <>
      <PageHeader
        title={t("roles.title")}
        subtitle={t("roles.subtitle")}
        actions={<button onClick={openAdd} className="btn-cyan"><PlusCircle size={16} /> {t("roles.add")}</button>}
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

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? t("modal.editRole") : t("modal.addRole")}
        size="lg"
        footer={
          <>
            <button onClick={() => setEditorOpen(false)} className="btn-outline">{t("btn.cancel")}</button>
            <button disabled={busy || !form.name} onClick={save} className="btn-primary">{busy ? "..." : t("btn.save")}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">{t("roles.col.name")} *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Permissions</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-lg">
              {PERMISSIONS.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.permissions.includes(p)} onChange={() => togglePerm(p)} />
                  <span className="font-mono text-xs">{p}</span>
                </label>
              ))}
            </div>
          </div>
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

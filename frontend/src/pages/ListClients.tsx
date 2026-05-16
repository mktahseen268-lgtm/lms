import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Toggle from "../components/ui/Toggle";
import { PlusCircle, Search, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { useT } from "../i18n/LanguageContext";
import { useToast } from "../components/ui/Toast";

type Client = {
  id: number; name: string; email: string | null; phone: string | null;
  city: string | null; integrationCode: string | null; active: boolean;
};

export default function ListClients() {
  const t = useT();
  const toast = useToast();
  const [rows, setRows] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", integrationCode: "", active: true });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() { api.get("/clients").then((r) => setRows(r.data.data || [])); }
  useEffect(load, []);

  const filtered = rows.filter((r) => !search || r.name?.includes(search) || (r.email || "").includes(search) || (r.phone || "").includes(search));

  function openAdd() {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", city: "", integrationCode: "", active: true });
    setErr(null);
    setEditorOpen(true);
  }
  function openEdit(c: Client) {
    setEditing(c);
    setForm({
      name: c.name, email: c.email || "", phone: c.phone || "",
      city: c.city || "", integrationCode: c.integrationCode || "", active: c.active,
    });
    setErr(null);
    setEditorOpen(true);
  }

  async function save() {
    setBusy(true); setErr(null);
    try {
      if (editing) await api.put(`/clients/${editing.id}`, form);
      else await api.post("/clients", form);
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
      await api.delete(`/clients/${deleteId}`);
      toast.success(t("toast.deleted"));
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || t("toast.error"));
    } finally { setDeleting(false); }
  }

  return (
    <>
      <PageHeader
        title={t("clients.title")}
        subtitle={t("clients.subtitle")}
        actions={<button onClick={openAdd} className="btn-cyan"><PlusCircle size={16} /> {t("clients.add")}</button>}
      />
      <div className="card p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-9" placeholder={t("users.searchPh")} />
        </div>
        <select className="input"><option value="">{t("clients.seller")}</option></select>
        <select className="input"><option value="">{t("clients.contains")}</option><option>{t("clients.containsIntegration")}</option><option>{t("clients.containsContract")}</option></select>
      </div>

      {filtered.length === 0 ? <EmptyState title={t("clients.empty")} action={<button onClick={openAdd} className="btn-cyan"><PlusCircle size={16} /> {t("clients.add")}</button>} /> : (
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
        title={editing ? t("modal.editClient") : t("modal.addClient")}
        size="lg"
        footer={
          <>
            <button onClick={() => setEditorOpen(false)} className="btn-outline">{t("btn.cancel")}</button>
            <button disabled={busy || !form.name} onClick={save} className="btn-primary">{busy ? "..." : t("btn.save")}</button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="label">{t("clients.col.name")} *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("clients.col.email")}</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("clients.col.phone")}</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("clients.col.city")}</label>
            <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("clients.col.integration")}</label>
            <input className="input font-mono" value={form.integrationCode} onChange={(e) => setForm({ ...form, integrationCode: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label={t("users.active")} />
          </div>
          {err && <div className="md:col-span-2 text-sm text-rose-600 bg-rose-50 dark:bg-rose-900/30 rounded-lg p-2">{err}</div>}
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

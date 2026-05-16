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

type UserRow = {
  id: number; name: string; email: string; phone?: string | null;
  role: string; active: boolean;
};

const ROLES = ["SUPER_ADMIN", "COMPANY_ADMIN", "DATA_ENTRY", "SUPERVISOR", "COURIER", "CLIENT", "AGENT", "DISTRIBUTOR"];

export default function ListUsers() {
  const t = useT();
  const toast = useToast();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "DATA_ENTRY", password: "", active: true });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() { api.get("/users").then((r) => setRows(r.data.data || [])); }
  useEffect(load, []);

  const filtered = rows.filter((r) => {
    if (search && !(r.name?.includes(search) || r.email?.includes(search))) return false;
    if (roleFilter && r.role !== roleFilter) return false;
    if (activeFilter && String(r.active) !== activeFilter) return false;
    return true;
  });

  function openAdd() {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", role: "DATA_ENTRY", password: "", active: true });
    setErr(null);
    setEditorOpen(true);
  }
  function openEdit(u: UserRow) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || "", role: u.role, password: "", active: u.active });
    setErr(null);
    setEditorOpen(true);
  }

  async function save() {
    setBusy(true); setErr(null);
    try {
      const payload: any = { ...form };
      if (editing && !payload.password) delete payload.password;
      if (editing) await api.put(`/users/${editing.id}`, payload);
      else await api.post("/users", payload);
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
      await api.delete(`/users/${deleteId}`);
      toast.success(t("toast.deleted"));
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || t("toast.error"));
    } finally { setDeleting(false); }
  }

  async function toggleActive(u: UserRow) {
    await api.put(`/users/${u.id}`, { active: !u.active });
    load();
  }

  return (
    <>
      <PageHeader
        title={t("users.title")}
        subtitle={t("users.subtitle")}
        actions={<button onClick={openAdd} className="btn-cyan"><PlusCircle size={16} /> {t("users.addNew")}</button>}
      />

      <div className="card p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-9" placeholder={t("users.searchPh")} />
        </div>
        <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">{t("users.allRoles")}</option>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select className="input" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
          <option value="">{t("users.allStatuses")}</option>
          <option value="true">{t("users.active")}</option>
          <option value="false">{t("users.suspended")}</option>
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState title={t("users.empty")} action={<button onClick={openAdd} className="btn-cyan"><PlusCircle size={16} /> {t("users.addNew")}</button>} /> : (
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
                  <td className="td"><Toggle checked={!!r.active} onChange={() => toggleActive(r)} /></td>
                  <td className="td font-semibold">{r.name}</td>
                  <td className="td">{r.email}</td>
                  <td className="td"><span className="badge bg-brand-100 text-brand-800">{r.role}</span></td>
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
        title={editing ? t("modal.editUser") : t("modal.addUser")}
        size="lg"
        footer={
          <>
            <button onClick={() => setEditorOpen(false)} className="btn-outline">{t("btn.cancel")}</button>
            <button disabled={busy || !form.name || !form.email || (!editing && !form.password)} onClick={save} className="btn-primary">{busy ? "..." : t("btn.save")}</button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">{t("users.col.username")} *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("users.col.email")} *</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("courier.add.phone")}</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">{t("users.col.role")} *</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">{t("auth.password")} {!editing && "*"}</label>
            <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? t("modal.passwordLeaveBlank") : ""} />
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

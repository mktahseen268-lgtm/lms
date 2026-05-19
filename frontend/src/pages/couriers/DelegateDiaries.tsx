import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { PlusCircle, Search, BookOpenCheck, X } from "lucide-react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { useT } from "../../i18n/LanguageContext";
import { useToast } from "../../components/ui/Toast";

export default function DelegateDiaries() {
  const t = useT();
  const toast = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [couriers, setCouriers] = useState<any[]>([]);
  const [openOpen, setOpenOpen] = useState(false);
  const [pickedCourier, setPickedCourier] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const [closeId, setCloseId] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);

  function load() {
    api.get("/couriers/diaries").then((r) => setRows(r.data.data || [])).catch(() => {});
  }

  useEffect(() => {
    load();
    api.get("/couriers").then((r) => setCouriers(r.data.data || []));
  }, []);

  async function openDiary() {
    if (!pickedCourier) return toast.error(t("toast.selectCourier"));
    setBusy(true);
    try {
      await api.post("/couriers/diaries/open", { courierId: pickedCourier });
      toast.success(t("toast.saved"));
      setOpenOpen(false); setPickedCourier(""); load();
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setBusy(false); }
  }

  async function closeDiary() {
    if (closeId == null) return;
    setClosing(true);
    try {
      await api.post(`/couriers/diaries/${closeId}/close`);
      toast.success(t("toast.updated"));
      setCloseId(null); load();
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setClosing(false); }
  }

  const filtered = rows.filter((r) => !search || r.courier?.name?.includes(search) || r.courier?.phone?.includes(search));

  return (
    <>
      <PageHeader
        title={t("diaries.title")}
        subtitle={t("diaries.subtitle")}
        actions={<button onClick={() => setOpenOpen(true)} className="btn-cyan"><PlusCircle size={16} /> {t("diaries.open")}</button>}
      />
      <div className="card p-3 mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input ps-9" placeholder={t("users.searchPh")} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<BookOpenCheck size={28} />} title={t("diaries.empty")} description={t("diaries.emptyDesc")} action={<button onClick={() => setOpenOpen(true)} className="btn-cyan"><PlusCircle size={16} /> {t("diaries.open")}</button>} />
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
              {filtered.map((r, i) => (
                <tr key={r.id} className="tr">
                  <td className="td">{i + 1}</td>
                  <td className="td">{r.courier?.name}</td>
                  <td className="td">{r.courier?.phone}</td>
                  <td className="td">{formatDate(r.openedAt)}</td>
                  <td className="td">{r.closedAt ? formatDate(r.closedAt) : "—"}</td>
                  <td className="td"><span className={"badge " + (r.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700")}>{r.status === "open" ? t("diaries.open.status") : t("diaries.closed.status")}</span></td>
                  <td className="td">
                    {r.status === "open" && (
                      <button onClick={() => setCloseId(r.id)} className="text-rose-600 hover:underline text-sm inline-flex items-center gap-1"><X size={14} /> {t("diaries.closed.status")}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={openOpen}
        onClose={() => setOpenOpen(false)}
        title={t("diaries.open")}
        footer={
          <>
            <button onClick={() => setOpenOpen(false)} className="btn-outline">{t("btn.cancel")}</button>
            <button disabled={busy || !pickedCourier} onClick={openDiary} className="btn-primary">{busy ? "..." : t("btn.confirm")}</button>
          </>
        }
      >
        <label className="label">{t("ops.chooseCourier")}</label>
        <select className="input" value={pickedCourier} onChange={(e) => setPickedCourier(Number(e.target.value) || "")}>
          <option value="">{t("ops.chooseCourier")}</option>
          {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Modal>

      <ConfirmDialog
        open={closeId !== null}
        onCancel={() => setCloseId(null)}
        onConfirm={closeDiary}
        title={t("diaries.closed.status")}
        message={t("modal.deleteMessage")}
        busy={closing}
      />
    </>
  );
}

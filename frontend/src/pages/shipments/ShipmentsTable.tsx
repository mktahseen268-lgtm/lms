import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Zap, ChevronDown } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/Toast";
import { SHIPMENT_STATUSES, EG_PROVINCES, EG_PROVINCES_EN, statusBadge, localizeStatus, localizeProvince } from "../../lib/statuses";
import { api } from "../../lib/api";
import { currency } from "../../lib/format";
import { useT, useLanguage } from "../../i18n/LanguageContext";
import ShipmentDetailModal from "./ShipmentDetailModal";

export type Shipment = {
  id: number;
  number: string;
  type: string;
  status: string;
  senderName: string;
  customerName: string;
  customerPhone?: string;
  province: string;
  city?: string;
  cod: number;
  courier?: { id: number; name: string } | null;
  createdAt: string;
};

type Props = {
  titleKey: string;
  subtitleKey?: string;
  scope: "all" | "progress" | "return";
  showQuickFilters?: boolean;
  showBulkActions?: boolean;
};

type QuickFilter = "pending" | "problems" | "delivered" | null;

const QF_TO_STATUSES: Record<Exclude<QuickFilter, null>, string[]> = {
  pending: ["فى انتظار التنفيذ"],
  problems: ["مشكلة تسليم", "ملغيه", "رفض و رفض دفع تكلفة", "رفض و دفع تكلفة"],
  delivered: ["تسليم ناجح"],
};

export default function ShipmentsTable({ titleKey, subtitleKey, scope, showQuickFilters = true, showBulkActions = true }: Props) {
  const t = useT();
  const { lang } = useLanguage();
  const toast = useToast();
  const [rows, setRows] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(30);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [bulkOpen, setBulkOpen] = useState(false);
  const [viewId, setViewId] = useState<number | null>(null);

  // Bulk action modals
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkCancelOpen, setBulkCancelOpen] = useState(false);
  const [bulkAssignCourier, setBulkAssignCourier] = useState<number | "">("");
  const [bulkNewStatus, setBulkNewStatus] = useState("");
  const [couriers, setCouriers] = useState<{ id: number; name: string }[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k));

  const BULK_ACTIONS = [
    { key: "assignCourier", label: t("shipments.bulk.assignCourier"), action: () => { closeBulkMenu(); setBulkAssignOpen(true); } },
    { key: "changeStatus", label: t("shipments.bulk.changeStatus"), action: () => { closeBulkMenu(); setBulkStatusOpen(true); } },
    { key: "printLabels", label: t("shipments.bulk.printLabels"), action: () => { closeBulkMenu(); printSelected(); } },
    { key: "exportSelected", label: t("shipments.bulk.exportSelected"), action: () => { closeBulkMenu(); exportSelected(); } },
    { key: "cancelSelected", label: t("shipments.bulk.cancelSelected"), action: () => { closeBulkMenu(); setBulkCancelOpen(true); } },
  ];

  function closeBulkMenu() { setBulkOpen(false); }

  function load() {
    setLoading(true);
    const effStatuses = quickFilter ? QF_TO_STATUSES[quickFilter] : statuses;
    api
      .get("/shipments", {
        params: {
          scope, page, per_page: perPage,
          search: search || undefined,
          from: from || undefined,
          to: to || undefined,
          provinces: provinces.length ? provinces.join(",") : undefined,
          statuses: effStatuses.length ? effStatuses.join(",") : undefined,
        },
      })
      .then((r) => {
        setRows(r.data.data);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [scope, page, perPage, quickFilter]);

  // Load couriers for the assign modal once
  useEffect(() => {
    api.get("/couriers").then((r) => setCouriers(r.data.data || [])).catch(() => {});
  }, []);

  // Handle ?q= from top search
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) { setSearch(q); setPage(1); setTimeout(load, 0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allSelected = rows.length > 0 && rows.every((r) => selected[r.id]);
  function toggleAll(v: boolean) {
    if (v) {
      const next: Record<number, boolean> = { ...selected };
      rows.forEach((r) => { next[r.id] = true; });
      setSelected(next);
    } else {
      const next: Record<number, boolean> = { ...selected };
      rows.forEach((r) => { delete next[r.id]; });
      setSelected(next);
    }
  }

  function clearSelection() { setSelected({}); }

  async function runBulkAssign() {
    if (!selectedIds.length) return toast.error(t("toast.selectAtLeastOne"));
    if (!bulkAssignCourier) return toast.error(t("toast.selectCourier"));
    setBulkBusy(true);
    try {
      await api.post("/shipments/bulk", { action: "assignCourier", ids: selectedIds, courierId: bulkAssignCourier });
      toast.success(t("toast.assigned"));
      setBulkAssignOpen(false); setBulkAssignCourier(""); clearSelection(); load();
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setBulkBusy(false); }
  }
  async function runBulkStatus() {
    if (!selectedIds.length) return toast.error(t("toast.selectAtLeastOne"));
    if (!bulkNewStatus) return;
    setBulkBusy(true);
    try {
      await api.post("/shipments/bulk", { action: "status", ids: selectedIds, status: bulkNewStatus });
      toast.success(t("toast.updated"));
      setBulkStatusOpen(false); setBulkNewStatus(""); clearSelection(); load();
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setBulkBusy(false); }
  }
  async function runBulkCancel() {
    if (!selectedIds.length) return toast.error(t("toast.selectAtLeastOne"));
    setBulkBusy(true);
    try {
      await api.post("/shipments/bulk", { action: "cancel", ids: selectedIds });
      toast.success(t("toast.updated"));
      setBulkCancelOpen(false); clearSelection(); load();
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setBulkBusy(false); }
  }
  function printSelected() {
    if (!selectedIds.length) return toast.error(t("toast.selectAtLeastOne"));
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const items = rows.filter((r) => selected[r.id]);
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>Labels</title>
<style>body{font-family:Cairo,Tahoma;padding:0;margin:0}.label{padding:16px;page-break-after:always;border-bottom:2px dashed #000}.barcode{text-align:center;font-family:monospace;font-size:24px;letter-spacing:6px;margin:8px 0;padding:8px;border:2px solid #000}.row{display:flex;justify-content:space-between;padding:3px 0;font-size:12px;border-bottom:1px dashed #ccc}</style>
</head><body>
${items.map((s) => `
<div class="label">
  <h2 style="margin:0">Dalilee Logico</h2>
  <div class="barcode">*${s.number}*</div>
  <div class="row"><b>المرسل:</b><span>${s.senderName || ""}</span></div>
  <div class="row"><b>العميل:</b><span>${s.customerName}</span></div>
  <div class="row"><b>الهاتف:</b><span>${s.customerPhone || ""}</span></div>
  <div class="row"><b>المحافظة:</b><span>${s.province}${s.city ? " · " + s.city : ""}</span></div>
  <div class="row"><b>COD:</b><span><b>${s.cod} EGP</b></span></div>
  <div class="row"><b>الحالة:</b><span>${s.status}</span></div>
</div>`).join("")}
<script>window.print();</script>
</body></html>`);
    w.document.close();
  }
  function exportSelected() {
    if (!selectedIds.length) return toast.error(t("toast.selectAtLeastOne"));
    const items = rows.filter((r) => selected[r.id]);
    const headers = ["number","type","status","sender","customer","phone","province","city","cod","createdAt"];
    const csv = [headers.join(","), ...items.map((s) => [
      s.number, s.type, s.status, s.senderName, s.customerName, s.customerPhone || "",
      s.province, s.city || "", s.cod, s.createdAt
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `shipments-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  const counts = {
    pending: rows.filter((r) => r.status === "فى انتظار التنفيذ").length,
    delivering: rows.filter((r) => r.status === "تحت تسليم العميل").length,
    delivered: rows.filter((r) => r.status === "تسليم ناجح").length,
  };

  const provinceLabels = lang === "ar" ? EG_PROVINCES : EG_PROVINCES_EN;

  return (
    <>
      <PageHeader
        title={t(titleKey)}
        subtitle={subtitleKey ? t(subtitleKey) : undefined}
        actions={<Link to="/add-shipping-request" className="btn-primary"><PlusCircle size={16} /> {t("dash.addShipment")}</Link>}
      />

      {showQuickFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            onClick={() => { setQuickFilter(quickFilter === "pending" ? null : "pending"); setPage(1); }}
            className={(quickFilter === "pending" ? "btn-primary " : "btn-outline ") + "!py-1.5"}
          >{t("shipments.qf.pending")}</button>
          <button
            onClick={() => { setQuickFilter(quickFilter === "problems" ? null : "problems"); setPage(1); }}
            className={(quickFilter === "problems" ? "btn-primary " : "btn-outline ") + "!py-1.5"}
          >{t("shipments.qf.problems")}</button>
          <button
            onClick={() => { setQuickFilter(quickFilter === "delivered" ? null : "delivered"); setPage(1); }}
            className={(quickFilter === "delivered" ? "btn-primary " : "btn-outline ") + "!py-1.5"}
          >{t("shipments.qf.delivered")}</button>
          {quickFilter && (
            <button onClick={() => { setQuickFilter(null); setPage(1); }} className="text-xs text-rose-600 hover:underline ms-2">
              ×
            </button>
          )}
        </div>
      )}

      <div className="card p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <input className="input md:col-span-2" placeholder={t("shipments.search")} value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())} />
          <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <MultiSelect placeholder={t("shipments.chooseProvinces")} options={EG_PROVINCES} labels={provinceLabels} value={provinces} onChange={setProvinces} selectedLabel={t("shipments.selected")} />
          <MultiSelect placeholder={t("shipments.chooseStatuses")} options={SHIPMENT_STATUSES.filter((s) => s !== "كل الحالات")} labels={SHIPMENT_STATUSES.filter((s) => s !== "كل الحالات").map((s) => localizeStatus(s, lang))} value={statuses} onChange={setStatuses} selectedLabel={t("shipments.selected")} />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button onClick={() => { setPage(1); load(); }} className="btn-primary !py-1.5">{t("btn.apply")}</button>
          {showBulkActions && (
            <div className="relative">
              <button onClick={() => setBulkOpen((o) => !o)} className="btn-outline">
                {t("shipments.bulkActions")} {selectedIds.length > 0 && `(${selectedIds.length})`} <ChevronDown size={14} />
              </button>
              {bulkOpen && (
                <div className="absolute top-full mt-1 end-0 card p-1.5 w-52 z-10">
                  {BULK_ACTIONS.map((a) => (
                    <button key={a.key} onClick={a.action} className="w-full text-start px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">{a.label}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card p-3 mb-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <Stat label={t("shipments.stat.pending")} value={counts.pending} color="amber" />
        <Stat label={t("shipments.stat.delivering")} value={counts.delivering} color="sky" />
        <Stat label={t("shipments.stat.delivered")} value={counts.delivered} color="emerald" />
        <Stat label={t("shipments.stat.total")} value={total} color="brand" />
      </div>

      {!loading && rows.length === 0 ? (
        <EmptyState
          icon={<Zap size={28} />}
          title={t("shipments.empty.title")}
          description={t("shipments.empty.desc")}
          action={<Link to="/add-shipping-request" className="btn-primary"><PlusCircle size={16} /> {t("dash.addShipment")}</Link>}
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="th w-10"><input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} /></th>
                <th className="th">{t("shipments.col.type")}</th>
                <th className="th">{t("shipments.col.number")}</th>
                <th className="th">{t("shipments.col.sender")}</th>
                <th className="th">{t("shipments.col.courier")}</th>
                <th className="th">{t("shipments.col.customer")}</th>
                <th className="th">{t("shipments.col.cod")}</th>
                <th className="th">{t("shipments.col.location")}</th>
                <th className="th">{t("shipments.col.status")}</th>
                <th className="th">{t("shipments.col.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((s) => (
                <tr key={s.id} className="tr">
                  <td className="td">
                    <input type="checkbox" checked={!!selected[s.id]} onChange={(e) => setSelected({ ...selected, [s.id]: e.target.checked })} />
                  </td>
                  <td className="td"><span className="badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{s.type}</span></td>
                  <td className="td font-bold text-brand-800 dark:text-brand-300">{s.number}</td>
                  <td className="td">{s.senderName}</td>
                  <td className="td">{s.courier?.name || <span className="text-slate-400">—</span>}</td>
                  <td className="td">
                    <div>{s.customerName}</div>
                    <div className="text-xs text-slate-500">{s.customerPhone}</div>
                  </td>
                  <td className="td font-semibold">{currency(s.cod)}</td>
                  <td className="td">{localizeProvince(s.province, lang)}{s.city ? ` · ${s.city}` : ""}</td>
                  <td className="td"><span className={"badge " + statusBadge(s.status)}>{localizeStatus(s.status, lang)}</span></td>
                  <td className="td">
                    <button onClick={() => setViewId(s.id)} className="text-brand-700 hover:underline text-sm">{t("btn.view")}</button>
                    <span className="mx-1 text-slate-300">|</span>
                    <button onClick={() => printOne(s)} className="text-slate-500 hover:underline text-sm">{t("btn.print")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} perPage={perPage} total={total} onPage={setPage} onPerPage={setPerPage} />
        </div>
      )}

      <ShipmentDetailModal shipmentId={viewId} onClose={() => setViewId(null)} onChanged={load} />

      {/* Bulk Assign Courier */}
      <Modal
        open={bulkAssignOpen}
        onClose={() => setBulkAssignOpen(false)}
        title={t("shipments.bulk.assignCourier")}
        footer={
          <>
            <button onClick={() => setBulkAssignOpen(false)} className="btn-outline">{t("btn.cancel")}</button>
            <button disabled={bulkBusy || !bulkAssignCourier} onClick={runBulkAssign} className="btn-primary">{bulkBusy ? "..." : t("btn.confirm")}</button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-slate-500">{selectedIds.length} {t("shipments.selected")}</div>
          <select className="input" value={bulkAssignCourier} onChange={(e) => setBulkAssignCourier(Number(e.target.value) || "")}>
            <option value="">{t("ops.chooseCourier")}</option>
            {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Modal>

      {/* Bulk Change Status */}
      <Modal
        open={bulkStatusOpen}
        onClose={() => setBulkStatusOpen(false)}
        title={t("shipments.bulk.changeStatus")}
        footer={
          <>
            <button onClick={() => setBulkStatusOpen(false)} className="btn-outline">{t("btn.cancel")}</button>
            <button disabled={bulkBusy || !bulkNewStatus} onClick={runBulkStatus} className="btn-primary">{bulkBusy ? "..." : t("btn.confirm")}</button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-sm text-slate-500">{selectedIds.length} {t("shipments.selected")}</div>
          <select className="input" value={bulkNewStatus} onChange={(e) => setBulkNewStatus(e.target.value)}>
            <option value="">{t("reports.choose")}</option>
            {SHIPMENT_STATUSES.filter((s) => s !== "كل الحالات").map((s) => (
              <option key={s} value={s}>{localizeStatus(s, lang)}</option>
            ))}
          </select>
        </div>
      </Modal>

      <ConfirmDialog
        open={bulkCancelOpen}
        onCancel={() => setBulkCancelOpen(false)}
        onConfirm={runBulkCancel}
        title={t("shipments.bulk.cancelSelected")}
        message={t("modal.deleteMessage")}
        destructive
        busy={bulkBusy}
      />
    </>
  );

  function printOne(s: Shipment) {
    const w = window.open("", "_blank", "width=420,height=600");
    if (!w) return;
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${s.number}</title>
<style>body{font-family:Cairo,Tahoma;padding:16px}.barcode{text-align:center;font-family:monospace;font-size:22px;letter-spacing:6px;margin:12px 0;padding:8px;border:2px solid #000}.row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #ccc;font-size:12px}</style>
</head><body>
<h2 style="margin:0">Dalilee Logico</h2>
<div class="barcode">*${s.number}*</div>
<div class="row"><b>المرسل:</b><span>${s.senderName || ""}</span></div>
<div class="row"><b>العميل:</b><span>${s.customerName}</span></div>
<div class="row"><b>الهاتف:</b><span>${s.customerPhone || ""}</span></div>
<div class="row"><b>المحافظة:</b><span>${s.province}${s.city ? " · " + s.city : ""}</span></div>
<div class="row"><b>COD:</b><span><b>${s.cod} EGP</b></span></div>
<script>window.print();</script>
</body></html>`);
    w.document.close();
  }
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  const map: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300",
    sky: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
    brand: "bg-brand-50 text-brand-800 border-brand-200 dark:bg-brand-900/20 dark:text-brand-300",
  };
  return (
    <div className={`rounded-lg border px-3 py-2 flex items-center justify-between ${map[color]}`}>
      <span className="font-medium">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}

function MultiSelect({
  placeholder, options, labels, value, onChange, selectedLabel,
}: {
  placeholder: string;
  options: string[];
  labels?: string[];
  value: string[];
  onChange: (v: string[]) => void;
  selectedLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="input flex items-center justify-between text-start">
        <span className={value.length ? "" : "text-slate-400"}>
          {value.length ? `${value.length} ${selectedLabel}` : placeholder}
        </span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto card p-1.5">
          {options.map((o, i) => {
            const sel = value.includes(o);
            return (
              <label key={o} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer text-sm">
                <input type="checkbox" checked={sel} onChange={() => onChange(sel ? value.filter((x) => x !== o) : [...value, o])} />
                <span>{labels?.[i] || o}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

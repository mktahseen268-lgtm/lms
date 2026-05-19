import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { Search, Send, FileSpreadsheet } from "lucide-react";
import { useT, useLanguage } from "../../i18n/LanguageContext";
import { api } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import { currency } from "../../lib/format";
import { localizeStatus } from "../../lib/statuses";

type Mode = "deliver" | "receive";
type Props = {
  title: string;
  subtitle?: string;
  showBranchSelector?: boolean;
  primaryLabel: string;
  showExportToExcel?: boolean;
  mode: Mode;
};

type Row = {
  number: string; found: boolean; shipmentId?: number;
  sender?: string; customer?: string; phone?: string;
  cod?: number; province?: string; city?: string; status?: string;
};

export default function ScanShipmentsView({ title, subtitle, showBranchSelector, primaryLabel, showExportToExcel, mode }: Props) {
  const t = useT();
  const { lang } = useLanguage();
  const toast = useToast();
  const [text, setText] = useState("");
  const [branchId, setBranchId] = useState<number | "">("");
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (showBranchSelector) api.get("/branches").then((r) => setBranches(r.data.data || []));
  }, [showBranchSelector]);

  async function check() {
    const numbers = text.split(/\s+/).map((x) => x.trim()).filter(Boolean);
    if (!numbers.length) return toast.error(t("toast.invalidNumbers"));
    setBusy(true);
    try {
      const r = await api.post("/shipments/check", { numbers });
      const foundSet = new Set(r.data.found.map((f: any) => f.number));
      // Fetch each found in detail (single search per number could be slow; do batch via /shipments search)
      const det = await api.get("/shipments", { params: { scope: "all", per_page: numbers.length, search: numbers.join(" ") } });
      const byNum = new Map<string, any>(det.data.data.map((s: any) => [s.number, s]));
      const newRows: Row[] = numbers.map((n) => {
        if (!foundSet.has(n)) return { number: n, found: false };
        const s = byNum.get(n);
        return s
          ? { number: n, found: true, shipmentId: s.id, sender: s.senderName, customer: s.customerName, phone: s.customerPhone, cod: s.cod, province: s.province, city: s.city, status: s.status }
          : { number: n, found: true };
      });
      setRows(newRows);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || t("toast.error"));
    } finally { setBusy(false); }
  }

  async function send() {
    const valid = rows.filter((r) => r.found);
    if (!valid.length) return toast.error(t("toast.invalidNumbers"));
    if (mode === "deliver" && showBranchSelector && !branchId) return toast.error(t("toast.selectBranch"));
    setBusy(true);
    try {
      const path = mode === "deliver" ? "/operations/deliver-to-branch" : "/operations/receive-from-branch";
      await api.post(path, {
        branchId: branchId || undefined,
        shipmentNumbers: valid.map((r) => r.number),
      });
      toast.success(t("toast.sent"));
      setRows([]); setText("");
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setBusy(false); }
  }

  function exportCsv() {
    if (!rows.length) return toast.error(t("toast.invalidNumbers"));
    const csv = ["number,sender,customer,phone,province,cod,status",
      ...rows.map((r) => [r.number, r.sender, r.customer, r.phone, r.province, r.cod, r.status].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `scan-${mode}-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="card p-4 mb-4 space-y-3">
        {showBranchSelector && (
          <div>
            <label className="label">{t("scan.chooseBranch")}</label>
            <select className="input md:w-80" value={branchId} onChange={(e) => setBranchId(Number(e.target.value) || "")}>
              <option value="">{t("scan.chooseAction")}</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label">{t("scan.numbers")}</label>
          <textarea className="input min-h-[140px] font-mono" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("scan.numbersPh")} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={check} disabled={busy} className="btn-outline"><Search size={16} /> {t("scan.check")}</button>
          <button onClick={send} disabled={busy || rows.filter((r) => r.found).length === 0} className="btn-primary"><Send size={16} /> {busy ? "..." : primaryLabel}</button>
          {showExportToExcel && <button onClick={exportCsv} disabled={!rows.length} className="btn-success"><FileSpreadsheet size={16} /> {t("btn.exportExcel")}</button>}
          <span className="text-sm text-slate-500">{t("rts.allShipments")} ({rows.length})</span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th">{t("follow.col.shipment")}</th>
              <th className="th">{t("follow.col.sender")}</th>
              <th className="th">{t("follow.col.recipient")}</th>
              <th className="th">{t("follow.col.recipientPhone")}</th>
              <th className="th">{t("courier.add.province")}</th>
              <th className="th">{t("follow.col.cod")}</th>
              <th className="th">{t("shipments.col.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="td text-center text-slate-400 py-8">{t("scan.empty")}</td></tr>
            ) : rows.map((r) => (
              <tr key={r.number} className={r.found ? "tr" : "bg-rose-50/40 dark:bg-rose-900/10"}>
                <td className="td font-mono font-bold">{r.number}</td>
                <td className="td">{r.sender || "—"}</td>
                <td className="td">{r.customer || "—"}</td>
                <td className="td">{r.phone || "—"}</td>
                <td className="td">{r.province || "—"}</td>
                <td className="td">{r.cod != null ? currency(r.cod) : "—"}</td>
                <td className="td">
                  {r.found
                    ? <span className="badge bg-emerald-100 text-emerald-700">{localizeStatus(r.status || "", lang)}</span>
                    : <span className="badge bg-rose-100 text-rose-700">{t("check.missing")}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

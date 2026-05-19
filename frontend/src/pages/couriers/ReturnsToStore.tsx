import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { Search, Send, Plus, X } from "lucide-react";
import { api } from "../../lib/api";
import { useT, useLanguage } from "../../i18n/LanguageContext";
import { useToast } from "../../components/ui/Toast";
import { currency } from "../../lib/format";
import { localizeStatus } from "../../lib/statuses";

type Row = { number: string; found: boolean; shipmentId?: number; merchant?: string; customer?: string; phone?: string; cod?: number; status?: string };

export default function ReturnsToStore() {
  const t = useT();
  const { lang } = useLanguage();
  const toast = useToast();
  const [num, setNum] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  async function addNumber() {
    const n = num.trim();
    if (!n) return;
    if (rows.find((r) => r.number === n)) { setNum(""); return; }
    try {
      const r = await api.post("/shipments/check", { numbers: [n] });
      const f = r.data.found[0];
      if (!f) {
        setRows((rs) => [...rs, { number: n, found: false }]);
      } else {
        const det = await api.get("/shipments", { params: { scope: "all", per_page: 1, search: n } });
        const sh = det.data.data[0];
        setRows((rs) => [...rs, { number: n, found: true, shipmentId: sh?.id, merchant: sh?.senderName, customer: sh?.customerName, phone: sh?.customerPhone, cod: sh?.cod, status: sh?.status }]);
      }
      setNum("");
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
  }

  function remove(n: string) { setRows((rs) => rs.filter((r) => r.number !== n)); }

  async function send() {
    const valid = rows.filter((r) => r.found && r.shipmentId);
    if (!valid.length) return toast.error(t("toast.invalidNumbers"));
    setBusy(true);
    try {
      await api.post("/operations/return-to-merchant", { shipmentIds: valid.map((r) => r.shipmentId) });
      toast.success(t("toast.sent"));
      setRows([]);
    } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
    finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title={t("rts.title")} subtitle={t("rts.subtitle")} />
      <div className="card p-3 mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={num}
            onChange={(e) => setNum(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNumber())}
            className="input ps-9"
            placeholder={t("rts.shipmentNumber")}
          />
        </div>
        <button onClick={addNumber} className="btn-outline"><Plus size={16} /></button>
        <button onClick={send} disabled={busy || rows.filter((r) => r.found).length === 0} className="btn-primary">
          <Send size={16} /> {busy ? "..." : t("rts.sendShipments")}
        </button>
        <span className="text-sm text-slate-500">{t("rts.allShipments")} ({rows.length})</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th">{t("follow.col.shipment")}</th>
              <th className="th">{t("rts.col.merchant")}</th>
              <th className="th">{t("rts.col.buyer")}</th>
              <th className="th">{t("rts.col.buyerPhone")}</th>
              <th className="th">{t("follow.col.cod")}</th>
              <th className="th">{t("rts.col.policyStatus")}</th>
              <th className="th">{t("shipments.col.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="td text-center text-slate-400 py-8">{t("rts.addToStart")}</td></tr>
            ) : rows.map((r) => (
              <tr key={r.number} className={r.found ? "tr" : "bg-rose-50/40 dark:bg-rose-900/10"}>
                <td className="td font-mono font-bold">{r.number}</td>
                <td className="td">{r.merchant || "—"}</td>
                <td className="td">{r.customer || "—"}</td>
                <td className="td">{r.phone || "—"}</td>
                <td className="td">{r.cod != null ? currency(r.cod) : "—"}</td>
                <td className="td">
                  {r.found
                    ? <span className="badge bg-emerald-100 text-emerald-700">{localizeStatus(r.status || "", lang)}</span>
                    : <span className="badge bg-rose-100 text-rose-700">{t("check.missing")}</span>}
                </td>
                <td className="td"><button onClick={() => remove(r.number)} className="text-rose-600"><X size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

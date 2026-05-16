import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { Send, Trash2, Plus, X } from "lucide-react";
import { api } from "../../lib/api";
import { useT } from "../../i18n/LanguageContext";
import { useToast } from "../../components/ui/Toast";
import { currency } from "../../lib/format";
import { localizeStatus } from "../../lib/statuses";
import { useLanguage } from "../../i18n/LanguageContext";

type Row = {
  number: string;
  found: boolean;
  shipmentId?: number;
  merchant?: string;
  customer?: string;
  phone?: string;
  address?: string;
  cod?: number;
  status?: string;
};

export default function DistributeToCouriers({ isReturns = false }: { isReturns?: boolean }) {
  const t = useT();
  const { lang } = useLanguage();
  const toast = useToast();
  const [num, setNum] = useState("");
  const [courierId, setCourierId] = useState<number | "">("");
  const [couriers, setCouriers] = useState<any[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/couriers").then((r) => setCouriers(r.data.data || []));
  }, []);

  async function addNumber() {
    const n = num.trim();
    if (!n) return;
    if (rows.find((r) => r.number === n)) { setNum(""); return; }
    try {
      const r = await api.post("/shipments/check", { numbers: [n] });
      const found = r.data.found[0];
      if (!found) {
        setRows((rs) => [...rs, { number: n, found: false }]);
      } else {
        // fetch details
        const det = await api.get("/shipments", { params: { scope: "all", per_page: 1, search: n } });
        const sh = det.data.data[0];
        setRows((rs) => [...rs, {
          number: n, found: true, shipmentId: sh?.id,
          merchant: sh?.senderName, customer: sh?.customerName,
          phone: sh?.customerPhone, address: undefined,
          cod: sh?.cod, status: sh?.status,
        }]);
      }
      setNum("");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || t("toast.error"));
    }
  }

  function remove(n: string) {
    setRows((rs) => rs.filter((r) => r.number !== n));
  }

  async function send() {
    const valid = rows.filter((r) => r.found && r.shipmentId);
    if (!valid.length) return toast.error(t("toast.invalidNumbers"));
    if (isReturns) {
      setBusy(true);
      try {
        await api.post("/operations/return-to-merchant", { shipmentIds: valid.map((r) => r.shipmentId) });
        toast.success(t("toast.sent"));
        setRows([]);
      } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
      finally { setBusy(false); }
    } else {
      if (!courierId) return toast.error(t("toast.selectCourier"));
      setBusy(true);
      try {
        await api.post("/operations/assign-courier", { shipmentIds: valid.map((r) => r.shipmentId), courierId });
        toast.success(t("toast.assigned"));
        setRows([]); setCourierId("");
      } catch (e: any) { toast.error(e?.response?.data?.error || t("toast.error")); }
      finally { setBusy(false); }
    }
  }

  return (
    <>
      <PageHeader title={t("ops.assignTitle")} subtitle={t("ops.assignSubtitle")} />
      <div className="card p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex gap-2">
          <input
            className="input flex-1" placeholder={t("follow.col.shipment")}
            value={num} onChange={(e) => setNum(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNumber())}
          />
          <button onClick={addNumber} className="btn-outline" title={t("btn.add")}><Plus size={16} /></button>
        </div>
        {!isReturns && (
          <select className="input" value={courierId} onChange={(e) => setCourierId(Number(e.target.value) || "")}>
            <option value="">{t("ops.chooseCourier")}</option>
            {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <button onClick={send} disabled={busy || rows.filter((r) => r.found).length === 0} className="btn-primary">
          <Send size={16} /> {busy ? "..." : t("rts.sendShipments")}
        </button>
      </div>

      <div className="text-sm text-slate-500 mb-2">{t("rts.allShipments")} ({rows.length})</div>

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
                    : <span className="badge bg-rose-100 text-rose-700">{t("check.missing")}</span>
                  }
                </td>
                <td className="td">
                  <button onClick={() => remove(r.number)} className="text-rose-600"><X size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

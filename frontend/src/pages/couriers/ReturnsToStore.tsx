import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { Search, Send } from "lucide-react";
import { useT } from "../../i18n/LanguageContext";

export default function ReturnsToStore() {
  const t = useT();
  const [num, setNum] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  return (
    <>
      <PageHeader title={t("rts.title")} subtitle={t("rts.subtitle")} />
      <div className="card p-3 mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={num} onChange={(e) => setNum(e.target.value)} className="input ps-9" placeholder={t("rts.shipmentNumber")} />
        </div>
        <button className="btn-primary"><Send size={16} /> {t("rts.sendShipments")}</button>
        <span className="text-sm text-slate-500">{t("rts.allShipments")} ({rows.length})</span>
      </div>

      <ScanTable rows={rows} />
    </>
  );
}

export function ScanTable({ rows }: { rows: any[] }) {
  const t = useT();
  return (
    <div className="table-wrap">
      <table className="table">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th className="th">{t("follow.col.shipment")}</th>
            <th className="th">{t("rts.col.merchant")}</th>
            <th className="th">{t("rts.col.buyer")}</th>
            <th className="th">{t("rts.col.buyerPhone")}</th>
            <th className="th">{t("rts.col.buyerAddress")}</th>
            <th className="th">{t("follow.col.cod")}</th>
            <th className="th">{t("follow.col.shipping")}</th>
            <th className="th">{t("rts.col.policyStatus")}</th>
            <th className="th">{t("shipments.col.actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.length === 0 ? (
            <tr><td className="td text-center text-slate-400 py-8" colSpan={9}>{t("rts.addToStart")}</td></tr>
          ) : rows.map((r, i) => (
            <tr key={i} className="tr">
              <td className="td font-mono">{r.number}</td>
              <td className="td">{r.merchant}</td>
              <td className="td">{r.customer}</td>
              <td className="td">{r.phone}</td>
              <td className="td">{r.address}</td>
              <td className="td">{r.cod}</td>
              <td className="td">{r.shipping}</td>
              <td className="td">{r.status}</td>
              <td className="td"><button className="text-rose-600 text-sm">{t("btn.delete")}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

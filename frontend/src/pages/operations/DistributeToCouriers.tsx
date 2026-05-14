import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { Send } from "lucide-react";
import { api } from "../../lib/api";
import { useT } from "../../i18n/LanguageContext";

export default function DistributeToCouriers() {
  const t = useT();
  const [num, setNum] = useState("");
  const [courierId, setCourierId] = useState<number | "">("");
  const [couriers, setCouriers] = useState<any[]>([]);

  useEffect(() => { api.get("/couriers").then((r) => setCouriers(r.data.data || [])); }, []);

  return (
    <>
      <PageHeader title={t("ops.assignTitle")} subtitle={t("ops.assignSubtitle")} />
      <div className="card p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="input" placeholder={t("follow.col.shipment")} value={num} onChange={(e) => setNum(e.target.value)} />
        <select className="input" value={courierId} onChange={(e) => setCourierId(Number(e.target.value) || "")}>
          <option value="">{t("ops.chooseCourier")}</option>
          {couriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn-primary"><Send size={16} /> {t("rts.sendShipments")}</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th w-10"><input type="checkbox" /></th>
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
          <tbody><tr><td colSpan={10} className="td text-center text-slate-400 py-8">{t("ops.empty")}</td></tr></tbody>
        </table>
      </div>
    </>
  );
}

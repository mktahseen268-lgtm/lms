import { useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { FileText, FileSpreadsheet, Eye } from "lucide-react";
import { SHIPMENT_STATUSES, localizeStatus } from "../lib/statuses";
import { useT, useLanguage } from "../i18n/LanguageContext";
import { api } from "../lib/api";
import { useToast } from "../components/ui/Toast";

export default function Reports() {
  const t = useT();
  const { lang } = useLanguage();
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [merchant, setMerchant] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [merchants, setMerchants] = useState<{ id: number; name: string }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/clients").then((r) => setMerchants(r.data.data || [])).catch(() => {});
  }, []);

  async function download(kind: "pdf" | "excel" | "view") {
    setBusy(true);
    try {
      const path = kind === "pdf" ? "/reports/download-pdf" : kind === "excel" ? "/reports/download-excel" : "/reports";
      const res = await api.get(path, {
        params: { status: status || undefined, merchant: merchant || undefined, from: from || undefined, to: to || undefined },
        responseType: kind === "view" ? "json" : "blob",
      });
      if (kind === "view") {
        const w = window.open("", "_blank");
        if (!w) return;
        w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>Report</title>
<style>body{font-family:Cairo,Tahoma;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;font-size:12px}th{background:#f3e8ff;text-align:start}</style>
</head><body><h1>${t("reports.title")}</h1>
<table><thead><tr><th>${t("follow.col.shipment")}</th><th>${t("rts.col.merchant")}</th><th>${t("shipments.col.customer")}</th><th>${t("courier.add.province")}</th><th>${t("follow.col.cod")}</th><th>${t("shipments.col.status")}</th></tr></thead><tbody>
${(res.data.data || []).map((r: any) => `<tr><td>${r.number}</td><td>${r.client?.name || ""}</td><td>${r.customerName}</td><td>${r.province}</td><td>${r.cod}</td><td>${r.status}</td></tr>`).join("")}
</tbody></table></body></html>`);
        w.document.close();
      } else {
        const ext = kind === "pdf" ? "html" : "csv";
        const blob = new Blob([res.data], { type: kind === "pdf" ? "text/html" : "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `report-${Date.now()}.${ext}`;
        a.click(); URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || t("toast.error"));
    } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader title={t("reports.title")} subtitle={t("reports.subtitle")} />
      <div className="card p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="label">{t("reports.status")}</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t("reports.choose")}</option>
            {SHIPMENT_STATUSES.filter((s) => s !== "كل الحالات").map((s) => <option key={s} value={s}>{localizeStatus(s, lang)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t("reports.merchant")}</label>
          <select className="input" value={merchant} onChange={(e) => setMerchant(e.target.value)}>
            <option value="">{t("reports.choose")}</option>
            {merchants.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div><label className="label">{t("reports.fromDate")}</label><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label">{t("reports.toDate")}</label><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => download("pdf")} className="btn-primary"><FileText size={16} /> {t("reports.pdf")}</button>
        <button disabled={busy} onClick={() => download("excel")} className="btn-success"><FileSpreadsheet size={16} /> {t("reports.excel")}</button>
        <button disabled={busy} onClick={() => download("view")} className="btn-outline"><Eye size={16} /> {t("reports.view")}</button>
      </div>
    </>
  );
}

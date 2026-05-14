import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { FileText, FileSpreadsheet, Eye } from "lucide-react";
import { SHIPMENT_STATUSES, localizeStatus } from "../lib/statuses";
import { useT, useLanguage } from "../i18n/LanguageContext";

export default function Reports() {
  const t = useT();
  const { lang } = useLanguage();
  const [status, setStatus] = useState("");
  const [merchant, setMerchant] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function open(kind: "pdf" | "excel" | "view") {
    const qs = new URLSearchParams({ status, merchant, from, to }).toString();
    if (kind === "pdf") window.open(`/api/reports/download-pdf?${qs}`);
    else if (kind === "excel") window.open(`/api/reports/download-excel?${qs}`);
    else window.open(`/api/reports?${qs}`);
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
          </select>
        </div>
        <div><label className="label">{t("reports.fromDate")}</label><input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="label">{t("reports.toDate")}</label><input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => open("pdf")} className="btn-primary"><FileText size={16} /> {t("reports.pdf")}</button>
        <button onClick={() => open("excel")} className="btn-success"><FileSpreadsheet size={16} /> {t("reports.excel")}</button>
        <button onClick={() => open("view")} className="btn-outline"><Eye size={16} /> {t("reports.view")}</button>
      </div>
    </>
  );
}

import { useState, ReactNode } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { Search, Send, FileSpreadsheet } from "lucide-react";
import { useT } from "../../i18n/LanguageContext";

type Props = {
  title: string;
  subtitle?: string;
  showBranchSelector?: boolean;
  primaryLabel: string;
  showExportToExcel?: boolean;
  extra?: ReactNode;
};

export default function ScanShipmentsView({ title, subtitle, showBranchSelector, primaryLabel, showExportToExcel, extra }: Props) {
  const t = useT();
  const [numbers, setNumbers] = useState("");
  const [branch, setBranch] = useState("");
  const [rows, setRows] = useState<any[]>([]);

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="card p-4 mb-4 space-y-3">
        {showBranchSelector && (
          <div>
            <label className="label">{t("scan.chooseBranch")}</label>
            <select className="input md:w-80" value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="">{t("scan.chooseAction")}</option>
              <option>{t("scan.main")}</option>
              <option>{t("scan.giza")}</option>
            </select>
          </div>
        )}
        <div>
          <label className="label">{t("scan.numbers")}</label>
          <textarea className="input min-h-[140px] font-mono" value={numbers} onChange={(e) => setNumbers(e.target.value)} placeholder={t("scan.numbersPh")} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-outline"><Search size={16} /> {t("scan.check")}</button>
          <button className="btn-primary"><Send size={16} /> {primaryLabel}</button>
          {showExportToExcel && <button className="btn-success"><FileSpreadsheet size={16} /> {t("btn.exportExcel")}</button>}
          <span className="text-sm text-slate-500">{t("rts.allShipments")} ({rows.length})</span>
        </div>
        {extra}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th">{t("shipments.col.type")}</th>
              <th className="th">{t("couriers.col.created")}</th>
              <th className="th">{t("follow.col.shipment")}</th>
              <th className="th">{t("follow.col.sender")}</th>
              <th className="th">{t("follow.col.courier")}</th>
              <th className="th">{t("follow.col.recipient")}</th>
              <th className="th">{t("follow.col.recipientPhone")}</th>
              <th className="th">{t("follow.col.cod")}</th>
              <th className="th">{t("courier.add.province")}</th>
              <th className="th">{t("follow.col.address")}</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr><td colSpan={11} className="td text-center text-slate-400 py-8">{t("scan.empty")}</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

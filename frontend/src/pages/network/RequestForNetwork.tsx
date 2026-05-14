import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { EG_PROVINCES, EG_PROVINCES_EN } from "../../lib/statuses";
import { Send, Trash2 } from "lucide-react";
import { useT, useLanguage } from "../../i18n/LanguageContext";

type Row = {
  province: string; enabled: boolean;
  price: number; replacePrice: number; returnPrice: number;
  costReturn: number; weightLimit: number; extraWeightPrice: number;
};

export default function RequestForNetwork() {
  const t = useT();
  const { lang } = useLanguage();
  const [rows, setRows] = useState<Row[]>(
    EG_PROVINCES.map((p) => ({ province: p, enabled: false, price: 50, replacePrice: 35, returnPrice: 25, costReturn: 0, weightLimit: 5, extraWeightPrice: 10 }))
  );
  const [agree, setAgree] = useState(false);

  function upd(i: number, p: Partial<Row>) { setRows((arr) => arr.map((r, idx) => (idx === i ? { ...r, ...p } : r))); }
  const provinceLabels = lang === "ar" ? EG_PROVINCES : EG_PROVINCES_EN;

  return (
    <>
      <PageHeader title={t("netReq.title")} subtitle={t("netReq.subtitle")} />
      <div className="card p-3 mb-4 text-sm text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
        {t("netReq.notice")}
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th">{t("netReq.col.enable")}</th>
              <th className="th">{t("netReq.col.province")}</th>
              <th className="th">{t("netReq.col.price")}</th>
              <th className="th">{t("netReq.col.replace")}</th>
              <th className="th">{t("netReq.col.return")}</th>
              <th className="th">{t("netReq.col.costReturn")}</th>
              <th className="th">{t("netReq.col.weight")}</th>
              <th className="th">{t("netReq.col.extra")}</th>
              <th className="th">{t("netReq.col.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r, i) => (
              <tr key={r.province} className="tr">
                <td className="td"><input type="checkbox" checked={r.enabled} onChange={(e) => upd(i, { enabled: e.target.checked })} /></td>
                <td className="td font-semibold">{provinceLabels[i]}</td>
                <td className="td"><input type="number" className="input !w-20" value={r.price} onChange={(e) => upd(i, { price: Number(e.target.value) })} /></td>
                <td className="td"><input type="number" className="input !w-20" value={r.replacePrice} onChange={(e) => upd(i, { replacePrice: Number(e.target.value) })} /></td>
                <td className="td"><input type="number" className="input !w-20" value={r.returnPrice} onChange={(e) => upd(i, { returnPrice: Number(e.target.value) })} /></td>
                <td className="td"><input type="number" className="input !w-20" value={r.costReturn} onChange={(e) => upd(i, { costReturn: Number(e.target.value) })} /></td>
                <td className="td"><input type="number" className="input !w-20" value={r.weightLimit} onChange={(e) => upd(i, { weightLimit: Number(e.target.value) })} /></td>
                <td className="td"><input type="number" className="input !w-20" value={r.extraWeightPrice} onChange={(e) => upd(i, { extraWeightPrice: Number(e.target.value) })} /></td>
                <td className="td"><button className="text-rose-600 p-1"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          {t("netReq.agree")}
        </label>
        <button disabled={!agree} className="btn-primary"><Send size={16} /> {t("netReq.send")}</button>
      </div>
    </>
  );
}

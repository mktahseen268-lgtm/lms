import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../lib/api";
import { currency } from "../../lib/format";
import { useT } from "../../i18n/LanguageContext";

export default function NetworkWallet() {
  const t = useT();
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api.get("/accounts/network").then((r) => setRows(r.data.data || [])); }, []);

  return (
    <>
      <PageHeader title={t("networkWallet.title")} subtitle={t("networkWallet.subtitle")} />
      <div className="table-wrap">
        <table className="table">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="th">{t("networkWallet.col.company")}</th>
              <th className="th">{t("networkWallet.col.due")}</th>
              <th className="th">{t("networkWallet.col.owed")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.length === 0 ? (
              <tr><td colSpan={3} className="td text-center text-slate-400 py-8">{t("sellerAcc.noData")}</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="tr">
                <td className="td font-semibold">{r.name}</td>
                <td className="td text-emerald-600 font-bold">{currency(r.due)}</td>
                <td className="td text-rose-600 font-bold">{currency(r.owed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
